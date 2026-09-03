# Skill: GitHub Actions Publishing & Node Dependency Lockfile Rectification

## Purpose
Resolve and prevent GitHub Actions workflow failures related to missing package manager lockfiles (`package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock`) during `actions/setup-node` caching and deployment to GitHub Pages or Cloud hosting.

---

## Failure Pattern & Diagnostic
- **Error Signature**:
  ```text
  Dependencies lock file is not found in /home/runner/work/<repo>/<repo>. Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
  ```
- **Failing Step**: `actions/setup-node@v4` with `cache: 'npm'`.
- **Reason**:
  The action looks for `package-lock.json` or `npm-shrinkwrap.json` in the root directory to generate a cache key. When only alternative lockfiles (e.g. `bun.lock`) exist or no lockfile is committed, the action aborts before executing `npm install` or `npm ci`.

---

## Standard Remediation Procedure

### 1. Generate & Commit the Primary Lockfile
Run:
```bash
npm install --package-lock-only
# or
npm install
```
Verify that `package-lock.json` is generated at the project root and ensure it is tracked by Git (check that `.gitignore` does NOT ignore `package-lock.json`).

### 2. Configure GitHub Actions Workflow Steps
In `.github/workflows/deploy.yml` and `.github/workflows/ci.yml`:
```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'

- name: Install dependencies
  run: npm ci || npm install
```

### 3. Verify Static Output for GitHub Pages
Ensure the build outputs properly to `dist/` and include `.nojekyll` to prevent Jekyll from discarding folders/assets:
```yaml
- name: Build web application
  run: npm run build

- name: Ensure nojekyll exists for GitHub Pages
  run: touch dist/.nojekyll
```

---

## Verification Checklist
- [x] `package-lock.json` present in repository root.
- [x] `actions/setup-node@v4` with `cache: 'npm'` finds `package-lock.json`.
- [x] `npm ci || npm install` succeeds deterministically.
- [x] `npm run lint` and `npm run build` pass cleanly before deployment.
