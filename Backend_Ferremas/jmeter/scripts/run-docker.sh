#!/bin/bash

# JMeter Docker Test Runner
# Executes JMeter tests inside Docker containers
# 
# Usage: bash run-docker.sh [scenario]
# Examples:
#   bash run-docker.sh scenario_smoke
#   bash run-docker.sh scenario_carga
#   bash run-docker.sh scenario_estres

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
JMETER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SCENARIO=${1:-scenario_smoke}

echo "🐳 JMeter Docker Test Runner"
echo "================================================"
echo "Scenario: $SCENARIO"
echo "Project: $PROJECT_ROOT"
echo "================================================"

# 1. Check Docker
echo -e "\n🔍 Checking Docker..."
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Please install Docker."
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose not found. Please install Docker Compose."
  exit 1
fi

DOCKER_VERSION=$(docker --version | grep -oP 'version \K[0-9.]+')
echo "✓ Docker $DOCKER_VERSION found"

# 2. Check if Docker daemon is running
if ! docker ps > /dev/null 2>&1; then
  echo "❌ Docker daemon not running. Please start Docker."
  exit 1
fi
echo "✓ Docker daemon running"

# 3. Validate scenario
TESTPLAN="$JMETER_DIR/testplans/${SCENARIO}.jmx"
if [ ! -f "$TESTPLAN" ]; then
  echo "❌ Test plan not found: $TESTPLAN"
  echo "Available scenarios:"
  ls -1 "$JMETER_DIR/testplans"/*.jmx 2>/dev/null | xargs -I {} basename {} .jmx | sed 's/^/   - /'
  exit 1
fi
echo "✓ Test plan found: $SCENARIO.jmx"

# 4. Check test data
echo -e "\n🔍 Checking test data..."
if [ ! -f "$JMETER_DIR/data/usuarios.csv" ] || [ ! -f "$JMETER_DIR/data/productos.csv" ]; then
  echo "⚠️  Test data not found. Generating..."
  echo "   (This requires backend to be running)"
  read -p "Generate test data now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$PROJECT_ROOT/Backend_Ferremas"
    node jmeter/scripts/setup-fixtures.js
    cd "$JMETER_DIR"
  else
    echo "❌ Test data required. Run: node $JMETER_DIR/scripts/setup-fixtures.js"
    exit 1
  fi
fi
echo "✓ Test data available"

# 5. Check/Build Docker images
echo -e "\n🏗️  Preparing Docker images..."

# Check if main compose is already running
if docker-compose -f "$PROJECT_ROOT/docker-compose.yml" ps | grep -q "mysql\|backend"; then
  echo "✓ Main services (MySQL, Backend) already running"
  SERVICES_RUNNING=true
else
  echo "⚠️  Main services not running. Starting..."
  docker-compose -f "$PROJECT_ROOT/docker-compose.yml" up -d db backend
  echo "⏳ Waiting for services to be healthy (30 seconds)..."
  sleep 30
  SERVICES_RUNNING=true
fi

# Check if JMeter image exists
if docker image inspect jmeter-ferremas > /dev/null 2>&1; then
  echo "✓ JMeter image found (jmeter-ferremas)"
else
  echo "📦 Building JMeter Docker image..."
  docker build -t jmeter-ferremas -f "$JMETER_DIR/Dockerfile" "$JMETER_DIR" || {
    echo "❌ Failed to build JMeter image"
    exit 1
  }
  echo "✓ JMeter image built"
fi

# 6. Prepare test execution
echo -e "\n⚙️  Preparing test execution..."

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
RESULT_FILE="results_${SCENARIO}_${TIMESTAMP}.jtl"
REPORT_DIR="html-report-${SCENARIO}-${TIMESTAMP}"

# Create reports directory
mkdir -p "$JMETER_DIR/reports"

echo "✓ Result file: $RESULT_FILE"
echo "✓ Report dir: $REPORT_DIR"

# 7. Run JMeter in Docker
echo -e "\n🚀 Starting JMeter in Docker..."
echo "================================================"

docker run --rm \
  --network=ferremas-network \
  -v "$JMETER_DIR/testplans":/home/jmeter/testplans:ro \
  -v "$JMETER_DIR/data":/home/jmeter/data:ro \
  -v "$JMETER_DIR/config":/home/jmeter/config:ro \
  -v "$JMETER_DIR/reports":/home/jmeter/reports \
  -e SCENARIO="$SCENARIO" \
  -e RESULT_FILE="$RESULT_FILE" \
  -e REPORT_DIR="$REPORT_DIR" \
  -e BACKEND_HOST="backend" \
  -e BACKEND_PORT="3000" \
  jmeter-ferremas

TEST_RESULT=$?

# 8. Check result
echo -e "\n================================================"
if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ Test completed successfully!"
  echo ""
  echo "📊 View Results:"
  REPORT_PATH="$JMETER_DIR/reports/$REPORT_DIR"
  if [ -f "$REPORT_PATH/index.html" ]; then
    echo "   Browser: $REPORT_PATH/index.html"
    
    # Try to open in default browser
    if command -v xdg-open &> /dev/null; then
      xdg-open "$REPORT_PATH/index.html" &
    elif command -v open &> /dev/null; then
      open "$REPORT_PATH/index.html" &
    fi
  fi
else
  echo "❌ Test failed with exit code $TEST_RESULT"
  echo ""
  echo "📋 Check Docker logs:"
  echo "   docker-compose -f docker-compose.jmeter.yml logs jmeter"
fi

# 9. Cleanup (optional)
echo ""
read -p "Cleanup Docker containers? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🧹 Cleaning up..."
  docker-compose -f "$JMETER_DIR/docker-compose.jmeter.yml" down 2>/dev/null || true
  echo "✓ Cleaned up"
fi

echo ""
echo "✨ Done!"
exit $TEST_RESULT
