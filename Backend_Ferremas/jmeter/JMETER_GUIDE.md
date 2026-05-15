                                                                                                                                                                                                                                                                                                                                                                                            |   # JMeter Advanced Guide - Ferremas Load Testing

## Table of Contents

1. [Understanding JMeter Basics](#understanding-jmeter-basics)
2. [Test Plan Anatomy](#test-plan-anatomy)
3. [Creating New Test Plans](#creating-new-test-plans)
4. [Variable & Token Management](#variable--token-management)
5. [Assertions & Validation](#assertions--validation)
6. [Debugging & Analyzing Results](#debugging--analyzing-results)
7. [Performance Optimization](#performance-optimization)
8. [Best Practices](#best-practices)

---

## Understanding JMeter Basics

### What is JMeter?

Apache JMeter is a Java application designed to load test functional behavior and measure performance. It can simulate multiple concurrent users and measure application performance under load.

### Key Concepts

**Thread Group:**
- Represents a group of concurrent users
- Configure number of threads (users), ramp-up time, and loop count

**Sampler:**
- Makes actual HTTP requests (GET, POST, PUT, DELETE)
- Records response time, status code, response body

**Listener:**
- Collects and displays test results
- Types: Aggregate Report, Response Time Graph, View Results Tree

**Extractor:**
- Captures values from responses (e.g., JWT tokens, IDs)
- Types: Regular Expression, JSON Path, XPath

**Assertion:**
- Validates response content/status
- Fails test if condition not met

**Config Element:**
- Provides settings used by samplers
- Types: HTTP Request Defaults, CSV Data Set Config

---

## Test Plan Anatomy

### Common Elements Structure

```
Thread Group (e.g., "Load Test Users - 100 concurrent")
├── Setup Thread Group (once, before main threads)
│   ├── HTTP Request (POST /auth/login)
│   └── Regular Expression Extractor (extract JWT token)
├── HTTP Request Defaults
├── CSV Data Set Config (usuarios.csv)
├── HTTP Sampler (GET /productos)
│   ├── Assertion (status = 200)
│   └── Regular Expression Extractor (extract product IDs)
├── Loop Controller
│   ├── HTTP Sampler (POST /carrito)
│   └── HTTP Sampler (GET /carrito)
└── Post-Test Group (once, after main threads)
    └── HTTP Request (cleanup if needed)

Listeners:
├── Aggregate Report
├── Response Time Graph
├── View Results Tree (only errors)
└── Summary Report
```

---

## Creating New Test Plans

### Step 1: Open JMeter GUI

```bash
# Local installation
jmeter

# Docker (if needed)
docker run -it -p 8080:8080 justb4/jmeter
```

### Step 2: Create Test Plan Structure

1. **Right-click Test Plan** → Add → Thread Groups → Thread Group
   - Name: "Load Test Users"
   - Number of Threads (users): 100
   - Ramp-Up Time (seconds): 120
   - Loop Count: 1 (or -1 for infinite)

2. **Add Thread Group** → Add → Config Element → HTTP Request Defaults
   - Server Name or IP: `${HOST}` (uses environment property)
   - Port Number: `${PORT}`
   - Protocol: HTTP

3. **Add Thread Group** → Add → Config Element → CSV Data Set Config
   - Filename: `${__BIF(FileToString,../data/usuarios.csv)}`
   - Variable Names: `email, password, nombre`
   - Delimiter: `,`
   - Allow quoted data: ✓
   - Recycle on EOF: ✓

4. **Add Thread Group** → Add → Sampler → HTTP Request
   - Path: `/auth/login`
   - Method: POST
   - Body Data:
     ```json
     {
       "email": "${email}",
       "password": "${password}"
     }
     ```
   - Headers: Content-Type: application/json

### Step 3: Add Extractors

For token extraction (used in subsequent requests):

1. **Right-click HTTP Sampler** → Add → Post Processor → Regular Expression Extractor
   - Reference Name: `jwtToken`
   - Regular Expression: `"token":"([^"]+)"`
   - Template: `$1$`
   - Match No.: 1
   - Default Value: (empty - will fail if not found)

Or using JSON Path (more reliable):

1. **Right-click HTTP Sampler** → Add → Post Processor → JSON Path Extractor
   - Names: `jwtToken`
   - JSON Paths: `$.token`
   - Match Numbers: 1

### Step 4: Add Assertions

To validate responses:

1. **Right-click HTTP Sampler** → Add → Assertions → Response Assertion
   - Apply to: Main sample only
   - Response Field to Test: Status Code
   - Pattern Matching Rules: Equals
   - Patterns to Test: 200

2. **Right-click HTTP Sampler** → Add → Assertions → JSON Path Assertion
   - Names: 
   - JSON Paths: `$.success`
   - Expected Values: `true`
   - Match as Regex: ☐

### Step 5: Add Listeners

For result collection:

1. **Right-click Thread Group** → Add → Listener → Aggregate Report
   - Filename: `${__time(yyyy-MM-dd_HH-mm-ss)}.jtl` (auto-timestamped)

2. **Right-click Thread Group** → Add → Listener → Response Time Graph

3. **Right-click Thread Group** → Add → Listener → View Results Tree
   - Configure → Only show errors
   - Check "Save Response Data"

### Step 6: Save Test Plan

```bash
cd Backend_Ferremas/jmeter/testplans
# Save as: my_test_scenario.jmx
```

---

## Variable & Token Management

### Using Environment Properties

All test plans use `environment.properties` for configuration:

```jmeter
# In HTTP Request Defaults:
Server: ${HOST}           # Resolved from environment.properties
Port: ${PORT}             # 3000 (local) or backend (Docker)
```

### JWT Token Extraction & Reuse

**Scenario:** Login once, reuse token for all subsequent requests

1. **Setup Thread Group** (runs once, before load test users):
   ```
   Setup Thread Group
   ├── HTTP Request (POST /auth/login)
   │   - Body: {"email":"admin@ferremas.cl","password":"Admin123!"}
   └── JSON Path Extractor
       - Reference Name: adminToken
       - JSON Path: $.token
   ```

2. **Other Samplers** use extracted token:
   ```
   HTTP Request (GET /productos)
   ├── Headers:
   │   - Authorization: Bearer ${adminToken}
   │   - Content-Type: application/json
   ```

### Extracting Resource IDs for Correlation

**Scenario:** Create product, then use its ID in subsequent requests

```
HTTP Request (POST /productos - Create)
├── Body: {"nombre":"Test Product","categoria":"Test","precio":1000}
└── JSON Path Extractor:
    - Reference Name: productId
    - JSON Path: $.id

HTTP Request (GET /productos/${productId} - Retrieve created product)

HTTP Request (PUT /productos/${productId} - Update created product)
```

### Creating Dynamic Variables

Use JMeter functions:

| Function | Purpose | Example |
|----------|---------|---------|
| `${__time(format)}` | Current timestamp | `${__time(yyyy-MM-dd)}` |
| `${__random(1,1000)}` | Random number | `${__random(1, 1000)}` |
| `${__UUID()}` | Generate UUID | `${__UUID()}` |
| `${__groovy(code)}` | Execute Groovy | `${__groovy(new Date().getTime())}` |

**Example - Dynamic Email per Iteration:**
```
Email: user_${__time(mmssSSS)}@ferremas.cl
```

---

## Assertions & Validation

### HTTP Status Assertions

Validate HTTP response codes:

```
Response Assertion:
├── Test Type: Response Code
├── Patterns: 200, 201, 204
└── Action if Test Fails: Continue (or Stopthread)
```

### Response Content Assertions

Validate response body content:

```
Response Assertion:
├── Test Type: Response Body
├── Pattern: "success":true
├── Assume UTF-8: ✓
└── Negate: ☐
```

### JSON Path Assertions

Validate specific JSON fields:

```
JSON Assertion:
├── Names: producto_creado
├── JSON Paths: $.id
├── Expected Values: Not empty
```

### Response Time Assertions

Fail if response time exceeds threshold:

```
Duration Assertion:
├── Duration in milliseconds: 5000 (5 seconds)
└── Assume successful responses: ✓
```

### Size Assertions

Validate response size:

```
Size Assertion:
├── Response Field to Test: Full Response
├── Size in bytes: 100
├── Comparison: >=
```

---

## Debugging & Analyzing Results

### View Results Tree (for Debugging)

1. **Add Listener → View Results Tree**
2. **Configure Filters:**
   - Show errors only
   - Show responses only
3. **Examine:**
   - Request tab: See sent request (body, headers)
   - Response tab: See response (body, headers, status)
   - Sampler result tab: Timing information

### Response Time Graph (for Performance)

Shows latency trends during test:
- Y-axis: Response time (ms)
- X-axis: Test time (seconds)
- Identify performance degradation over time

### Aggregate Report (Summary Statistics)

| Column | Meaning |
|--------|---------|
| **Label** | Sampler name |
| **#Samples** | Total requests |
| **Average** | Mean response time |
| **Median** | 50th percentile |
| **90%** | 90th percentile latency |
| **95%** | 95th percentile latency |
| **99%** | 99th percentile latency |
| **Min** | Minimum response time |
| **Max** | Maximum response time |
| **Std. Dev.** | Standard deviation |
| **Error %** | Percentage of failed requests |
| **Throughput** | Requests per second |
| **Received KB/sec** | Data received rate |
| **Sent KB/sec** | Data sent rate |

### Analyzing HTML Reports

Generated reports include:

1. **APDEX Score** (Application Performance Index)
   - 1.0 = Excellent
   - 0.5-0.94 = Good
   - <0.5 = Poor

2. **Statistics by Request**
   - Table showing metrics per endpoint

3. **Graphs**
   - Response times, throughput, errors
   - CSV exports for further analysis

### Common Issues to Debug

**High Error Rate:**
```
View Results Tree → Check failed responses
├── 401: Authentication failure (token expired)
├── 400: Bad request (validation error)
├── 500: Server error (check backend logs)
└── Timeout: Connection issue (check HOST/PORT)
```

**High Latency:**
```
Response Time Graph → Identify slow endpoints
├── Check database performance
├── Monitor CPU/memory on backend
└── Reduce concurrency or ramp-up time
```

**Out of Memory:**
```
jmeter.log:
java.lang.OutOfMemoryError: Java heap space
→ Increase HEAP: export HEAP="-Xmx4g -Xms2g"
```

---

## Performance Optimization

### JMeter Tuning

1. **Disable GUI Listeners During Load Testing**
   - Use non-GUI mode: `jmeter -n -t plan.jmx`
   - Listeners consume memory and CPU

2. **Increase Heap Memory**
   ```bash
   # Linux/Mac
   export HEAP="-Xmx4g -Xms2g"
   jmeter -n -t plan.jmx
   
   # Windows (PowerShell)
   $env:HEAP = "-Xmx4g -Xms2g"
   jmeter -n -t plan.jmx
   ```

3. **Disable Assertions in Stress Testing**
   - Assertions consume CPU
   - Enable only for validation tests

4. **Use Throughput Timer**
   - Limit request rate
   - Prevents overwhelming the server

### Backend Optimization

Monitor during tests:

```bash
# Watch CPU/Memory on Docker
docker stats

# Monitor MySQL connections
mysql> SHOW PROCESSLIST;
mysql> SHOW VARIABLES LIKE 'max_connections';
```

---

## Best Practices

### 1. Data Management

✓ **DO:**
- Use CSV fixtures for test data
- Refresh test data before each test run
- Use data from database (real but non-production)

✗ **DON'T:**
- Hardcode credentials in test plans
- Run tests against production
- Leave garbage data in database

### 2. Realistic Load Profiles

✓ **DO:**
- Gradual ramp-up (don't spike users instantly)
- Mix different request types
- Include think time (realistic user delays)

✗ **DON'T:**
- Load test with flat user count
- Send all requests to single endpoint
- Blast unrealistic throughput

### 3. Result Collection

✓ **DO:**
- Save results to JTL files
- Generate HTML reports
- Compare baselines over time

✗ **DON'T:**
- Rely on GUI listeners during tests
- Delete result files immediately
- Ignore warnings in logs

### 4. Test Plan Organization

✓ **DO:**
- Use descriptive names for samplers
- Organize with comments
- Extract configuration to properties

✗ **DON'T:**
- Create giant test plans (split into scenarios)
- Hardcode values in samplers
- Mix test data with test logic

### 5. Assertions

✓ **DO:**
- Assert status codes (200, 201, etc)
- Validate critical response fields
- Use meaningful assertion messages

✗ **DON'T:**
- Over-assert (too many slows test)
- Assert values that change per user
- Ignore assertion failures

### 6. Error Handling

✓ **DO:**
- Log errors for analysis
- Configure error handlers appropriately
- Capture response data for errors

✗ **DON'T:**
- Ignore error messages
- Stop test on first error
- Clear error logs after test

### 7. Documentation

✓ **DO:**
- Document test scenarios
- Explain load parameters
- Include pass/fail criteria

✗ **DON'T:**
- Create test plans without comments
- Forget scenario objectives
- Skip result interpretation

---

## Common Patterns

### Pattern 1: Sequential Authenticated Requests

```
Thread Group (5 users)
├── HTTP Request (POST /auth/login)
│   └── Extract token
├── Think Time (1-2 sec)
├── HTTP Request (GET /productos) [with token]
├── Think Time
├── HTTP Request (POST /carrito) [with token]
└── Think Time
```

### Pattern 2: Parallel Requests (Simulate Browser)

```
Throughput Controller (5 req/sec)
├── Sampler 1 (fetch style.css)
├── Sampler 2 (fetch script.js)
└── Sampler 3 (fetch image.png)
```

### Pattern 3: Conditional Requests

```
If Controller: ${response_contains_error} == true
├── HTTP Request (retry endpoint)
└── Extract retry status
```

### Pattern 4: Distributed Testing

```
Master JMeter (Controller):
├── Agent 1 (Slave 1) - 100 users
├── Agent 2 (Slave 2) - 100 users
└── Agent 3 (Slave 3) - 100 users
→ Total: 300 users coordinated
```

---

## Advanced Topics

### Groovy Scripting

Execute custom logic:

```groovy
// In JSR223 Sampler
def currentTime = System.currentTimeMillis()
vars.put("timestamp", currentTime.toString())

// In JSR223 PostProcessor
def responseCode = prev.getResponseCode()
if (responseCode != "200") {
    log.warn("Request failed with code: " + responseCode)
}
```

### JMeter Properties vs Variables

| Property | Variable |
|----------|----------|
| Global scope | Thread scope |
| Set via `-D` flag | Set via extractors/functions |
| `${__property(name)}` | `${variable_name}` |
| Example: `-DHOST=localhost` | Example: `${jwtToken}` |

### Plugins

Popular JMeter plugins:

- **Dummy Sampler** - Test without real requests
- **HTTP2 Sampler** - HTTP/2 support
- **WebSocket Sampler** - Real-time communication
- **Database Testing** - Direct SQL queries

---

## Resources

- [Official JMeter Documentation](https://jmeter.apache.org/usermanual/)
- [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [Regular Expressions in JMeter](https://jmeter.apache.org/usermanual/regular_expressions.html)
- [JMeter Functions](https://jmeter.apache.org/usermanual/functions.html)

---

**Last Updated:** May 2026  
**For Questions:** See README_JMETER.md
