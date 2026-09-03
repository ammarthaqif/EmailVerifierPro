# 📧 Email Verifier & Director WhatsApp Outreach Dashboard

[![Deploy to GitHub Pages](https://github.com/actions/deploy-pages/actions/workflows/deploy.yml/badge.svg)](https://github.com/actions/deploy-pages)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Enterprise-grade corporate lead hygiene and outreach suite.** Ingest Excel spreadsheets of company directors, verify email deliverability via real DNS MX servers, correct domain typos, and launch personalized WhatsApp outreach with automated dynamic tags.

---

### 👨‍💻 Developer & Attribution
**Developed by Ammar Thaqif**  
Email: `ammarthaqif.ar@gmail.com`

---

## 📑 Table of Contents
- [✨ Key Capabilities](#-key-capabilities)
- [📖 User Manual & Operating Guides](#-user-manual--operating-guides)
  - [Tab 1: Getting Started & Spreadsheet Ingestion](#tab-1-getting-started--spreadsheet-ingestion)
  - [Tab 2: Smart Column Mapping & Worksheet Selection](#tab-2-smart-column-mapping--worksheet-selection)
  - [Tab 3: Email DNS MX Verification & Typo Fixing](#tab-3-email-dns-mx-verification--typo-fixing)
  - [Tab 4: WhatsApp Outreach Automation & Dynamic Tags](#tab-4-whatsapp-outreach-automation--dynamic-tags)
  - [Tab 5: Clean Data Export & CRM Sync](#tab-5-clean-data-export--crm-sync)
  - [Tab 6: Cold Outreach Best Practices & Deliverability Tips](#tab-6-cold-outreach-best-practices--deliverability-tips)
- [🚀 One-Click GitHub Actions Deployment](#-one-click-github-actions-deployment)
- [🛡️ Resilient Architecture & Blank-Screen Protection](#️-resilient-architecture--blank-screen-protection)
- [💻 Local Development & Production Build](#-local-development--production-build)
- [⚙️ Technical Stack](#️-technical-stack)

---

## ✨ Key Capabilities

| Feature | Description |
| :--- | :--- |
| 📊 **Multi-Format Spreadsheet Ingestion** | Drag & drop `.xlsx`, `.xls`, or `.csv` files. Supports multi-tab workbooks with instant sheet switching. |
| 🔄 **Smart Column Auto-Detection** | Automatically identifies columns for Email, Mobile/Phone, Director Name, Company Name, and Address. |
| 🔍 **5-Stage Deliverability Engine** | RFC 5322 syntax analysis, live DNS MX record resolution, burner/disposable detection, and role-based filtering. |
| ⚡ **1-Click Typo Restoration** | Automatically fixes common domain misspellings (e.g. `@gnail.com` ➔ `@gmail.com`, `@yaho.com` ➔ `@yahoo.com`). |
| 💬 **WhatsApp Outreach Automation** | Launches pre-formatted WhatsApp chats with dynamic data placeholders (e.g. `{{OwnerName}}`, `{{CompanyName}}`). |
| 🌐 **International Phone Standardizer** | Normalizes phone formats (dashes, spaces, leading zeroes) with configurable country codes (`+60`, `+1`, `+65`, etc.). |
| 📥 **Customizable Dataset Export** | Download sanitized Excel (`.xlsx`) or CSV files filtered by deliverability score, status, or outreach tracking. |

---

## 📖 User Manual & Operating Guides

Learn how to use every module of the web app effectively:

### Tab 1: Getting Started & Spreadsheet Ingestion

<details open>
<summary><b>Click to expand: Uploading & Initializing Leads</b></summary>

1. **Accessing the Dashboard**:
   - Open the web application in any modern web browser (Chrome, Edge, Firefox, Safari).
2. **Uploading Your File**:
   - Drag and drop your `.xlsx`, `.xls`, or `.csv` spreadsheet onto the central upload zone, or click **"Browse Local Files"**.
   - The file is parsed client-side in your browser for complete data privacy.
3. **Testing Without a File**:
   - Click **"Load Sample Corporate Excel"** in the top navigation bar or upload screen.
   - This instantly populates realistic director records containing valid emails, typos, disposable domains, and missing records for testing.
4. **Quick Single Email Tester**:
   - Use the **Single Email Verification Bar** at the top of the screen to quickly test a standalone email address without uploading a full spreadsheet.

</details>

---

### Tab 2: Smart Column Mapping & Worksheet Selection

<details>
<summary><b>Click to expand: Mapping Headers & Multi-Sheet Workbooks</b></summary>

When working with diverse enterprise datasets, column naming conventions vary across companies. MailVerify Studio handles this automatically:

1. **Multi-Sheet Workbooks**:
   - If your Excel file has multiple sheets (e.g., *Directors*, *Branch Managers*, *Vendors*), use the **Sheet Dropdown** in the top bar to switch worksheets instantly.
2. **Reviewing Auto-Detected Fields**:
   - The system inspects your column headers and auto-maps:
     - **Email Column**: matches `Email`, `Mail`, `E-Mail`, `Contact_Email`.
     - **Phone Column**: matches `Phone`, `Mobile`, `WhatsApp`, `Contact_No`.
     - **Owner/Director**: matches `Director`, `Name`, `Full_Name`, `Owner`, `PIC`.
     - **Company Name**: matches `Company`, `Organization`, `Business_Name`.
     - **Registered Address**: matches `Address`, `Street`, `HQ_Address`.
3. **Custom Column Remapping**:
   - If your spreadsheet uses proprietary headers (e.g., `Client_Electronic_Mail`), click **"Edit Field Mapping"** in the Mapping Bar.
   - Select your target columns from the dropdowns and click **"Apply Mappings"**.
   - The entire dataset, table rows, and WhatsApp variables immediately update in real time.

</details>

---

### Tab 3: Email DNS MX Verification & Typo Fixing

<details>
<summary><b>Click to expand: Verification Engine & DNS Diagnostics</b></summary>

The verification engine runs an automated, multi-layer hygiene sequence across every row:

1. **The 5-Stage Verification Sequence**:
   - **Syntax Validation**: Ensures the local part and domain structure comply with RFC 5322 specifications.
   - **DNS MX Mail Server Discovery**: Queries authoritative Mail Exchange (MX) DNS records (via secure DNS-over-HTTPS or Node backend) to confirm the domain has active mail handlers capable of receiving messages.
   - **Disposable / Burner Email Detection**: Checks against an updated registry of 3,000+ throwaway email providers (e.g. Mailinator, GuerrillaMail).
   - **Role-Based Address Identification**: Flags shared corporate mailboxes (`info@`, `sales@`, `support@`, `admin@`) which have lower open rates.
   - **Quality Scoring (0 - 100)**: Aggregates all checks into a single deliverability score.

2. **Understanding Status Categories**:
   - 🟢 **Valid (Score 85–100)**: Active MX hostnames confirmed, syntax clean. Safe for cold outreach.
   - 🟡 **Risky (Score 45–80)**: Role-based address, catch-all domain, or corrected typo. Review advised.
   - 🔴 **Invalid (Score 0–40)**: Non-existent domain, missing MX servers, or fatal syntax syntax error. Guaranteed bounce.

3. **1-Click Typo Correction**:
   - Misspelled domains such as `@gnail.com`, `@yaho.com`, `@hotmial.com`, `@outlok.com` are highlighted with a badge.
   - Click **"Fix All Typos"** in the action bar to restore all misspelled addresses in 1 click.
   - Or click the **Fix Typo** icon on individual rows in the table.

4. **Deep DNS Diagnostics Modal**:
   - Click the **Inspect** (magnifying glass) icon on any record to view:
     - Exact DNS MX hostnames and priority levels (e.g. `aspmx.l.google.com`, priority `1`).
     - Mail service provider identification (Google Workspace, Microsoft 365, Proton, etc.).
     - Detailed technical explanation of failure or success.

</details>

---

### Tab 4: WhatsApp Outreach Automation & Dynamic Tags

<details>
<summary><b>Click to expand: Dynamic Templating & 1-Click Chat Launch</b></summary>

Directly reach out to corporate directors and business owners via WhatsApp without manually typing messages or cluttering your personal address book.

1. **Configuring Your Template**:
   - Click **"WhatsApp Template"** in the top navigation bar or mapping bar.
   - Compose your prescripted pitch or inquiry using dynamic tags.

2. **Dynamic Data Placeholder Tags**:
   Insert tags by typing or clicking the tag chips:
   - `{{OwnerName}}`: Director or contact person's name (e.g., *Mr. John Doe*).
   - `{{CompanyName}}`: Registered corporate entity (e.g., *Acme Corp Sdn Bhd*).
   - `{{Email}}`: Verified corporate email address.
   - `{{PhoneNumber}}`: Recipient's phone number.
   - `{{Address}}`: Company's registered office or street address.
   - **Any Custom Column**: You can use any column from your spreadsheet (e.g., `{{Industry}}`, `{{RegistrationNo}}`).

3. **Sample Outreach Template**:
   ```text
   Hi {{OwnerName}}, hope you are well.

   I noticed {{CompanyName}} is expanding operations. We assist corporate leaders with enterprise solutions and would love to share a brief overview with your team.

   Best regards,
   Ammar Thaqif
   ```

4. **International Number Normalization**:
   - The app cleans dashes, brackets, and local zero prefixes (e.g., converts `012-345 6789` to `60123456789`).
   - Select your default country code (e.g., **+60 Malaysia**, **+1 US/Canada**, **+65 Singapore**, **+44 UK**, **+61 Australia**) in the template modal.

5. **Launching Chats**:
   - **Direct 1-Click Launch**: Click the green WhatsApp icon on any table row to immediately open WhatsApp Web or Desktop with the message pre-filled.
   - **Preview & Edit Modal**: Click the message bubble icon to review the personalized message, make quick row-specific tweaks, and mark the status as sent.
   - The row will automatically display a **"WhatsApp Sent"** confirmation badge with timestamp.

</details>

---

### Tab 5: Clean Data Export & CRM Sync

<details>
<summary><b>Click to expand: Export Options & CSV/Excel Generation</b></summary>

Download sanitized lead lists ready for importing into HubSpot, Salesforce, Apollo, Mailchimp, or Lemlist:

1. **Opening Export**:
   - Click **"Export Clean Data"** in the dashboard filter bar.
2. **Export Formats**:
   - **Excel Workbook (.xlsx)**: Professional multi-column spreadsheet with styled header row and auto-fitted columns.
   - **Universal CSV (.csv)**: Clean UTF-8 comma-separated file for direct CRM import.
3. **Filtering Rules**:
   - **All Records**: Exports the full dataset.
   - **Only 100% Valid Emails**: Excludes risky and invalid emails to ensure zero bounce rates.
   - **Exclude Disposable Addresses**: Drops temporary and burner mailboxes.
   - **Current Filtered View**: Exports whatever subset is currently matched by your search and score filters.
4. **Diagnostic Data Inclusion**:
   - Toggle **"Include Deliverability Score & MX Details"** to attach diagnostic audit trails to each row.
   - Toggle **"Include WhatsApp Outreach Status"** to track which contacts have been engaged.

</details>

---

### Tab 6: Cold Outreach Best Practices & Deliverability Tips

<details>
<summary><b>Click to expand: B2B Cold Outreach Protocol</b></summary>

Follow these golden rules to protect your sending domain and maximize reply rates:

1. **Maintain Bounce Rates Below 2%**:
   - Email service providers (Google, Microsoft, Yahoo) flag sending domains whose hard bounce rates exceed 2-3%.
   - Always filter for **Valid** emails before uploading to your email marketing tool.
2. **Handle Catch-All Domains with Care**:
   - Catch-all domains accept all inbound emails at the server level regardless of whether the specific mailbox exists. Send test emails in small batches to verify recipient engagement.
3. **WhatsApp Cadence**:
   - When reaching out via WhatsApp, personalize each message using `{{OwnerName}}` and `{{CompanyName}}`.
   - Maintain a human pace between conversations to comply with WhatsApp Business anti-spam guidelines.

</details>

---

## 🚀 One-Click GitHub Actions Deployment

This repository includes pre-configured GitHub Actions workflows for continuous deployment to GitHub Pages.

### How to Publish to GitHub Pages:
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
   - Go to **Settings** > **Pages** (in the left sidebar under *Code and automation*).
   - Under **Build and deployment** > **Source**, change the dropdown to **GitHub Actions** (instead of *"Deploy from a branch"*).
3. Push a commit or go to the **Actions** tab and trigger **Deploy to GitHub Pages**.
4. The workflow will automatically publish your app at:
   ```text
   https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/
   ```
   *(The live URL is also printed directly in the GitHub Actions Run Summary)*.

---

## 🛡️ Resilient Architecture & Blank-Screen Protection

The application has been hardened against common frontend and deployment errors:

- **Strict Lockfile Synchronization (`package-lock.json`)**:
  - Ensures deterministic builds on Node.js 20+ and eliminates `Dependencies lock file is not found` errors in GitHub Actions.
- **Relative Asset Routing (`base: './'`)**:
  - Assets resolve properly on root domains, GitHub Pages subpaths (`https://user.github.io/repo/`), and local previews.
- **Jekyll Bypassing (`.nojekyll`)**:
  - Prevents GitHub Pages' Jekyll engine from discarding Vite asset bundles starting with underscores or dots.
- **Hybrid Verification Engine**:
  - When hosted on static GitHub Pages where custom Express backend routes (`/api/*`) are not running, the application seamlessly falls back to client-side DNS-over-HTTPS (DoH) queries with zero configuration.
- **React Error Boundary**:
  - Catches unexpected runtime crashes and renders a self-healing diagnostic recovery card.

---

## 💻 Local Development & Production Build

### Prerequisites
- Node.js 20 or higher
- npm 10 or higher

### Development Server:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Typecheck & Lint:
```bash
npm run lint
```

### Production Build:
```bash
npm run build
npm start
```

---

## ⚙️ Technical Stack

- **Frontend Core**: React 19, TypeScript 5.8, Vite 6
- **Styling & UI**: Tailwind CSS 4, Lucide Icons, Framer Motion
- **Spreadsheet Engine**: SheetJS (`xlsx`)
- **Verification Engine**: RFC 5322 Validator, DNS-over-HTTPS (DoH) MX Resolver, Disposable Domain Filter
- **Messaging Integration**: WhatsApp Direct URL Scheme (`wa.me`) with URL-encoded Dynamic Templating
- **CI/CD Pipeline**: GitHub Actions (`actions/configure-pages@v5`, `actions/deploy-pages@v4`)

---

### License
Released under the **MIT License**. Free for commercial and personal use.

*Developed with pride by **Ammar Thaqif**.*
