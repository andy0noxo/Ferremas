#!/bin/bash

# Cleanup Reports Script
# Removes old JMeter report directories to prevent disk space issues
# Keeps only the latest N reports (default: 5)

REPORTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/reports"
KEEP_COUNT=${1:-5}

echo "🧹 Cleaning up old JMeter reports..."
echo "Reports directory: $REPORTS_DIR"
echo "Keeping latest: $KEEP_COUNT reports"
echo "================================================"

if [ ! -d "$REPORTS_DIR" ]; then
  echo "❌ Reports directory not found: $REPORTS_DIR"
  exit 1
fi

cd "$REPORTS_DIR" || exit 1

# Count existing reports
REPORT_COUNT=$(find . -maxdepth 1 -type d -name "html-report-*" | wc -l)
echo "Current reports: $REPORT_COUNT"

if [ "$REPORT_COUNT" -le "$KEEP_COUNT" ]; then
  echo "✓ No cleanup needed (reports <= $KEEP_COUNT)"
  exit 0
fi

# Get oldest reports and delete them
REPORTS_TO_DELETE=$((REPORT_COUNT - KEEP_COUNT))
echo "Removing: $REPORTS_TO_DELETE old reports"

find . -maxdepth 1 -type d -name "html-report-*" -printf '%T@ %p\n' | \
  sort -n | \
  head -n "$REPORTS_TO_DELETE" | \
  cut -d' ' -f2 | \
  while read -r dir; do
    echo "  🗑️  Removing: $dir"
    rm -rf "$dir"
  done

# Clean up old .jtl result files
find . -maxdepth 1 -type f -name "*.jtl" -mtime +7 -delete 2>/dev/null || true
find . -maxdepth 1 -type f -name "jmeter.log" -mtime +7 -delete 2>/dev/null || true

echo "================================================"
echo "✅ Cleanup completed!"
