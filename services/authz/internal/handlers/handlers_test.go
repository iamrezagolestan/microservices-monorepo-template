package handlers

import (
	"context"
	"testing"

	authzsdk "github.com/tabmadi/microservices-monorepo-template/libs/go/sdks/authz"
)

const (
	subjectAlice = "alice"
	subjectBob   = "bob"
	toolO11y     = "o11y"
	toolNetwork  = "network"
)

// fakeChecker returns canned answers keyed by "permission resource". It also
// records whether it was called, so tests can assert the coarse gate never
// touches SpiceDB.
type fakeChecker struct {
	answers map[string]bool
	called  bool
}

func (f *fakeChecker) Allowed(_ context.Context, _, permission, resource string) (bool, error) {
	f.called = true
	return f.answers[permission+" "+resource], nil
}

func req(subject, tool, aal, operator string) *authzsdk.AuthorizeRequest {
	return &authzsdk.AuthorizeRequest{Subject: subject, Tool: tool, Aal: aal, Operator: operator}
}

// decideStatus runs Authorize and reduces the response variant to its HTTP status:
// 200 for allow (AuthorizeOK), 403 for deny (Problem).
func decideStatus(t *testing.T, h *Handlers, r *authzsdk.AuthorizeRequest) int {
	t.Helper()
	res, err := h.Authorize(context.Background(), r)
	if err != nil {
		t.Fatalf("Authorize returned error: %v", err)
	}
	switch res.(type) {
	case *authzsdk.AuthorizeOK:
		return 200
	case *authzsdk.Problem:
		return 403
	default:
		t.Fatalf("unexpected response type %T", res)
		return 0
	}
}

// The coarse gate is a claim check: operator trait + AAL2, and — critically — no
// SpiceDB call, so a product-authz outage cannot lock operators out (ADR-0017).
func TestCoarseClaimGate(t *testing.T) {
	t.Parallel()
	checker := &fakeChecker{}
	h := New(checker, nil, false, nil) // coarse-only (fine layer off)

	cases := []struct {
		name string
		req  *authzsdk.AuthorizeRequest
		want int
	}{
		{"operator + aal2", req(subjectAlice, toolO11y, aalLevel2, operatorTraitTrue), 200},
		{"operator + aal2, any tool", req(subjectAlice, toolNetwork, aalLevel2, operatorTraitTrue), 200},
		{"operator but aal1", req(subjectAlice, toolO11y, "aal1", operatorTraitTrue), 403},
		{"aal2 but not operator", req(subjectBob, toolO11y, aalLevel2, "false"), 403},
		{"operator trait empty", req(subjectBob, toolO11y, aalLevel2, ""), 403},
		{"anonymous", req("", toolO11y, aalLevel2, operatorTraitTrue), 403},
	}
	for _, tc := range cases {
		t.Run(
			tc.name,
			func(t *testing.T) {
				t.Parallel()
				got := decideStatus(t, h, tc.req)
				if got != tc.want {
					t.Fatalf("status = %d, want %d", got, tc.want)
				}
			},
		)
	}

	if checker.called {
		t.Fatal("coarse gate called SpiceDB; it must not (break-glass independence, ADR-0017)")
	}
}

// The optional fine gate adds a per-tool SpiceDB check on top of the coarse gate.
func TestFineGrainedGate(t *testing.T) {
	t.Parallel()
	// alice holds o11y but not network.
	h := New(&fakeChecker{answers: map[string]bool{"view dashboard:o11y": true}}, nil, true, nil)

	granted := decideStatus(t, h, req(subjectAlice, toolO11y, aalLevel2, operatorTraitTrue))
	if granted != 200 {
		t.Fatalf("granted tool status = %d, want 200", granted)
	}
	ungranted := decideStatus(t, h, req(subjectAlice, toolNetwork, aalLevel2, operatorTraitTrue))
	if ungranted != 403 {
		t.Fatalf("ungranted tool status = %d, want 403", ungranted)
	}
	// The coarse gate still applies first: a non-operator is denied before the fine check.
	nonOperator := decideStatus(t, h, req(subjectBob, toolO11y, aalLevel2, "false"))
	if nonOperator != 403 {
		t.Fatalf("non-operator status = %d, want 403", nonOperator)
	}
}
