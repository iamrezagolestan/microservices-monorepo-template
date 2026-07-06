// Package decision is the ops-tier edge authorizer (ADR-0017). Oathkeeper's
// remote_json authorizer POSTs {subject, tool, aal, operator} for each request to
// an operator dashboard; this handler returns 200 (allow) or 403 (deny) in two
// layers:
//
//	coarse (mandatory) — the operator claim: the session carries the `operator`
//	    trait and AAL2 (operator MFA, ADR-0010). This is a CLAIM check and makes
//	    NO SpiceDB call, so the ops debugging surface does not share fate with the
//	    product authorization plane — a SpiceDB outage cannot lock every operator
//	    out of the dashboards they need to diagnose it (ADR-0017, break-glass).
//	fine (optional) — the subject has dashboard:<tool>#view in SpiceDB, enabled
//	    per-project when per-tool grants are wanted (OPS_FINE_GRAINED).
//
// A bare authenticated session therefore never grants tool access.
package decision

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/tabmadi/microservices-monorepo-template/libs/go/authz"
)

// Request is the remote_json payload (see infra/auth/oathkeeper/access-rules.json).
type Request struct {
	Subject  string `json:"subject"`  // Kratos identity id; "" for anonymous
	Tool     string `json:"tool"`     // ops dashboard concept slug: o11y, network, …
	AAL      string `json:"aal"`      // authenticator_assurance_level from whoami
	Operator string `json:"operator"` // the `operator` identity trait ("true" when set)
}

// Handler authorizes ops-tier dashboard access. The coarse gate is a claim check;
// the optional fine gate uses SpiceDB.
type Handler struct {
	checker     authz.Checker
	fineGrained bool // when true, also require dashboard:<tool>#view in SpiceDB
	log         *slog.Logger
}

// New returns a Handler. With fineGrained false the coarse claim gate is the whole
// decision and no SpiceDB call is made; with it true, per-tool grants are also
// checked through the Checker.
func New(checker authz.Checker, fineGrained bool, log *slog.Logger) *Handler {
	if log == nil {
		log = slog.Default()
	}
	return &Handler{checker: checker, fineGrained: fineGrained, log: log}
}

// ServeHTTP handles POST /internal/authorize.
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req Request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	allowed, reason := h.authorize(r.Context(), req)
	// Auth audit event (ADR-0017, Phase 7): who reached which tool, and the
	// outcome — queryable by actor, resource, outcome.
	h.log.LogAttrs(
		r.Context(),
		slog.LevelInfo,
		"ops-authz decision",
		slog.String("subject", req.Subject),
		slog.String("tool", req.Tool),
		slog.Bool("allowed", allowed),
		slog.String("reason", reason),
	)
	if !allowed {
		http.Error(w, reason, http.StatusForbidden)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) authorize(ctx context.Context, req Request) (bool, string) {
	if req.Subject == "" {
		return false, "no session"
	}
	// Coarse gate — a CLAIM, not a Checker call (ADR-0017): the ops tier requires
	// an AAL2 session (operator MFA) and the `operator` trait. No SpiceDB is
	// consulted, so a product-authz outage never locks operators out.
	if req.AAL != "aal2" {
		return false, "aal2 required"
	}
	if req.Operator != "true" {
		return false, "not an operator"
	}
	// Fine gate (optional): per-tool grant in SpiceDB. Skipped unless the project
	// enables it, keeping the coarse gate free of any SpiceDB dependency.
	if h.fineGrained {
		ok, err := h.checker.Allowed(ctx, "user:"+req.Subject, "view", "dashboard:"+req.Tool)
		if err != nil {
			return false, "authz error"
		}
		if !ok {
			return false, "no grant for " + req.Tool
		}
	}
	return true, "ok"
}
