#!/bin/bash

# Open All JMeter Test Plans in GUI - Linux/Mac
# Opens all 4 test plans in separate JMeter windows
#
# Usage: bash open-all-jmeter.sh

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TESTPLANS_DIR="$PROJECT_DIR/testplans"

echo ""
echo "════════════════════════════════════════════════"
echo "  JMeter GUI - Open All Test Plans"
echo "════════════════════════════════════════════════"
echo ""

# Check if JMeter is in PATH
if ! command -v jmeter &> /dev/null; then
    echo "❌ ERROR: JMeter not found in PATH"
    echo ""
    echo "Run: npm run jmeter:install"
    echo ""
    exit 1
fi

# Define test plans
SMOKE="$TESTPLANS_DIR/scenario_smoke.jmx"
CARGA="$TESTPLANS_DIR/scenario_carga.jmx"
ESTRES="$TESTPLANS_DIR/scenario_estres.jmx"
RESISTENCIA="$TESTPLANS_DIR/scenario_resistencia.jmx"

# Check if test plans exist
for plan in "$SMOKE" "$CARGA" "$ESTRES" "$RESISTENCIA"; do
    if [ ! -f "$plan" ]; then
        echo "❌ ERROR: Test plan not found: $plan"
        echo ""
        exit 1
    fi
done

echo "✅ Starting all JMeter test plans..."
echo ""
echo "Opening:"
echo "  1️⃣  Smoke Test (Quick validation)"
echo "  2️⃣  Load Test (100 concurrent users)"
echo "  3️⃣  Stress Test (500 concurrent users)"
echo "  4️⃣  Resistance Test (30 minutes)"
echo ""
echo "💡 Tip: Backend must be running before executing tests"
echo "   Command: docker-compose up -d db backend"
echo ""

# Open all test plans in separate windows/tabs
jmeter -t "$SMOKE" &
sleep 2
jmeter -t "$CARGA" &
sleep 2
jmeter -t "$ESTRES" &
sleep 2
jmeter -t "$RESISTENCIA" &

echo ""
echo "✅ All JMeter windows are starting..."
echo ""
echo "📋 Workflow:"
echo "  1. Wait for all JMeter windows to load"
echo "  2. Right-click on Thread Group in each window"
echo "  3. Add → Listener → View Results Tree (recommended)"
echo "  4. Click Run (Ctrl+R) when ready"
echo ""

exit 0
