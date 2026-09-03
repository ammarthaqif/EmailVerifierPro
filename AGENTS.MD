# AI Agent Guidelines & Project Instructions

## GitHub Actions Publishing & CI/CD Resolution

### Error Encountered
```
Dependencies lock file is not found in /home/runner/work/EmailVerifierPro/EmailVerifierPro. Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

### Root Cause
GitHub Actions workflows (`.github/workflows/deploy.yml` and `.github/workflows/ci.yml`) utilize `actions/setup-node@v4` with `cache: 'npm'`. When caching is enabled for npm, `actions/setup-node` strictly requires a lockfile (`package-lock.json` or `npm-shrinkwrap.json`) in the repository to compute cache keys. If only alternative lockfiles (such as `bun.lock`) exist or if `package-lock.json` has not been committed, the runner fails at the `setup-node` step before reaching dependency installation.

### Rectification Applied
1. **Lockfile Generation**:
   - Generated a canonical, reproducible `package-lock.json` compatible with Node.js 20+ and npm.
   - Guaranteed that `package-lock.json` is tracked in Git and not excluded by `.gitignore`.

2. **Workflow Hardening**:
   - In `.github/workflows/deploy.yml` and `.github/workflows/ci.yml`, dependency installation is configured as `npm ci || npm install`.
   - `npm ci` ensures fast, deterministic, clean-slate installs adhering strictly to `package-lock.json`.
   - The fallback `|| npm install` prevents build breakages if minor package variations occur.
   - Maintained `touch dist/.nojekyll` to prevent GitHub Pages Jekyll engine from ignoring Vite asset bundles starting with underscores or dots.

3. **Mandatory Developer & Agent Protocol**:
   - Whenever dependencies are added, updated, or removed (`package.json`), always run `npm install` to update `package-lock.json`.
   - Never remove or gitignore `package-lock.json`.
   - Keep both `package.json` and `package-lock.json` synchronized in version control at all times.
