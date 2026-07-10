// Command lint-api-audience is the audience↔exposure gate (ADR-0008). A service's
// documented API audience (info.x-audience) must agree with whether the service is
// actually edge-exposed: a `public` spec MUST have an edge route, and an edge-exposed
// service MUST NOT read `internal` (the fail-closed default). This keeps the
// documented audience and the real exposure boundary in lockstep — a public contract
// is never published for an unreachable service, and an edge API is never silently
// left `internal` (the omission that produced finding D).
//
// Edge exposure is read from the canonical dev gitops values (ingress.resources is
// identical across envs). A control-plane/decision service with no spec (e.g. authz,
// ADR-0008) has no audience and is exempt: it simply has no openapi.yaml to glob.
package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

const (
	audiencePublic   = "public"
	audienceInternal = "internal"
)

func main() {
	specs, err := filepath.Glob(filepath.Join("services", "*", "openapi.yaml"))
	if err != nil {
		failf("glob specs: %v", err)
	}
	var problems []string
	for _, path := range specs {
		svc := filepath.Base(filepath.Dir(path))
		aud, err := readAudience(path)
		if err != nil {
			failf("%s: %v", path, err)
		}
		exposed, err := edgeExposed(svc)
		if err != nil {
			failf("%s: %v", svc, err)
		}
		msg := check(svc, aud, exposed)
		if msg != "" {
			problems = append(problems, msg)
		}
	}
	if len(problems) > 0 {
		_, _ = fmt.Fprintln(os.Stderr, "✗ API audience does not match edge exposure (ADR-0008):")
		for _, p := range problems {
			_, _ = fmt.Fprintln(os.Stderr, "  "+p)
		}
		os.Exit(1)
	}
	_, _ = fmt.Fprintf(os.Stdout, "✓ %d API specs: x-audience matches edge exposure\n", len(specs))
}

// check reports a problem when the documented audience and the real exposure
// disagree. An empty audience is the fail-closed default `internal` (ADR-0008).
func check(svc, audience string, exposed bool) string {
	if audience == "" {
		audience = audienceInternal
	}
	switch {
	case audience != audiencePublic && audience != audienceInternal:
		return fmt.Sprintf("%s: unknown x-audience %q (expected public or internal)", svc, audience)
	case audience == audiencePublic && !exposed:
		return svc + ": x-audience is public but the service has no edge route (ingress.resources empty)"
	case audience == audienceInternal && exposed:
		return svc + ": edge-exposed (ingress.resources set) but x-audience is internal" +
			" (or unset → internal); an edge service must declare x-audience: public"
	}
	return ""
}

func readAudience(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("read %s: %w", path, err)
	}
	var s struct {
		Info struct {
			XAudience string `yaml:"x-audience"`
		} `yaml:"info"`
	}
	err = yaml.Unmarshal(data, &s)
	if err != nil {
		return "", fmt.Errorf("parse %s: %w", path, err)
	}
	return s.Info.XAudience, nil
}

// edgeExposed reports whether the service has an /api route, read from its canonical
// dev gitops values. A service with no such file (e.g. the _template scaffold) is
// treated as not deployed, hence not edge-exposed.
func edgeExposed(svc string) (bool, error) {
	path := filepath.Join("infra", "gitops", "services", "dev", "values", svc+".yaml")
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("read %s: %w", path, err)
	}
	var v struct {
		Ingress struct {
			Enabled   *bool    `yaml:"enabled"`
			Resources []string `yaml:"resources"`
		} `yaml:"ingress"`
	}
	err = yaml.Unmarshal(data, &v)
	if err != nil {
		return false, fmt.Errorf("parse %s: %w", path, err)
	}
	enabled := v.Ingress.Enabled == nil || *v.Ingress.Enabled // chart default is true
	return enabled && len(v.Ingress.Resources) > 0, nil
}

func failf(format string, args ...any) {
	_, _ = fmt.Fprintf(os.Stderr, format+"\n", args...)
	os.Exit(1)
}
