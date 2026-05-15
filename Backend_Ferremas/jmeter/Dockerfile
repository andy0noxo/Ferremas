FROM justb4/jmeter:latest

LABEL maintainer="Ferremas QA Team"
LABEL description="JMeter image for Ferremas load and stress testing"

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /home/jmeter/work

# Copy test plans, data, and configuration
COPY testplans/ /home/jmeter/testplans/
COPY data/ /home/jmeter/data/
COPY config/ /home/jmeter/config/
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh

# Make scripts executable
RUN chmod +x /docker-entrypoint.sh

# Create reports directory
RUN mkdir -p /home/jmeter/reports

# Set volumes
VOLUME ["/home/jmeter/reports", "/home/jmeter/testplans", "/home/jmeter/data"]

# Configure JMeter properties
ENV HEAP="-Xmx2g -Xms1g"
ENV JMETER_HOME="/opt/jmeter"
ENV PATH="$JMETER_HOME/bin:$PATH"

# Default values for test execution
ENV SCENARIO="scenario_smoke"
ENV BACKEND_HOST="backend"
ENV BACKEND_PORT="3000"
ENV RESULT_FILE="results.jtl"
ENV REPORT_DIR="report"

# Entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]

# Default command
CMD []
