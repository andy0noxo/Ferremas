# 📑 Índice de Documentación JMeter

**Última Actualización:** 15 Mayo 2026  
**Status:** ✅ Sistema completamente integrado y validado

---

## 🎯 COMENZAR AQUÍ

### ¿Eres nuevo en JMeter?
**→ Lee [README_JMETER.md](README_JMETER.md)** (15 minutos)
- Overview completo del sistema
- 4 escenarios de prueba
- Arquitectura y objetivos de performance

### ¿Quieres ejecutar pruebas ya?
**→ Lee [JMETER_EXECUTION.md](JMETER_EXECUTION.md)** (10 minutos)
- Comandos para ejecutar (local y Docker)
- Interpretación de resultados
- Best practices

### ¿Quieres visualizar en GUI?
**→ Lee [JMETER_GUI.md](JMETER_GUI.md)** (15 minutos)
- Cómo abrir los planes en GUI
- Workflow interactivo
- Ejecución en paralelo

### ¿Tienes problemas?
**→ Lee [TROUBLESHOOTING.md](TROUBLESHOOTING.md)** (Según necesidad)
- 12 problemas comunes
- Soluciones específicas
- Comandos de diagnóstico

---

## 📚 MAPA DE DOCUMENTACIÓN POR NIVEL

### 🟢 NIVEL 1: INICIO (Necesario para Empezar)

| Documento | Duración | Propósito |
|-----------|----------|----------|
| [README_JMETER.md](README_JMETER.md) | 15 min | Overview, escenarios, arquitectura |
| [JMETER_EXECUTION.md](JMETER_EXECUTION.md) | 10 min | Cómo ejecutar tests |
| [VALIDATION.md](VALIDATION.md) | 5 min | Status del sistema |

### 🟡 NIVEL 2: FUNCIONALIDAD (Para Usar Efectivamente)

| Documento | Duración | Propósito |
|-----------|----------|----------|
| [JMETER_GUI.md](JMETER_GUI.md) | 20 min | Visualización interactiva |
| [JMETER_GUIDE.md](JMETER_GUIDE.md) | 30 min | Técnicas avanzadas, best practices |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | 15 min | Solución de problemas |

### 🔴 NIVEL 3: REFERENCIA (Para Profundizar)

| Documento | Propósito |
|-----------|----------|
| [JMETER_GUIDE.md](JMETER_GUIDE.md) (sección Plan Structures) | Estructura detallada de cada plan |
| [VALIDATION_REPORT.md](VALIDATION_REPORT.md) | Validación técnica detallada |

---

## 🚀 Quick Command Reference

### Initialize & Run
```bash
# Setup test database (required first time)
npm run jmeter:setup-data

# Quick validation test (90 seconds)
npm run jmeter:local:smoke

# Or in Docker
npm run jmeter:docker:smoke
```

### All Available Commands
```bash
npm run jmeter:install              # Install JMeter locally
npm run jmeter:setup-data           # Initialize test database
npm run jmeter:local:smoke          # Local smoke test
npm run jmeter:local:carga          # Local load test
npm run jmeter:local:estres         # Local stress test
npm run jmeter:local:resistencia    # Local resistance test
npm run jmeter:docker:smoke         # Docker smoke test
npm run jmeter:docker:carga         # Docker load test
npm run jmeter:docker:estres        # Docker stress test
npm run jmeter:docker:resistencia   # Docker resistance test
npm run jmeter:cleanup              # Clean old reports
```

---

## 📋 Document Directory

### [QUICKSTART.md](QUICKSTART.md)
**5-Minute Setup Guide**
- Installation steps
- Quick start commands
- Result viewing
- Performance targets
- Common issues

**Best for:** First-time users, quick reference

---

### [README_JMETER.md](README_JMETER.md)
**Overview & Scenario Guide**
- Project structure
- 4 test scenarios explained
- Performance metrics
- Test plan details
- Troubleshooting summary

**Best for:** Understanding the system

---

### [JMETER_GUIDE.md](JMETER_GUIDE.md)
**Advanced Technical Reference**
- JMeter basics & concepts
- Test plan anatomy
- Creating new test plans
- Variable & token management
- Assertions & validation
- Debugging techniques
- Performance optimization
- Best practices
- Advanced topics

**Best for:** Developers, test plan customization

---

### [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
**Problem Solving Guide**
- 12 common issues covered
- Root cause analysis
- Step-by-step solutions
- Diagnostic commands
- Prevention tips

**Issues covered:**
1. Connection refused
2. Out of memory
3. Too many connections
4. 401 Unauthorized
5. Test failed with exit code 1
6. No test data found
7. Docker image not found
8. Network not found
9. Reports not generating
10. Heap variable errors
11. Host resolution failures
12. Incorrect results

**Best for:** Troubleshooting problems

---

### [VALIDATION_REPORT.md](VALIDATION_REPORT.md)
**Complete Technical Validation**
- Component checklist
- File structure verification
- Test plan validation
- Configuration review
- Data validation
- Docker verification
- Script validation
- npm integration check
- Documentation review

**Best for:** Verification, compliance, technical audit

---

### [VALIDATION_SUMMARY.md](VALIDATION_SUMMARY.md)
**Executive Summary**
- Key findings
- Implementation summary
- Validation checklist
- Test coverage
- Execution guide
- Performance expectations

**Best for:** Executive overview, team briefing

---

### [INDEX.md](INDEX.md) (This File)
**Documentation Navigation**
- Quick reference
- Document descriptions
- Command reference
- Reading paths

**Best for:** Finding what you need

---

## 🗂️ File Organization

