#!/usr/bin/env bash
# Produce help_cmd_brief_list_cleaned.txt from help_cmd_brief_list.txt
# (evrmore-cli "help" style grouped listing).
#
# Rules:
#   - Drop section headers (lines matching ^== ... ==$)
#   - Drop blank lines
#   - Emit the first whitespace-separated token on each remaining line (the RPC name)
#
# Usage:
#   ./scripts/help-cmd-brief-list-to-cleaned.sh INPUT.txt OUTPUT.txt
#
# Requires: awk (POSIX)

set -euo pipefail

usage() {
  echo "Usage: $0 <help_cmd_brief_list.txt> <help_cmd_brief_list_cleaned.txt>" >&2
  exit 1
}

[[ ${1-} ]] && [[ ${2-} ]] || usage
INPUT="$1"
OUT="$2"

[[ -f "$INPUT" ]] || { echo "Not a file: $INPUT" >&2; exit 1; }

awk '
  /^== / { next }
  /^[[:space:]]*$/ { next }
  { print $1 }
' "$INPUT" >"$OUT"

count=$(wc -l <"$OUT" | tr -d " ")
echo "wrote $OUT ($count lines)" >&2
