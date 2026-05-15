#!/bin/bash

# Docker Entrypoint for JMeter Container
# This script runs inside the JMeter Docker container
# It sets up the environment and executes the load test

set -e

echo "🚀 JMeter Docker Entrypoint"
echo "================================================"
echo "Scenario: ${SCENARIO:-scenario_smoke}"
echo "Backend: ${BACKEND_HOST:-backend}:${BACKEND_PORT:-3000}"
echo "Result File: ${RESULT_FILE:-results.jtl}"
echo "Report Dir: ${REPORT_DIR:-report}"
echo "================================================"

# Ensure directories exist
mkdir -p /home/jmeter/reports
mkdir -p /home/jmeter/data
mkdir -p /home/jmeter/testplans
mkdir -p /home/jmeter/config

# Set defaults
SCENARIO=${SCENARIO:-scenario_smoke}
BACKEND_HOST=${BACKEND_HOST:-backend}
BACKEND_PORT=${BACKEND_PORT:-3000}
RESULT_FILE=${RESULT_FILE:-results.jtl}
REPORT_DIR=${REPORT_DIR:-report}
HEAP=${HEAP:--Xmx2g -Xms1g}

# Validate test plan exists
TESTPLAN="/home/jmeter/testplans/${SCENARIO}.jmx"
if [ ! -f "$TESTPLAN" ]; then
  echo "❌ Test plan not found: $TESTPLAN"
  ls -la /home/jmeter/testplans/ || true
  exit 1
fi
echo "✓ Test plan: $TESTPLAN"

# Wait for backend connectivity
echo -e "\n⏳ Waiting for backend connectivity..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if timeout 5 bash -c "echo >/dev/tcp/$BACKEND_HOST/$BACKEND_PORT" 2>/dev/null; then
    echo "✓ Backend available at $BACKEND_HOST:$BACKEND_PORT"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "  Attempt $RETRY_COUNT/$MAX_RETRIES... waiting 2 seconds"
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "⚠️  Backend not available, but continuing anyway..."
fi

# Set JMeter options
export HEAP="$HEAP"
export JMETER_OPTS="-Djmeter.save.saveservice.output_format=csv"

# Prepare report directory
FULL_REPORT_DIR="/home/jmeter/reports/$REPORT_DIR"
mkdir -p "$FULL_REPORT_DIR"

echo -e "\n🧪 Running JMeter test..."
echo "  Heap: $HEAP"
echo "  Test Plan: $SCENARIO.jmx"
echo "  Results: /home/jmeter/reports/$RESULT_FILE"
echo "  Report: $FULL_REPORT_DIR"
echo "================================================"

# Run JMeter
jmeter \
  $HEAP \
  -n \
  -t "$TESTPLAN" \
  -l "/home/jmeter/reports/$RESULT_FILE" \
  -j "/home/jmeter/reports/jmeter-${SCENARIO}.log" \
  -e \
  -o "$FULL_REPORT_DIR" \
  -Djmeter.save.saveservice.output_format=csv \
  -Djmeter.save.saveservice.connect_timeout=10000 \
  -Djmeter.save.saveservice.response_timeout=30000 \
  -DBACKEND_HOST="$BACKEND_HOST" \
  -DBACKEND_PORT="$BACKEND_PORT"

TEST_RESULT=$?

# Print summary
echo -e "\n================================================"
if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ Test completed successfully!"
  
  # Try to extract summary stats
  if [ -f "/home/jmeter/reports/$RESULT_FILE" ]; then
    TOTAL_LINES=$(wc -l < "/home/jmeter/reports/$RESULT_FILE")
    TOTAL_SAMPLES=$((TOTAL_LINES - 1))
    ERRORS=$(grep ',false,' "/home/jmeter/reports/$RESULT_FILE" | wc -l || echo "0")
    
    if [ "$TOTAL_SAMPLES" -gt 0 ]; then
      SUCCESS_RATE=$((100 * (TOTAL_SAMPLES - ERRORS) / TOTAL_SAMPLES))
      echo ""
      echo "📊 Quick Summary:"
      echo "   Total Samples: $TOTAL_SAMPLES"
      echo "   Errors: $ERRORS"
      echo "   Success Rate: ${SUCCESS_RATE}%"
    fi
  fi
  
  echo ""
  echo "📂 Report Directory: $FULL_REPORT_DIR"
  ls -la "$FULL_REPORT_DIR/" | head -n 10
  
else
  echo "❌ Test failed with exit code $TEST_RESULT"
  
  # Show logs
  if [ -f "/home/jmeter/reports/jmeter-${SCENARIO}.log" ]; then
    echo ""
    echo "📋 Last 20 lines of log:"
    tail -n 20 "/home/jmeter/reports/jmeter-${SCENARIO}.log"
  fi
fi

echo ""
echo "================================================"
exit $TEST_RESULT
