#!/bin/bash

# JMeter Installation Script
# Installs JMeter and configures it for use
# Supports: Linux, macOS

set -e

echo "📦 JMeter Installation Script"
echo "================================================"

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
else
  echo "❌ Unsupported OS: $OSTYPE"
  echo "   Windows users: Download from https://jmeter.apache.org/download_jmeter.cgi"
  exit 1
fi

echo "Detected OS: $OS"

# 1. Check if JMeter already installed
if command -v jmeter &> /dev/null; then
  CURRENT_VERSION=$(jmeter -v 2>&1 | grep -oP 'version \K[0-9.]+' || echo "unknown")
  echo "⚠️  JMeter already installed (version $CURRENT_VERSION)"
  read -p "Continue with installation anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
fi

# 2. Check prerequisites
echo -e "\n🔍 Checking prerequisites..."

if ! command -v java &> /dev/null; then
  echo "❌ Java not found. Please install Java 11+"
  if [ "$OS" = "linux" ]; then
    echo "   Ubuntu/Debian: sudo apt-get install openjdk-11-jdk"
    echo "   CentOS/RHEL: sudo yum install java-11-openjdk"
  elif [ "$OS" = "macos" ]; then
    echo "   macOS: brew install openjdk@11"
  fi
  exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | grep -oP 'version "\K[^"]*')
echo "✓ Java $JAVA_VERSION found"

if ! command -v curl &> /dev/null; then
  echo "❌ curl not found. Please install it."
  if [ "$OS" = "linux" ]; then
    echo "   Ubuntu/Debian: sudo apt-get install curl"
  elif [ "$OS" = "macos" ]; then
    echo "   macOS: brew install curl"
  fi
  exit 1
fi
echo "✓ curl found"

# 3. Determine installation directory
JMETER_VERSION="5.6.3"
JMETER_HOME="${HOME}/.jmeter-${JMETER_VERSION}"

if [ -d "$JMETER_HOME" ]; then
  echo "✓ JMeter already at: $JMETER_HOME"
else
  echo -e "\n📥 Downloading JMeter $JMETER_VERSION..."
  
  DOWNLOAD_URL="https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz"
  TEMP_FILE="/tmp/jmeter-${JMETER_VERSION}.tgz"
  
  if ! curl -L -o "$TEMP_FILE" "$DOWNLOAD_URL"; then
    echo "❌ Failed to download JMeter from $DOWNLOAD_URL"
    exit 1
  fi
  
  echo "✓ Downloaded to $TEMP_FILE"
  
  echo "📦 Extracting JMeter..."
  mkdir -p "$JMETER_HOME"
  tar xzf "$TEMP_FILE" --strip-components=1 -C "$JMETER_HOME"
  rm -f "$TEMP_FILE"
  echo "✓ Extracted to $JMETER_HOME"
fi

# 4. Update PATH
echo -e "\n⚙️  Configuring PATH..."

PROFILE_FILE=""
if [ -f "$HOME/.bash_profile" ]; then
  PROFILE_FILE="$HOME/.bash_profile"
elif [ -f "$HOME/.bashrc" ]; then
  PROFILE_FILE="$HOME/.bashrc"
elif [ -f "$HOME/.profile" ]; then
  PROFILE_FILE="$HOME/.profile"
elif [ -f "$HOME/.zprofile" ]; then
  PROFILE_FILE="$HOME/.zprofile"
elif [ -f "$HOME/.zshrc" ]; then
  PROFILE_FILE="$HOME/.zshrc"
fi

if [ -n "$PROFILE_FILE" ]; then
  JMETER_BIN="$JMETER_HOME/bin"
  
  # Check if already in PATH
  if grep -q "$JMETER_BIN" "$PROFILE_FILE"; then
    echo "✓ JMeter already in PATH"
  else
    echo "export PATH=\"$JMETER_BIN:\$PATH\"" >> "$PROFILE_FILE"
    echo "✓ Added to PATH in $PROFILE_FILE"
    echo "⚠️  Run: source $PROFILE_FILE"
  fi
else
  echo "⚠️  Could not determine shell profile. Add to your PATH manually:"
  echo "   export PATH=\"$JMETER_HOME/bin:\$PATH\""
fi

# 5. Test installation
echo -e "\n🧪 Testing JMeter..."
if "$JMETER_HOME/bin/jmeter" -v > /dev/null 2>&1; then
  TEST_VERSION=$("$JMETER_HOME/bin/jmeter" -v 2>&1 | grep -oP 'version \K[0-9.]+')
  echo "✓ JMeter $TEST_VERSION installed successfully"
  JMETER_BIN="$JMETER_HOME/bin/jmeter"
else
  echo "⚠️  JMeter installed but verification failed"
fi

# 6. Configure JMeter properties
echo -e "\n⚙️  Configuring JMeter properties..."

JMETER_PROPS="$JMETER_HOME/bin/jmeter.properties"

# Increase heap memory
if ! grep -q "HEAP=" "$JMETER_PROPS" 2>/dev/null; then
  echo "export HEAP=\"-Xmx2g -Xms1g\"" >> "$JMETER_PROPS"
  echo "✓ Configured heap memory (2GB)"
fi

echo ""
echo "================================================"
echo "✅ JMeter installation completed!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Reload your shell profile:"
echo "   source $PROFILE_FILE"
echo ""
echo "2. Verify installation:"
echo "   jmeter -v"
echo ""
echo "3. Run your first JMeter test:"
echo "   cd Backend_Ferremas/jmeter"
echo "   bash scripts/run-local.sh scenario_smoke"
echo ""
