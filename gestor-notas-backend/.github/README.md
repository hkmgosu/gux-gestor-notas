# 🚀 GitHub Actions Workflows

This repository includes several GitHub Actions workflows for continuous integration, deployment, and maintenance.

## 📋 Available Workflows

### 1. **Laravel CI** (`laravel.yml`)
**Triggers:** Push/PR to `main` or `develop` branches

**Features:**
- 🧪 Runs comprehensive test suite (Unit + Feature tests)
- 🔧 Tests multiple PHP versions (8.2, 8.3)
- 🗄️ MySQL service for database testing
- 📊 Code quality checks with Laravel Pint
- 🔍 Static analysis with PHPStan

**Jobs:**
- `laravel-tests`: Executes PHPUnit test suite
- `code-quality`: Runs code style and static analysis

### 2. **Deploy** (`deploy.yml`)
**Triggers:** Push to `main` branch, manual dispatch

**Features:**
- 🚀 Automated deployment pipeline
- ⚡ Performance optimizations (config/route/view caching)
- 🗄️ Database migrations
- 📦 Production-ready build

### 3. **Security Scan** (`security.yml`)
**Triggers:** Push/PR, weekly schedule (Mondays 9 AM UTC)

**Features:**
- 🔒 Composer dependency security checking
- 🕵️ Secret scanning with TruffleHog
- 📅 Scheduled weekly scans
- ⚠️ Vulnerability detection

### 4. **Update Dependencies** (`update-dependencies.yml`)
**Triggers:** Weekly schedule (Mondays 8 AM UTC), manual dispatch

**Features:**
- 📦 Automatic dependency updates
- 🔄 Creates pull requests for updates
- 📋 Detailed change descriptions
- 🤖 Automated maintenance

## 🔧 Setup Requirements

### Environment Variables
Add these secrets in your GitHub repository settings:

```env
# Required for deployment (if using remote deployment)
DEPLOY_HOST=your-server.com
DEPLOY_USER=deploy-user
DEPLOY_KEY=your-ssh-private-key

# Database (for production deployment)
DB_HOST=your-database-host
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
```

### Branch Protection
Recommended branch protection rules for `main`:

- ✅ Require status checks to pass before merging
- ✅ Require up-to-date branches before merging
- ✅ Include administrators
- ✅ Restrict pushes that create files larger than 100MB

## 📊 Workflow Status Badges

Add these badges to your main README.md:

```markdown
![Laravel CI](https://github.com/your-username/gestor-notas-backend/workflows/Laravel%20CI/badge.svg)
![Security Scan](https://github.com/your-username/gestor-notas-backend/workflows/Security%20Scan/badge.svg)
![Deploy](https://github.com/your-username/gestor-notas-backend/workflows/Deploy/badge.svg)
```

## 🛠️ Customization

### Adding New Tests
Tests are automatically discovered in:
- `tests/Feature/` - API and integration tests
- `tests/Unit/` - Unit tests for models and classes

### Deployment Customization
Edit `.github/workflows/deploy.yml` to add your specific deployment steps:

```yaml
- name: Deploy to Server
  run: |
    # Add your deployment commands here
    # e.g., rsync, docker build, kubectl apply, etc.
```

### Code Quality Rules
Customize code quality in `pint.json`:

```json
{
    "preset": "laravel",
    "rules": {
        "no_unused_imports": true,
        "ordered_imports": true
    }
}
```

## 📈 Monitoring

### Test Results
- View test results in the "Actions" tab
- Failed tests will block PR merging
- Test coverage reports available in job logs

### Security Alerts
- Security issues reported in "Security" tab
- Weekly scheduled scans for new vulnerabilities
- Automatic dependency update PRs

### Performance
- Deployment times tracked in workflow runs
- Cache optimization metrics in deploy logs
- Database migration timing

## 🚨 Troubleshooting

### Common Issues

**Tests failing locally but passing in CI:**
- Check PHP version compatibility
- Verify environment variables
- Clear local cache: `php artisan cache:clear`

**Deployment failures:**
- Check server connectivity
- Verify deployment credentials
- Review migration status

**Security scan false positives:**
- Review scan results in workflow logs
- Update `.github/workflows/security.yml` to exclude false positives
- Update vulnerable dependencies

## 📚 Additional Resources

- [Laravel Testing Documentation](https://laravel.com/docs/testing)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PHP Security Best Practices](https://owasp.org/www-project-php-security-cheat-sheet/)