```
Backend_Ferremas/jmeter/
│
├── 📖 Documentation
│   ├── INDEX.md                 ← You are here
│   ├── QUICKSTART.md            ← Start here (5 min)
│   ├── README_JMETER.md         ← Overview (15 min)
│   ├── JMETER_GUIDE.md          ← Advanced (30+ min)
│   ├── TROUBLESHOOTING.md       ← Problems
│   ├── VALIDATION_REPORT.md     ← Technical details
│   └── VALIDATION_SUMMARY.md    ← Executive summary
│
├── 🧪 Test Plans
│   ├── testplans/
│   │   ├── scenario_smoke.jmx
│   │   ├── scenario_carga.jmx
│   │   ├── scenario_estres.jmx
│   │   └── scenario_resistencia.jmx
│
├── 📊 Test Data
│   ├── data/
│   │   ├── usuarios.csv (13 users)
│   │   └── productos.csv (20 products)
│
├── ⚙️ Configuration
│   ├── config/
│   │   └── environment.properties (69 parameters)
│
├── 🔧 Scripts
│   ├── scripts/
│   │   ├── run-local.sh / run-local.bat
│   │   ├── run-docker.sh / run-docker.bat
│   │   ├── setup-fixtures.js
│   │   ├── install-jmeter.sh
│   │   ├── cleanup-reports.sh
│   │   └── docker-entrypoint.sh
│
├── 🐳 Docker Configuration
│   ├── Dockerfile
│   ├── docker-compose.jmeter.yml
│
└── 📁 Results & Reports
    └── reports/ (generated after tests)
```

---

## 🎓 Learning Paths

### Path 1: Quick Start (< 30 minutes)
1. Read [QUICKSTART.md](QUICKSTART.md) - 5 min
2. Run `npm run jmeter:setup-data` - 5 min
3. Run `npm run jmeter:local:smoke` - 2 min
4. View results - 5 min
5. Read [README_JMETER.md](README_JMETER.md) - 15 min

### Path 2: Comprehensive Understanding (< 1 hour)
1. Read [QUICKSTART.md](QUICKSTART.md) - 5 min
2. Read [README_JMETER.md](README_JMETER.md) - 15 min
3. Run setup & smoke test - 10 min
4. Read [VALIDATION_SUMMARY.md](VALIDATION_SUMMARY.md) - 10 min
5. Skim [JMETER_GUIDE.md](JMETER_GUIDE.md) - 15 min
6. Bookmark [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - reference

### Path 3: Advanced Development (2-3 hours)
1. Complete Path 2
2. Read [JMETER_GUIDE.md](JMETER_GUIDE.md) thoroughly - 45 min
3. Run all 4 test scenarios - 30 min
4. Analyze results - 15 min
5. Create custom test plan (optional) - 30 min

---

## 💡 Pro Tips

### For First-Time Users
- Start with [QUICKSTART.md](QUICKSTART.md)
- Run smoke test first (fastest validation)
- Open HTML report to see metrics
- Keep [TROUBLESHOOTING.md](TROUBLESHOOTING.md) handy

### For Integration
- Use Docker execution for CI/CD
- Run smoke test on every PR
- Run full scenarios nightly
- Monitor p95/p99 latency trends

### For Performance Analysis
- Compare results across scenarios
- Track metrics over time
- Identify bottlenecks from latency graphs
- Use error reports for debugging

### For Troubleshooting
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) first
2. Verify prerequisites (backend running, .env configured)
3. Check log files in jmeter/reports/
4. Review [JMETER_GUIDE.md](JMETER_GUIDE.md) for advanced issues

---

## 🔗 Cross-References

### If you want to...
| Goal | Document |
|------|----------|
| Get started quickly | [QUICKSTART.md](QUICKSTART.md) |
| Understand test scenarios | [README_JMETER.md](README_JMETER.md) |
| Create custom tests | [JMETER_GUIDE.md](JMETER_GUIDE.md) |
| Fix a problem | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| See what was validated | [VALIDATION_REPORT.md](VALIDATION_REPORT.md) |
| Get executive overview | [VALIDATION_SUMMARY.md](VALIDATION_SUMMARY.md) |
| Find documentation | [INDEX.md](INDEX.md) (this file) |

---

## 📞 Quick Support

### Most Common First Steps
```bash
# 1. Initialize test data
npm run jmeter:setup-data

# 2. Run quick test
npm run jmeter:local:smoke

# 3. Check if it failed
# Review console output and HTML report

# 4. If stuck
# Check TROUBLESHOOTING.md section matching your issue
```

### Where to Find Answers
- **"How do I start?"** → [QUICKSTART.md](QUICKSTART.md)
- **"What are the scenarios?"** → [README_JMETER.md](README_JMETER.md)
- **"How do I fix X?"** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **"How does Y work?"** → [JMETER_GUIDE.md](JMETER_GUIDE.md)
- **"What was verified?"** → [VALIDATION_REPORT.md](VALIDATION_REPORT.md)

---

## ✅ Ready?

**Start here:** [QUICKSTART.md](QUICKSTART.md)

**Execute this:**
```bash
npm run jmeter:setup-data && npm run jmeter:local:smoke
```

**Then:** Open the HTML report in `jmeter/reports/html-report-*/index.html`

---

## 📊 Documentation Stats

- Total lines: 2,000+
- Documents: 7
- Code examples: 50+
- Scenarios covered: 4
- Issues documented: 12
- Commands referenced: 11
- Guides: Beginner to Advanced

---

**Last Updated:** 2026-05-15  
**Status:** ✅ All validated and ready to use  
**Next Step:** Read [QUICKSTART.md](QUICKSTART.md)
