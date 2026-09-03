# Email Verifier & Director WhatsApp Outreach Dashboard

A high-performance corporate lead verification and WhatsApp outreach web application. Ingest Excel/CSV spreadsheets containing directors, company names, emails, phone numbers, and registered addresses, perform deep RFC syntax and DNS MX deliverability checks, fix typos, and launch personalized WhatsApp outreach.

## 🚀 One-Click GitHub Actions Deployment

This repository includes pre-configured GitHub Actions workflows for continuous deployment:
- `.github/workflows/deploy.yml`: Deploys the web application to **GitHub Pages** on every push to `main` or `master`.
- `.github/workflows/ci.yml`: Validates linting and builds on pull requests.

### To publish on GitHub Pages:
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push a commit or go to the **Actions** tab and click **Run workflow** on "Deploy to GitHub Pages".
4. Your site will be published at `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`.

---

## 🛡️ Blank White Page Prevention (Hardened Deployment)

The codebase has been engineered to prevent blank white screens:
- **Relative Asset Routing (`base: './'`)**: Assets resolve reliably whether deployed at root domains, GitHub Pages subpaths (`/<repo-name>/`), or local static preview.
- **React Error Boundary**: Catches unhandled runtime exceptions with user-friendly recovery and reset controls.
- **Jekyll Bypassing (`.nojekyll`)**: Ensures GitHub Pages serves all Vite bundled assets without filtering.
- **Hybrid Verification Engine**: If running on static hosting (where custom Node backend `/api/*` routes are unavailable), the client automatically falls back to browser-based verification using RFC 5322 regex, common typo correction, burner domain filtering, and DNS-over-HTTPS (DoH) MX queries.
- **Safe Storage Protections**: All `localStorage` interactions are guarded against iframe and private browsing restrictions.

---

## 💻 Local Development & Full-Stack Deployment

### Development:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Production Build:
```bash
npm run build
npm start
```
