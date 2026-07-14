// Package handlers implements the ogen-generated authz.Handler interface
// (ADR-0008): authz is a spec-first service like every other HTTP service, even
// though it owns no database and sits east-west behind Oathkeeper (ADR-0017).
//
// Two operations:
//
//	Authorize     — the ops-tier decision for Oathkeeper's remote_json authorizer.
//	                200 = allow, 403 = deny. Deny is a valid DECISION, not an error,
//	                so it returns the 403 response variant with nil error; only real
//	                infrastructure failures return an error (→ NewError → 5xx).
//	CreateOperator — mints a Kratos identity with the `operator` trait and grants
//	                group:operator#member in SpiceDB (ADR-0012), the generated admin
//	                page target (x-admin: action).
package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"

	"github.com/tabmadi/microservices-monorepo-template/libs/go/apierr"
	"github.com/tabmadi/microservices-monorepo-template/libs/go/authz"
	authzsdk "github.com/tabmadi/microservices-monorepo-template/libs/go/sdks/authz"
)

const (
	aalLevel2         = "aal2" // operator MFA assurance level (ADR-0010)
	operatorTraitTrue = "true" // the `operator` identity trait, when set
)

type Handlers struct {
	checker     authz.Checker
	granter     authz.Granter
	fineGrained bool // when true, also require dashboard:<tool>#view in SpiceDB
	kratosAdmin string
	log         *slog.Logger
}

func New(checker authz.Checker, granter authz.Granter, fineGrained bool, log *slog.Logger) *Handlers {
	if log == nil {
		log = slog.Default()
	}
	admin := os.Getenv("KRATOS_ADMIN_URL")
	if admin == "" {
		admin = "http://ory-kratos-admin.platform.svc.cluster.local"
	}
	return &Handlers{checker: checker, granter: granter, fineGrained: fineGrained, kratosAdmin: admin, log: log}
}

var _ authzsdk.Handler = (*Handlers)(nil)

// Authorize is the ops-tier edge authorizer (ADR-0017). It answers in two layers:
//
//	coarse (mandatory) — a CLAIM check: the `operator` trait and AAL2. It makes NO
//	    SpiceDB call, so a product-authz outage cannot lock operators out of the
//	    dashboards they need to diagnose it (break-glass independence).
//	fine (optional) — the subject holds dashboard:<tool>#view in SpiceDB, enabled
//	    per-project via OPS_FINE_GRAINED.
//
// A bare authenticated session therefore never grants tool access.
func (h *Handlers) Authorize(ctx context.Context, req *authzsdk.AuthorizeRequest) (authzsdk.AuthorizeRes, error) {
	allowed, reason, err := h.decide(ctx, req)
	if err != nil {
		return nil, apierr.Internal(err.Error())
	}
	// Auth audit event (ADR-0017): who reached which tool, and the outcome.
	h.log.LogAttrs(
		ctx,
		slog.LevelInfo,
		"ops-authz decision",
		slog.String("subject", req.Subject),
		slog.String("tool", req.Tool),
		slog.Bool("allowed", allowed),
		slog.String("reason", reason),
	)
	if !allowed {
		return &authzsdk.Problem{Code: "forbidden", Message: reason}, nil
	}
	return &authzsdk.AuthorizeOK{}, nil
}

// CreateOperator mints a Kratos identity carrying the `operator` trait — the coarse
// ops-tier claim gate — and grants group:operator#member in SpiceDB to seed the
// optional fine per-tool layer (ADR-0012).
func (h *Handlers) CreateOperator(ctx context.Context, req *authzsdk.OperatorInput) (*authzsdk.Operator, error) {
	id, err := h.createKratosIdentity(ctx, req.Email, req.Password)
	if err != nil {
		h.log.Error("create kratos identity", "err", err)
		return nil, apierr.Internal("failed to create identity")
	}
	err = h.granter.Grant(ctx, "user:"+id, "member", "group:operator")
	if err != nil {
		h.log.Error("grant operator", "err", err, "id", id)
		return nil, apierr.Internal("failed to grant operator role")
	}
	return &authzsdk.Operator{ID: id, Email: req.Email}, nil
}

// ListIdentities returns every Kratos identity (product users and operators),
// flattened from traits — the console's read-only Users changelist (ADR-0012).
// Only authz may reach the Kratos admin API (network-policies/30-ory.yaml), so the
// console fetches this list through here rather than talking to Kratos directly.
func (h *Handlers) ListIdentities(ctx context.Context) ([]authzsdk.Identity, error) {
	ids, err := h.listKratosIdentities(ctx)
	if err != nil {
		h.log.Error("list kratos identities", "err", err)
		return nil, apierr.Internal("failed to list identities")
	}
	return ids, nil
}

