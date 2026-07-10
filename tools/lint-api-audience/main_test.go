package main

import "testing"

func TestCheck(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name     string
		audience string
		exposed  bool
		wantOK   bool
	}{
		{"public + edge route", audiencePublic, true, true},
		{"internal + east-west", audienceInternal, false, true},
		{"unset + not exposed (fail-closed)", "", false, true},
		{"public but no route", audiencePublic, false, false},
		{"edge-exposed but internal", audienceInternal, true, false},
		{"edge-exposed but unset → internal", "", true, false},
		{"unknown audience", "external", true, false},
	}
	for _, c := range cases {
		t.Run(
			c.name,
			func(t *testing.T) {
				t.Parallel()
				ok := check("svc", c.audience, c.exposed) == ""
				if ok != c.wantOK {
					t.Fatalf("check(%q, exposed=%v): ok=%v, want %v", c.audience, c.exposed, ok, c.wantOK)
				}
			},
		)
	}
}
