# AI Agent Guidelines & Project Instructions

## 1. GitHub Pages URL Generation & Deployment Architecture

### Issue Encountered
```
Published to github, actions completed but the url is not generated
```

### Root Causes
1. **GitHub Repository Pages Source Setting (Primary)**:
   - GitHub repositories default **Settings > Pages > Build and deployment > Source** to `"Deploy from a branch"` (or `None`).
   - When using `actions/deploy-pages@v4`, the workflow may report success, but GitHub will NOT create the active deployment environment or generate the public GitHub Pages URL until the repository source is explicitly configured.
2. **Monolithic Job vs. 2-Job Pages Architecture**:
   - When `build` and `deploy` are combined into a single job, the `environment: github-pages` context is initialized before the build artifact is packaged, leading to unpopulated `steps.deployment.outputs.page_url` outputs.
3. **Execution Timing of `actions/configure-pages`**:
   - Running `actions/configure-pages@v5` after building fails to inject repository context prior to artifact compilation.

### Rectifications Applied
1. **Separated Workflow into 2 Canonical Jobs (`build` and `deploy`)**:
   - **`build` job**: Check out code, setup Node 20 with npm cache, run `actions/configure-pages@v5`, install dependencies with `npm ci || npm install`, run linter and production build, touch `dist/.nojekyll`, and upload artifact via `actions/upload-pages-artifact@v3` targeting `./dist`.
   - **`deploy` job**: Marked with `needs: build`, binds `environment: { name: 'github-pages', url: ${{ steps.deployment.outputs.page_url }} }`, executes `actions/deploy-pages@v4`, and emits the URL into `$GITHUB_STEP_SUMMARY` and workflow notices.
2. **Added Step Summary & Annotation Notice**:
   - Automatically prints the live URL as a clickable link in the GitHub Actions Run Summary.
   - Provides on-screen troubleshooting if the URL is empty due to repository settings.

### Required User Action in GitHub Repository
To activate the URL for the first time:
1. Open the repository on GitHub.
2. Go to **Settings** > **Pages** (in the left sidebar under "Code and automation").
3. Under **Build and deployment** > **Source**, click the dropdown and select **GitHub Actions** (instead of "Deploy from a branch").
4. Go to the **Actions** tab, select **Deploy to GitHub Pages**, click **Run workflow**, or push any commit.
5. Your live URL will appear in **Settings > Pages**, in the **Actions** run summary, and on your repo's homepage under **Deployments** (`https://<username>.github.io/<repo>/`).

---

## 2. GitHub Actions Dependency Lockfile Protocol

### Issue Encountered
```
Dependencies lock file is not found in /home/runner/work/EmailVerifierPro/EmailVerifierPro. Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

### Root Cause
GitHub Actions workflows utilizing `actions/setup-node@v4` with `cache: 'npm'` strictly require an npm lockfile (`package-lock.json` or `npm-shrinkwrap.json`) in the repository to compute cache keys.

### Rectification Applied
1. **Lockfile Maintained**:
   - Canonical `package-lock.json` generated and committed in version control.
   - Verified that `package-lock.json` is not excluded by `.gitignore`.
2. **Resilient Installation**:
   - Workflow runs `npm ci || npm install` for deterministic builds.
3. **Mandatory Protocol**:
   - Whenever dependencies are updated in `package.json`, always run `npm install` to keep `package-lock.json` in sync.
