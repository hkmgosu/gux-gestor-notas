# GitHub Actions CI/CD Setup

This repository uses GitHub Actions for automated testing, building, and deployment. Here's an overview of the workflows:

## Workflows

### 1. Test and Build (`test-and-build.yml`)
**Triggers:** Push to `main` or `develop`, Pull Requests
- Runs tests on Node.js 18.x and 20.x
- Performs ESLint checks
- Builds the Next.js application
- Uploads test coverage and build artifacts

### 2. Code Quality (`code-quality.yml`)
**Triggers:** Push to `main` or `develop`, Pull Requests
- **Linting:** ESLint and TypeScript type checking
- **Security:** npm audit and vulnerability scanning
- **CodeQL:** GitHub's security analysis

### 3. Pull Request Checks (`pr-checks.yml`)
**Triggers:** Pull Request events
- **Smart detection:** Only runs relevant checks based on file changes
- **Test coverage:** Runs tests with coverage reporting
- **Build verification:** Ensures the application builds successfully
- **Automated comments:** Posts results directly on the PR

### 4. Deploy (`deploy.yml`)
**Triggers:** Push to `main` branch, Manual workflow dispatch
- Runs full test suite before deployment
- Builds production version
- Deploys to Vercel (requires setup)

## Setup Requirements

### Environment Variables & Secrets

To enable full functionality, add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

#### For Vercel Deployment
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_organization_id  
VERCEL_PROJECT_ID=your_project_id
```

#### For Environment-specific Variables
```
STAGING_API_URL=your_staging_api_url
PRODUCTION_API_URL=your_production_api_url
```

### Getting Vercel Credentials

1. **Vercel Token:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to Settings > Tokens
   - Create a new token with appropriate scope

2. **Organization & Project IDs:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and link project
   vercel login
   vercel link
   
   # Get IDs from .vercel/project.json
   cat .vercel/project.json
   ```

## Workflow Features

### 🔄 Automatic Testing
- Runs on multiple Node.js versions for compatibility
- Includes comprehensive test coverage reporting
- Fail-fast on test failures

### 🔍 Code Quality Assurance
- ESLint for code style and best practices
- TypeScript type checking
- Security vulnerability scanning
- GitHub CodeQL for security analysis

### 🚀 Smart Deployment
- Only deploys when tests pass
- Separate staging and production environments
- Manual deployment option available

### 💬 PR Integration
- Automatic status checks on pull requests
- Coverage and build status comments
- Path-based workflow optimization

## Branch Protection

Consider setting up branch protection rules:

1. Go to `Settings > Branches`
2. Add rule for `main` branch:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Include administrators
   - Select required status checks:
     - `test`
     - `lint`
     - `build`

## Local Development

Run the same checks locally:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Run type checking  
npm run type-check

# Run tests with coverage
npm run test:ci

# Build application
npm run build
```

## Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally:**
   - Check Node.js version differences
   - Verify environment variables
   - Review test isolation (async/await issues)

2. **Build failures:**
   - Ensure all dependencies are in `package.json`
   - Check TypeScript errors
   - Verify environment variables are set

3. **Deployment issues:**
   - Verify Vercel secrets are correctly set
   - Check build logs for specific errors
   - Ensure API URLs are accessible

### Debug Tips

- Use `workflow_dispatch` trigger for manual testing
- Check the Actions tab for detailed logs
- Enable debug logging by setting `ACTIONS_STEP_DEBUG=true`

## Monitoring

- **Test Results:** Available in Actions tab and PR comments
- **Coverage:** Uploaded as artifacts, viewable in workflow runs  
- **Security:** CodeQL results in Security tab
- **Deployments:** Vercel dashboard for deployment status
