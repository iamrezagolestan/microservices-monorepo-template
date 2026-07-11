package decision

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
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

func post(t *testing.T, h *Handler, body string) int {
	t.Helper()
	req := httptest.NewRequestWithContext(
		context.Background(),
		http.MethodPost,
		"/internal/authorize",
		strings.NewReader(body),
	)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	_, _ = io.Copy(io.Discard, rec.Body)
	return rec.Code
}

// The coarse gate is a claim check: operator trait + AAL2, and — critically — no
// SpiceDB call, so a product-authz outage cannot lock operators out (ADR-0017).
func TestCoarseClaimGate(t *testing.T) {
	t.Parallel()
	checker := &fakeChecker{}
	h := New(checker, false, nil) // coarse-only (fine layer off)

	cases := []struct {
		name string
		body string
		want int
	}{
		{"operator + aal2", `{"subject":"alice","tool":"o11y","aal":"aal2","operator":"true"}`, http.StatusOK},
		{"operator + aal2, any tool", `{"subject":"alice","tool":"network","aal":"aal2","operator":"true"}`, http.StatusOK},
		{"operator but aal1", `{"subject":"alice","tool":"o11y","aal":"aal1","operator":"true"}`, http.StatusForbidden},
		{"aal2 but not operator", `{"subject":"bob","tool":"o11y","aal":"aal2","operator":"false"}`, http.StatusForbidden},
		{"operator trait absent", `{"subject":"bob","tool":"o11y","aal":"aal2"}`, http.StatusForbidden},
		{"anonymous", `{"subject":"","tool":"o11y","aal":"aal2","operator":"true"}`, http.StatusForbidden},
		{"malformed json", `not json`, http.StatusBadRequest},
	}
	for _, tc := range cases {
		t.Run(
			tc.name,
			func(t *testing.T) {
				t.Parallel()
				got := post(t, h, tc.body)
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
	h := New(&fakeChecker{answers: map[string]bool{"view dashboard:o11y": true}}, true, nil)

	granted := post(t, h, `{"subject":"alice","tool":"o11y","aal":"aal2","operator":"true"}`)
	if granted != http.StatusOK {
		t.Fatalf("granted tool status = %d, want 200", granted)
	}
	ungranted := post(t, h, `{"subject":"alice","tool":"network","aal":"aal2","operator":"true"}`)
	if ungranted != http.StatusForbidden {
		t.Fatalf("ungranted tool status = %d, want 403", ungranted)
	}
	// The coarse gate still applies first: a non-operator is denied before the fine check.
	nonOperator := post(t, h, `{"subject":"bob","tool":"o11y","aal":"aal2","operator":"false"}`)
	if nonOperator != http.StatusForbidden {
		t.Fatalf("non-operator status = %d, want 403", nonOperator)
	}
}

func TestMethodNotAllowed(t *testing.T) {
	t.Parallel()
	h := New(&fakeChecker{}, false, nil)
	req := httptest.NewRequestWithContext(
		context.Background(),
		http.MethodGet,
		"/internal/authorize",
		nil,
	)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("GET status = %d, want 405", rec.Code)
	}
}
