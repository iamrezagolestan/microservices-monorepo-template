package handlers

import (
	"context"
	"testing"

	"github.com/tabmadi/microservices-monorepo-template/libs/go/apierr"
	orgs "github.com/tabmadi/microservices-monorepo-template/libs/go/sdks/orgs"
)

// UpdateOrg rejects an empty name before any DB access (ADR-0006), so a nil
// store is fine here.
func TestUpdateOrgValidation(t *testing.T) {
	t.Parallel()
	h := &Handlers{}
	_, err := h.UpdateOrg(context.Background(), &orgs.OrgInput{Name: ""}, orgs.UpdateOrgParams{})
	e, ok := apierr.As(err)
	if !ok {
		t.Fatalf("want *apierr.Error, got %v", err)
	}
	if e.Status != 400 {
		t.Fatalf("status = %d, want 400", e.Status)
	}
}
