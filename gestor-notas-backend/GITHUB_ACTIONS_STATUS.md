# 🚀 GitHub Actions Status

Add these badges to your main README.md to show workflow status:

```markdown
## 📊 Build Status

![Laravel CI](https://github.com/YOUR_USERNAME/gestor-notas-backend/workflows/Laravel%20CI/badge.svg)
![Security Scan](https://github.com/YOUR_USERNAME/gestor-notas-backend/workflows/Security%20Scan/badge.svg)
![Deploy](https://github.com/YOUR_USERNAME/gestor-notas-backend/workflows/Deploy/badge.svg)

## 🧪 Quality Metrics

- **Test Coverage**: ✅ 98 assertions across 37 tests
- **Code Style**: ✅ Laravel Pint compliant
- **Security**: ✅ Regular dependency scanning
- **Performance**: ✅ Optimized builds and caching
```

## 🔧 Quick Setup

1. **Replace `YOUR_USERNAME`** with your actual GitHub username
2. **Push to GitHub** to trigger the first workflow run
3. **Check Actions tab** to see workflows in action
4. **Set up branch protection** for main branch (recommended)

## 📋 Workflow Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| Laravel CI | Push/PR | Run tests, code quality checks |
| Deploy | Push to main | Automated deployment |
| Security Scan | Weekly + Push | Vulnerability scanning |
| Update Dependencies | Weekly | Automated dependency updates |
