#!/usr/bin/env bash
# Lint every OpenAPI spec under services/ (ADR-0008). Each spec is fully
# self-contained: shared shapes (the Error response, the workflow handle) are
# declared in each spec's own components rather than via cross-file $refs, which
# oapi-codegen cannot resolve for OpenAPI 3.1.
set -euo pipefail

shopt -s nullglob globstar

specs=()
for f in services/*/openapi.yaml; do
  [[ -f "$f" ]] && specs+=("$f")
done

if [[ ${#specs[@]} -eq 0 ]]; then
  echo "no OpenAPI specs yet"
  exit 0
fi

exec spectral lint --ruleset tools/codegen/spectral.yaml "${specs[@]}"
