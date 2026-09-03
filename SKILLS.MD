# Skill: GitHub Actions Publishing & GitHub Pages Deployment Rectification

## Purpose
Diagnose, resolve, and prevent GitHub Actions publishing and deployment failures, specifically:
1. Missing or ungenerated GitHub Pages URL when actions complete.
2. Missing package manager lockfiles (`package-lock.json`) during `actions/setup-node`.

---

## 1. Issue: Actions Completed but GitHub Pages URL Is Not Generated

### Failure Pattern & Symptoms
- GitHub Actions workflow runs to completion with a green checkmark, but:
  - No deployment URL appears under **Settings > Pages**.
  - No environment deployment URL appears on the repository's main page.
  - The step output for `page_url` is blank or unattached.

### Root Causes
1. **Repository Settings (Source Configuration)**:
   By default, new GitHub repositories have **Settings > Pages > Build and deployment > Source** set to **"Deploy from a branch"** (or None). When `actions/deploy-pages@v4` runs, GitHub Actions succeeds internally, but the GitHub Pages hosting system will not assign an active domain/URL until Source is switched to **"GitHub Actions"**.
2. **Monolithic Job vs. 2-Job Pages Architecture**:
   The official GitHub Pages deployment model requires two distinct jobs (`build` and `deploy`). When both are in one job, the GitHub Pages environment hook fails to bind `${{ steps.deployment.outputs.page_url }}` properly.
3. **Improper Step Sequencing**:
   `actions/configure-pages@v5` must execute in the `build` job before compilation so repository context is known.

### Standard Remediation Procedure

#### Step A: Configure the 2-Job Deployment Workflow (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Install dependencies
        run: npm ci || npm install

      - name: Typecheck and Lint
        run: npm run lint

      - name: Build web application
        run: npm run build

      - name: Ensure nojekyll exists for GitHub Pages
        run: touch dist/.nojekyll

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

      - name: Output Deployment URL to Summary
        if: always()
        run: |
          echo "## 🚀 Deployment Summary" >> $GITHUB_STEP_SUMMARY
          if [ -n "${{ steps.deployment.outputs.page_url }}" ]; then
            echo "Your site is live at: [${{ steps.deployment.outputs.page_url }}](${{ steps.deployment.outputs.page_url }})" >> $GITHUB_STEP_SUMMARY
            echo "::notice title=GitHub Pages URL::${{ steps.deployment.outputs.page_url }}"
          else
            echo "⚠️ **Deployment completed but URL was not emitted.**" >> $GITHUB_STEP_SUMMARY
            echo "Please verify in your GitHub repository: **Settings > Pages > Build and deployment > Source** is set to **GitHub Actions** (not 'Deploy from a branch')." >> $GITHUB_STEP_SUMMARY
          fi
```

#### Step B: Enable GitHub Actions as Pages Source in Repository Settings
1. Navigate to the GitHub repository.
2. Click **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, change the selection from **"Deploy from a branch"** to **"GitHub Actions"**.
4. Re-run the deployment workflow in the **Actions** tab.
5. The live site URL is generated immediately: `https://<owner>.github.io/<repo>/`.

---

## 2. Issue: Dependencies Lock File Is Not Found

### Failure Pattern
```text
Dependencies lock file is not found in /home/runner/work/<repo>/<repo>. Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

### Remediation
1. Generate and commit `package-lock.json`:
   ```bash
   npm install --package-lock-only
   ```
2. Verify `.gitignore` does not exclude `package-lock.json`.
3. In workflow files, install via `npm ci || npm install`.

---

## Verification Checklist
- [x] Repository has `package-lock.json` committed.
- [x] `.github/workflows/deploy.yml` uses the canonical 2-job (`build` and `deploy`) model.
- [x] `actions/configure-pages@v5` runs before `npm run build`.
- [x] Artifact directory `./dist` contains `index.html` and `.nojekyll`.
- [x] GitHub repository **Settings > Pages > Source** is set to **GitHub Actions**.
- [x] Deployment URL is emitted to workflow step summary and repository environment.
