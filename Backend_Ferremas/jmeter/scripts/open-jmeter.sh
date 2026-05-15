#!/bin/bash

# JMeter GUI Launcher - Linux/Mac
# Opens JMeter GUI with a test plan
#
# Usage: bash open-jmeter.sh [scenario]
# Examples:
#   bash open-jmeter.sh                  (opens smoke test by default)
#   bash open-jmeter.sh scenario_carga
#   bash open-jmeter.sh scenario_estres

set -e

# Default scenario
SCENARIO="${1:-scenario_smoke}"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TESTPLAN="$PROJECT_DIR/testplans/${SCENARIO}.jmx"

echo ""
echo "========================================"
echo "  JMeter GUI Launcher"
echo "========================================"
echo ""
echo "Opening test plan: ${SCENARIO}.jmx"
echo ""

# Check if test plan exists
if [ ! -f "$TESTPLAN" ]; then
    echo "❌ ERROR: Test plan not found: $TESTPLAN"
    echo ""
    echo "Available scenarios:"
    echo "  - scenario_smoke"
    echo "  - scenario_carga"
    echo "  - scenario_estres"
    echo "  - scenario_resistencia"
    echo ""
    exit 1
fi

# Check if JMeter is in PATH
if ! command -v jmeter &> /dev/null; then
    echo "❌ ERROR: JMeter not found in PATH"
    echo ""
    echo "Run: npm run jmeter:install"
    echo ""
    exit 1
fi

echo "✅ Starting JMeter with test plan..."
echo ""

# Open JMeter with the test plan
jmeter -t "$TESTPLAN" &

# Give JMeter time to start
sleep 2

echo ""
echo "✅ JMeter is starting..."
echo ""
echo "Tips:"
echo "  - Wait for JMeter to fully load"
echo "  - Right-click on Thread Group to add Listeners"
echo "  - Click Run (Ctrl+R) to start the test"
echo "  - Backend must be running: docker-compose up -d db backend"
echo ""

exit 0
