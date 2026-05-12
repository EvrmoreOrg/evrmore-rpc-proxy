#!/usr/bin/env bash
# Convert evrmore-cli per-command help (concatenated) into lib/docs.<network>.json shape.
#
# Input format (one block per RPC method):
#   methodname:
#   <optional synopsis line(s)>
#   ...help text...
#
# Usage:
#   ./scripts/help-cmd-details-to-docs-json.sh INPUT.txt OUTPUT.json
#
# Requires: python3 (stdlib only)

set -euo pipefail

usage() {
  echo "Usage: $0 <help_cmd_details_list.txt> <docs.testnet.json>" >&2
  exit 1
}

[[ ${1-} ]] && [[ ${2-} ]] || usage
INPUT="$1"
OUT="$2"

[[ -f "$INPUT" ]] || { echo "Not a file: $INPUT" >&2; exit 1; }

export INPUT_PATH="$INPUT"
export OUT_PATH="$OUT"

python3 <<'PY'
import json
import os
import re
import sys

path = os.environ["INPUT_PATH"]
out_path = os.environ["OUT_PATH"]

with open(path, "r", encoding="utf-8", newline=None) as f:
    text = f.read()

text = text.replace("\r\n", "\n").replace("\r", "\n")

# Split on lines that are only: rpcname: optional trailing spaces
parts = re.split(r"(?m)^([a-z0-9_]+):\s*$", text)
preamble = parts[0].strip()
if preamble:
    sys.stderr.write(
        f"warning: ignored {len(preamble)} chars before first method header\n"
    )

# Preserve block order from the input file (Python 3.7+ dict insertion order).
# Trailing newline convention (matches lib/docs.*.json): if the block ends with a
# blank line before the next method (…\n\n), keep one trailing \n on the value;
# a single trailing \n only (next method immediately below) is stripped — e.g. stop, bumpfee.
def normalize_body(raw: str) -> str:
    s = raw.lstrip("\n")
    if s.endswith("\n\n"):
        return s.rstrip("\n") + "\n"
    return s.rstrip("\n")


docs = {}
for i in range(1, len(parts), 2):
    method = parts[i]
    body = normalize_body(parts[i + 1])
    if method in docs:
        sys.stderr.write(f"warning: duplicate method {method!r}, keeping last\n")
    docs[method] = body

with open(out_path, "w", encoding="utf-8") as w:
    json.dump(docs, w, indent=4, ensure_ascii=False)
    w.write("\n")

print(len(docs), "methods", file=sys.stderr)
print("wrote", out_path, file=sys.stderr)
PY
