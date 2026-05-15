#!/bin/bash

# JMeter Local Test Runner
# Executes JMeter tests locally (without Docker)
# 
# Usage: bash run-local.sh [scenario]
# Examples:
#   bash run-local.sh scenario_smoke
#   bash run-local.sh scenario_carga
#   bash run-local.sh scenario_estres

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TESTPLANS_DIR="$PROJECT_DIR/testplans"
REPORTS_DIR="$PROJECT_DIR/reports"
CONFIG_DIR="$PROJECT_DIR/config"

# Default scenario
SCENARIO=${1:-scenario_smoke}

echo "🧪 JMeter Local Test Runner"
echo "=" | tr '|' '=' | sed "s/|/=/g" | head -c 50; echo
echo "Scenario: $SCENARIO"
echo "Reports: $REPORTS_DIR"
echo "=" | tr '|' '=' | sed "s/|/=/g" | head -c 50; echo

# 1. Validate JMeter installation
echo -e "\n🔍 Checking JMeter installation..."
if ! command -v jmeter &> /dev/null; then
  echo "❌ JMeter not found in PATH"
  echo "   Install it: bash scripts/install-jmeter.sh"
  exit 1
fi
JMETER_VERSION=$(jmeter -v 2>&1 | grep -oP 'version \K[0-9.]+' || echo "unknown")
echo "✓ JMeter $JMETER_VERSION found"

# 2. Validate test plan exists
echo -e "\n🔍 Validating test plan..."
TEST_PLAN="$TESTPLANS_DIR/$SCENARIO.jmx"
if [ ! -f "$TEST_PLAN" ]; then
  echo "❌ Test plan not found: $TEST_PLAN"
  echo "   Available scenarios:"
  ls -1 "$TESTPLANS_DIR"/*.jmx 2>/dev/null | xargs -I {} basename {} .jmx | sed 's/^/     - /'
  exit 1
fi
echo "✓ Test plan found: $SCENARIO.jmx"

# 3. Validate backend connectivity
echo -e "\n🔍 Validating backend connectivity..."
BACKEND_HOST=${BACKEND_HOST:-localhost}
BACKEND_PORT=${BACKEND_PORT:-3000}
BACKEND_URL="http://$BACKEND_HOST:$BACKEND_PORT"

if ! timeout 5 bash -c "echo >/dev/tcp/$BACKEND_HOST/$BACKEND_PORT" 2>/dev/null; then
  echo "⚠️  Warning: Cannot connect to backend at $BACKEND_URL"
  echo "   Make sure Backend_Ferremas is running:"
  echo "   npm run dev (in Backend_Ferremas directory)"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo "✓ Backend accessible at $BACKEND_URL"
fi

# 4. Validate test data exists
echo -e "\n🔍 Validating test data..."
USUARIOS_CSV="$PROJECT_DIR/data/usuarios.csv"
PRODUCTOS_CSV="$PROJECT_DIR/data/productos.csv"

if [ ! -f "$USUARIOS_CSV" ] || [ ! -f "$PRODUCTOS_CSV" ]; then
  echo "⚠️  Test data not found. Would you like to generate it?"
  echo "   Command: node $SCRIPT_DIR/setup-fixtures.js"
  read -p "Generate now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    node "$SCRIPT_DIR/setup-fixtures.js"
  fi
fi

if [ -f "$USUARIOS_CSV" ]; then
  USUARIOS_COUNT=$(tail -n +2 "$USUARIOS_CSV" | wc -l)
  echo "✓ Test users: $USUARIOS_COUNT"
fi

if [ -f "$PRODUCTOS_CSV" ]; then
  PRODUCTOS_COUNT=$(tail -n +2 "$PRODUCTOS_CSV" | wc -l)
  echo "✓ Test products: $PRODUCTOS_COUNT"
fi

# 5. Create reports directory
echo -e "\n📁 Creating reports directory..."
mkdir -p "$REPORTS_DIR"

# 6. Generate timestamped report name
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
RESULT_FILE="$REPORTS_DIR/results_${SCENARIO}_${TIMESTAMP}.jtl"
REPORT_DIR="$REPORTS_DIR/html-report-${SCENARIO}-${TIMESTAMP}"

echo "✓ Report will be saved to: $REPORT_DIR"

# 7. Set JMeter environment
echo -e "\n⚙️  Configuring JMeter environment..."
export BACKEND_HOST=${BACKEND_HOST:-localhost}
export BACKEND_PORT=${BACKEND_PORT:-3000}
export JMETER_HOME=${JMETER_HOME:-$(jmeter -h 2>&1 | grep -oP 'JMETER_HOME=\K.*' || echo "")}

# Increase heap memory for larger tests
export HEAP="-Xmx2g -Xms1g"
echo "✓ Heap: $HEAP"
echo "✓ Backend: $BACKEND_HOST:$BACKEND_PORT"

# 8. Run JMeter test
echo -e "\n🚀 Starting JMeter test..."
echo "  Test Plan: $TEST_PLAN"
echo "  Mode: Non-GUI (headless)"
echo "  Result File: $RESULT_FILE"
echo "  Report Dir: $REPORT_DIR"
echo "================================================"

jmeter \
  -n \
  -t "$TEST_PLAN" \
  -l "$RESULT_FILE" \
  -j "$REPORTS_DIR/jmeter-${SCENARIO}-${TIMESTAMP}.log" \
  -e \
  -o "$REPORT_DIR" \
  -Djmeter.save.saveservice.output_format=csv \
  -Djmeter.save.saveservice.connect_timeout=10000 \
  -Djmeter.save.saveservice.response_timeout=30000 \
  -DBACKEND_HOST="$BACKEND_HOST" \
  -DBACKEND_PORT="$BACKEND_PORT"

TEST_RESULT=$?

# 9. Check test result
echo -e "\n================================================"
if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ Test completed successfully!"
  echo ""
  echo "📊 View Results:"
  echo "   Browser: Open $REPORT_DIR/index.html"
  
  # Try to open in default browser (if available)
  if command -v xdg-open &> /dev/null; then
    xdg-open "$REPORT_DIR/index.html" &
  elif command -v open &> /dev/null; then
    open "$REPORT_DIR/index.html" &
  fi
  
  # Print summary
  echo ""
  echo "📈 Quick Summary:"
  if [ -f "$RESULT_FILE" ]; then
    TOTAL_SAMPLES=$(tail -n +2 "$RESULT_FILE" | wc -l)
    ERRORS=$(grep ',false,' "$RESULT_FILE" | wc -l || echo "0")
    SUCCESS_RATE=$((100 * (TOTAL_SAMPLES - ERRORS) / TOTAL_SAMPLES))
    echo "   Total Samples: $TOTAL_SAMPLES"
    echo "   Errors: $ERRORS"
    echo "   Success Rate: ${SUCCESS_RATE}%"
  fi
  
else
  echo "❌ Test failed with exit code $TEST_RESULT"
  echo ""
  echo "📋 Check logs:"
  echo "   tail -f $REPORTS_DIR/jmeter-${SCENARIO}-${TIMESTAMP}.log"
  exit $TEST_RESULT
fi

# 10. Cleanup old reports
echo ""
echo "🧹 Cleaning up old reports (keeping last 5)..."
bash "$SCRIPT_DIR/cleanup-reports.sh" 5 > /dev/null 2>&1 || true

echo ""
echo "✨ Done!"
