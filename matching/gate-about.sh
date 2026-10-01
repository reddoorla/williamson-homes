#!/usr/bin/env bash
# about-us only: gate.sh's exact page-diff call plus one disclosed --pin-state.
# The reference hides its desktop builders/collab sections below 480 and shows
# later "-resp-rep" twins; page-diff resolves an anchor to the FIRST element in
# document order, hidden or not, so every anchor in those sections cut at y=0.
# Removing display:none <section>s on both pages changes no pixel and lets the
# anchors land on what is shown. LEDGER 2026-10-01 "about-us gate".
set -u
eval "$(node "$(dirname "$0")/harness.mjs" --env)"
TAG="${1:?usage: gate-about.sh <round-tag>}"
sections="$(node -e 'const h=require("./matching/harness.json");process.stdout.write(h.pages["about-us"].anchors.join(","))')"
PIN='document.querySelectorAll("section").forEach(function(s){if(getComputedStyle(s).display==="none")s.remove()})'
node "$PD" --ref "${REF}/about-us" --cand "${CAND}/dev/match/about-us" \
  --viewports "$MATRIX" --threshold "$THRESHOLD" \
  --sections "$sections" --pin-state "$PIN" --out "matching/out-$TAG-about-us" \
  > "matching/out-$TAG-about-us.log" 2>&1
echo "about-us exit=$?"
