#!/usr/bin/env bash
export MATCHING_SKILL_DIR="${MATCHING_SKILL_DIR:?set MATCHING_SKILL_DIR to the matching-a-page skill directory}"
for i in 1 2 3; do
  bash matching/gate-about.sh "$1"
  grep -q "Execution context was destroyed" "matching/out-$1-about-us.log" || break
  echo "dev reload mid-capture; retry $i"; sleep 5
done
grep -E "^\s+(FAIL|PASS)|OVERALL|pin-state" "matching/out-$1-about-us.log"
