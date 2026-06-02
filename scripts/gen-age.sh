#!/usr/bin/env bash
# Generate this engineer's SOPS age key (ADR-0005). Idempotent.
# The private key lives at ~/.config/sops/age/keys.txt and never leaves the laptop;
# the public key is what you add to .sops.yaml (via PR), then run `sops updatekeys`.
set -euo pipefail

KEY_DIR="${SOPS_AGE_KEY_DIR:-$HOME/.config/sops/age}"
KEY_FILE="$KEY_DIR/keys.txt"

# age-keygen ships alongside the age binary; fall back to it if not on PATH.
keygen="$(command -v age-keygen || true)"
if [[ -z "$keygen" ]]; then
  keygen="$(dirname "$(command -v age)")/age-keygen"
fi

mkdir -p "$KEY_DIR"
chmod 700 "$KEY_DIR"

if [[ -f "$KEY_FILE" ]]; then
  echo "→ age key already exists at $KEY_FILE (leaving it)"
else
  echo "→ generating age key at $KEY_FILE"
  "$keygen" -o "$KEY_FILE"
  chmod 600 "$KEY_FILE"
fi

echo
echo "Your age PUBLIC key — add it to .sops.yaml, then run 'sops updatekeys' on encrypted files:"
echo "  $("$keygen" -y "$KEY_FILE")"
