// Package handlers implement the ogen-generated orgs.Handler interface (ADR-0008).
// Hand-written code imports the generated schema types and the sqlc store; it
// never shadows them with parallel structs or inline SQL.
package handlers

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.temporal.io/sdk/client"

	"github.com/tabmadi/microservices-monorepo-template/libs/go/apierr"
	orgs "github.com/tabmadi/microservices-monorepo-template/libs/go/sdks/orgs"
	"github.com/tabmadi/microservices-monorepo-template/services/orgs/internal/store"
	"github.com/tabmadi/microservices-monorepo-template/services/orgs/internal/workflows"
)

const serviceName = "orgs"

type Handlers struct {
	q  store.Querier
	tc client.Client
}

func New(db *pgxpool.Pool, tc client.Client) *Handlers {
	return &Handlers{q: store.New(db), tc: tc}
}

var _ orgs.Handler = (*Handlers)(nil)

func (h *Handlers) CreateOrg(ctx context.Context, req *orgs.OrgInput) (*orgs.Org, error) {
	if req.Name == "" {
		return nil, apierr.BadRequest("name required")
	}
	row, err := h.q.CreateOrg(ctx, req.Name)
	if err != nil {
		return nil, apierr.Internal(err.Error())
	}
	return &orgs.Org{ID: row.ID.Bytes, Name: row.Name}, nil
}

func (h *Handlers) GetOrg(ctx context.Context, params orgs.GetOrgParams) (*orgs.Org, error) {
	row, err := h.q.GetOrg(ctx, pgtype.UUID{Bytes: params.ID, Valid: true})
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apierr.NotFound("org")
	}
	if err != nil {
		return nil, apierr.Internal(err.Error())
	}
	return &orgs.Org{ID: row.ID.Bytes, Name: row.Name}, nil
}

// OnIdentityCreated is the Kratos post-registration webhook (ADR-0010/0006). It
// starts the RegisterUser workflow rather than writing directly: creating the
// personal org spans the orgs DB and the SpiceDB owner tuple (an authz-relevant
// mutation), so it must run as a Temporal dual-write, never a bare DB write. The
// workflow ID is derived from the identity, so a duplicate webhook delivery is a
// no-op (Temporal rejects the duplicate ID).
func (h *Handlers) OnIdentityCreated(ctx context.Context, req *orgs.OnIdentityCreatedReq) error {
	identityID, ok := req.IdentityID.Get()
	if !ok || identityID == "" {
		return apierr.BadRequest("identity_id required")
	}
	email, _ := req.Email.Get()

	_, err := h.tc.ExecuteWorkflow(
		ctx,
		client.StartWorkflowOptions{
			ID:        "register-user-" + identityID,
			TaskQueue: serviceName + "-queue",
		},
		workflows.RegisterUser,
		workflows.RegisterInput{IdentityID: identityID, Email: email},
	)
	if err != nil {
		return apierr.Internal(err.Error())
	}
	return nil
}

func (h *Handlers) ListOrgs(ctx context.Context) ([]orgs.Org, error) {
	rows, err := h.q.ListOrgs(ctx)
	if err != nil {
		return nil, apierr.Internal(err.Error())
	}
	out := make([]orgs.Org, 0, len(rows))
	for _, r := range rows {
		out = append(out, orgs.Org{ID: r.ID.Bytes, Name: r.Name})
	}
	return out, nil
}

func (h *Handlers) UpdateOrg(ctx context.Context, req *orgs.OrgInput, params orgs.UpdateOrgParams) (*orgs.Org, error) {
	if req.Name == "" {
		return nil, apierr.BadRequest("name required")
	}
	row, err := h.q.UpdateOrg(
		ctx,
		store.UpdateOrgParams{
			ID:   pgtype.UUID{Bytes: params.ID, Valid: true},
			Name: req.Name,
		},
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apierr.NotFound("org")
	}
	if err != nil {
		return nil, apierr.Internal(err.Error())
	}
	return &orgs.Org{ID: row.ID.Bytes, Name: row.Name}, nil
}

func (h *Handlers) DeleteOrg(ctx context.Context, params orgs.DeleteOrgParams) error {
	err := h.q.DeleteOrg(ctx, pgtype.UUID{Bytes: params.ID, Valid: true})
	if err != nil {
		return apierr.Internal(err.Error())
	}
	return nil
}

// NewError maps a handler error onto the generated RFC 7807 response.
func (h *Handlers) NewError(_ context.Context, err error) *orgs.ErrorStatusCode {
	e, ok := apierr.As(err)
	if ok {
		return &orgs.ErrorStatusCode{StatusCode: e.Status, Response: orgs.Problem{Code: e.Code, Message: e.Message}}
	}
	return &orgs.ErrorStatusCode{StatusCode: 500, Response: orgs.Problem{Code: "internal", Message: err.Error()}}
}