// NewError maps a handler error onto the generated RFC 7807 default response.
func (h *Handlers) NewError(_ context.Context, err error) *authzsdk.ErrorStatusCode {
	e, ok := apierr.As(err)
	if ok {
		return &authzsdk.ErrorStatusCode{StatusCode: e.Status, Response: authzsdk.Problem{Code: e.Code, Message: e.Message}}
	}
	return &authzsdk.ErrorStatusCode{StatusCode: 500, Response: authzsdk.Problem{Code: "internal", Message: err.Error()}}
}

// decide returns the allow/deny decision and its reason. The error is non-nil only
// on an infrastructure failure (a SpiceDB call error), never on a plain deny.
func (h *Handlers) decide(ctx context.Context, req *authzsdk.AuthorizeRequest) (bool, string, error) {
	if req.Subject == "" {
		return false, "no session", nil
	}
	// Coarse gate — a CLAIM, not a Checker call: AAL2 session and the `operator`
	// trait. No SpiceDB is consulted, so a product-authz outage never locks
	// operators out.
	if req.Aal != aalLevel2 {
		return false, "aal2 required", nil
	}
	if req.Operator != operatorTraitTrue {
		return false, "not an operator", nil
	}
	// Fine gate (optional): per-tool grant in SpiceDB. Skipped unless enabled.
	if h.fineGrained {
		ok, err := h.checker.Allowed(ctx, "user:"+req.Subject, "view", "dashboard:"+req.Tool)
		if err != nil {
			return false, "", fmt.Errorf("checker: %w", err)
		}
		if !ok {
			return false, "no grant for " + req.Tool, nil
		}
	}
	return true, "ok", nil
}

// kratosIdentityBody is the request body for POST /admin/identities.
type kratosIdentityBody struct {
	SchemaID            string            `json:"schema_id"`
	Traits              kratosTraits      `json:"traits"`
	Credentials         kratosCredentials `json:"credentials"`
	VerifiableAddresses []kratosAddress   `json:"verifiable_addresses"`
}

type kratosTraits struct {
	Email    string `json:"email"`
	Operator bool   `json:"operator"`
}

type kratosCredentials struct {
	Password kratosPasswordCredential `json:"password"`
}

type kratosPasswordCredential struct {
	Config kratosPasswordConfig `json:"config"`
}

type kratosPasswordConfig struct {
	Password string `json:"password"`
}

type kratosAddress struct {
	Value    string `json:"value"`
	Via      string `json:"via"`
	Verified bool   `json:"verified"`
	Status   string `json:"status"`
}

// listKratosIdentities pages through GET /admin/identities and flattens each
// identity's traits into the admin-facing Identity shape.
func (h *Handlers) listKratosIdentities(ctx context.Context) ([]authzsdk.Identity, error) {
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		h.kratosAdmin+"/admin/identities",
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("call kratos: %w", err)
	}
	defer func() {
		closeErr := resp.Body.Close()
		if closeErr != nil {
			h.log.Error("close kratos response body", "err", closeErr)
		}
	}()
	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("kratos %d: %s", resp.StatusCode, b)
	}
	var raw []struct {
		ID     string `json:"id"`
		Traits struct {
			Email    string `json:"email"`
			Name     string `json:"name"`
			Operator bool   `json:"operator"`
		} `json:"traits"`
	}
	err = json.NewDecoder(resp.Body).Decode(&raw)
	if err != nil {
		return nil, fmt.Errorf("decode kratos response: %w", err)
	}
	out := make([]authzsdk.Identity, 0, len(raw))
	for _, r := range raw {
		id := authzsdk.Identity{ID: r.ID, Email: r.Traits.Email}
		if r.Traits.Name != "" {
			id.Name = authzsdk.NewOptString(r.Traits.Name)
		}
		id.Operator = authzsdk.NewOptBool(r.Traits.Operator)
		out = append(out, id)
	}
	return out, nil
}

func (h *Handlers) createKratosIdentity(ctx context.Context, email, password string) (string, error) {
	payload := kratosIdentityBody{
		SchemaID: "user_v1",
		Traits:   kratosTraits{Email: email, Operator: true},
		Credentials: kratosCredentials{
			Password: kratosPasswordCredential{
				Config: kratosPasswordConfig{Password: password},
			},
		},
		VerifiableAddresses: []kratosAddress{
			{Value: email, Via: "email", Verified: true, Status: "completed"},
		},
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		h.kratosAdmin+"/admin/identities",
		bytes.NewReader(body),
	)
	if err != nil {
		return "", fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("call kratos: %w", err)
	}
	defer func() {
		closeErr := resp.Body.Close()
		if closeErr != nil {
			h.log.Error("close kratos response body", "err", closeErr)
		}
	}()
	if resp.StatusCode != http.StatusCreated {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("kratos %d: %s", resp.StatusCode, b)
	}
	var out struct {
		ID string `json:"id"`
	}
	err = json.NewDecoder(resp.Body).Decode(&out)
	if err != nil {
		return "", fmt.Errorf("decode kratos response: %w", err)
	}
	return out.ID, nil
}
