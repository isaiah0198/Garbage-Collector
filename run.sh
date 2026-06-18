#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p reports

echo "=== Java (Mark & Sweep) ==="
(cd java && javac HeapSimulator.java && java HeapSimulator)

echo "=== Python (Reference Counting) ==="
python3 python/ref_counter.py

echo "=== JS (Tri-Colour + Orchestrator) ==="
node js/tricolour.js

echo ""
echo "=== Reports ==="
ls -la reports/
