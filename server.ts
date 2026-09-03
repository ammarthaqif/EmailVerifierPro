import express from 'express';
import path from 'path';
import dns from 'dns';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Set DNS servers / timeout helpers
const dnsPromises = dns.promises;

// In-memory DNS cache to speed up batch verification and reduce network roundtrips
interface DnsCacheEntry {
  hasMx: boolean;
  mxRecords: { exchange: string; priority: number }[];
  provider: string;
  hasARecord: boolean;
  error?: string;
  timestamp: number;
}
const dnsCache = new Map<string, DnsCacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

// Common typo corrections map
const COMMON_TYPOS: Record<string, string> = {
  'gmaill.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gemail.com': 'gmail.com',
  'gmaul.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'yahou.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmali.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outllook.com': 'outlook.com',
  'outlock.com': 'outlook.com',
  'iclod.com': 'icloud.com',
  'icoud.com': 'icloud.com',
  'protnmail.com': 'protonmail.com',
  'protonmai.com': 'protonmail.com',
  'prtonmail.com': 'protonmail.com',
  'comcast.ne': 'comcast.net',
  'verizon.ne': 'verizon.net',
  'att.ne': 'att.net',
};

// Known disposable email domains (high frequency burner services)
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'tempmail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'trashmail.com',
  'sharklasers.com',
  'dispostable.com',
  'fakemailgenerator.com',
  'getairmail.com',
  'getnada.com',
  'mohmal.com',
  'mytemp.email',
  'crazymailing.com',
  'trashmail.net',
  'generator.email',
  'burnermail.io',
  'inboxkitten.com',
  'maildrop.cc',
  'harakirimail.com',
  'dropmail.me',
  'emailondeck.com',
  'fakemail.net',
  'tempm.com',
  'trashmail.ws',
  'grr.la',
  'pokemail.net',
  'spamgourmet.com',
  'receiveee.com',
  'mintemail.com',
  'mytempemail.com',
  'trashcanmail.com',
  'incognitomail.com',
  'tempinbox.com',
  'spambox.us',
]);

// Free email providers
const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'yahoo.co.uk',
  'yahoo.fr',
  'yahoo.ca',
  'yahoo.com.br',
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'aim.com',
  'zoho.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'gmx.com',
  'gmx.net',
  'yandex.com',
  'yandex.ru',
  'fastmail.com',
  'tutanota.com',
  'tuta.com',
  'rediffmail.com',
]);

// Common role-based prefixes
const ROLE_PREFIXES = new Set([
  'admin',
  'administrator',
  'support',
  'sales',
  'info',
  'contact',
  'billing',
  'finance',
  'help',
  'helpdesk',
  'service',
  'customer',
  'jobs',
  'careers',
  'hr',
  'recruiting',
  'marketing',
  'press',
  'media',
  'security',
  'abuse',
  'postmaster',
  'hostmaster',
  'webmaster',
  'root',
  'noreply',
  'no-reply',
  'donotreply',
  'do-not-reply',
  'office',
  'team',
  'general',
  'inquiry',
  'inquiries',
  'legal',
  'privacy',
  'compliance',
  'feedback',
]);

// Detect mail provider from MX host exchange string
function detectMailProvider(mxRecords: { exchange: string; priority: number }[], domain: string): string {
  if (DISPOSABLE_DOMAINS.has(domain)) return 'Disposable / Temporary Mailbox';
  
  if (!mxRecords || mxRecords.length === 0) {
    return 'No MX Provider';
  }

  const mxHosts = mxRecords.map((r) => r.exchange.toLowerCase()).join(' ');

  if (mxHosts.includes('google.com') || mxHosts.includes('googlemail.com') || mxHosts.includes('aspmx.l.google.com')) {
    return domain.endsWith('gmail.com') || domain.endsWith('googlemail.com') ? 'Google (Gmail Free)' : 'Google Workspace';
  }
  if (mxHosts.includes('outlook.com') || mxHosts.includes('protection.outlook.com') || mxHosts.includes('hotmail.com')) {
    return domain.endsWith('outlook.com') || domain.endsWith('hotmail.com') || domain.endsWith('live.com') ? 'Microsoft Outlook Free' : 'Microsoft 365 / Exchange';
  }
  if (mxHosts.includes('yahoodns.net') || mxHosts.includes('yahoo.com')) {
    return 'Yahoo Mail';
  }
  if (mxHosts.includes('icloud.com') || mxHosts.includes('apple.com')) {
    return 'Apple iCloud Mail';
  }
  if (mxHosts.includes('pphosted.com')) {
    return 'Proofpoint Enterprise Gateway';
  }
  if (mxHosts.includes('mimecast.com')) {
    return 'Mimecast Secure Gateway';
  }
  if (mxHosts.includes('protonmail.ch') || mxHosts.includes('proton.me')) {
    return 'Proton Mail (Encrypted)';
  }
  if (mxHosts.includes('zoho.com') || mxHosts.includes('zoho.eu')) {
    return 'Zoho Mail';
  }
  if (mxHosts.includes('amazonaws.com') || mxHosts.includes('awstrack.me')) {
    return 'Amazon SES';
  }
  if (mxHosts.includes('sendgrid.net')) {
    return 'SendGrid / Twilio';
  }
  if (mxHosts.includes('mailgun.org')) {
    return 'Mailgun';
  }
  if (mxHosts.includes('cloudflare.net')) {
    return 'Cloudflare Email Routing';
  }
  if (mxHosts.includes('barracudanetworks.com')) {
    return 'Barracuda Email Security';
  }
  if (mxHosts.includes('ovh.net')) {
    return 'OVH Cloud Mail';
  }

  return 'Custom / Corporate Mail Server';
}

// Timeout helper for DNS queries
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('DNS_TIMEOUT'));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// DNS lookup with cache
async function lookupDomainDns(domain: string): Promise<DnsCacheEntry> {
  const cleanDomain = domain.toLowerCase().trim();
  const cached = dnsCache.get(cleanDomain);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached;
  }

  let mxRecords: { exchange: string; priority: number }[] = [];
  let hasMx = false;
  let hasARecord = false;
  let errorMsg: string | undefined;

  try {
    const rawMx = await withTimeout(dnsPromises.resolveMx(cleanDomain), 2500);
    if (rawMx && rawMx.length > 0) {
      mxRecords = rawMx.sort((a, b) => a.priority - b.priority);
      hasMx = true;
    }
  } catch (err: any) {
    if (err.code !== 'ENODATA' && err.code !== 'ENOTFOUND') {
      errorMsg = err.message || 'MX lookup failed';
    }
  }

  // If no MX, check A record fallback
  if (!hasMx) {
    try {
      const aRecords = await withTimeout(dnsPromises.resolve4(cleanDomain), 1500);
      if (aRecords && aRecords.length > 0) {
        hasARecord = true;
      }
    } catch {
      hasARecord = false;
    }
  }

  const provider = detectMailProvider(mxRecords, cleanDomain);
  const entry: DnsCacheEntry = {
    hasMx,
    mxRecords,
    provider,
    hasARecord,
    error: errorMsg,
    timestamp: now,
  };

  dnsCache.set(cleanDomain, entry);
  return entry;
}

// Validate single email
async function verifyEmail(rawEmail: string) {
  const email = (rawEmail || '').trim();
  const normalizedEmail = email.toLowerCase();

  // Basic RFC 5322 regex validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!email || email.length > 254) {
    return {
      email,
      normalizedEmail,
      status: 'invalid' as const,
      deliverabilityScore: 0,
      reason: 'MALFORMED_SYNTAX',
      explanation: 'Email address is empty or exceeds the maximum length of 254 characters.',
      user: '',
      domain: '',
      syntaxValid: false,
      hasMxRecords: false,
      mxRecords: [],
      provider: 'Unknown',
      isDisposable: false,
      isRoleBased: false,
      isFreeMail: false,
      checkedAt: new Date().toISOString(),
    };
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return {
      email,
      normalizedEmail,
      status: 'invalid' as const,
      deliverabilityScore: 0,
      reason: 'INVALID_FORMAT',
      explanation: 'Email must contain exactly one "@" symbol separating the username and domain.',
      user: parts[0] || '',
      domain: parts.slice(1).join('@'),
      syntaxValid: false,
      hasMxRecords: false,
      mxRecords: [],
      provider: 'Unknown',
      isDisposable: false,
      isRoleBased: false,
      isFreeMail: false,
      checkedAt: new Date().toISOString(),
    };
  }

  const user = parts[0];
  const domain = parts[1].toLowerCase().trim();
  const syntaxValid = emailRegex.test(email) && !user.includes('..') && !domain.includes('..');

  if (!syntaxValid) {
    return {
      email,
      normalizedEmail,
      status: 'invalid' as const,
      deliverabilityScore: 0,
      reason: 'SYNTAX_ERROR',
      explanation: 'Email fails RFC 5322 syntax standards (contains illegal characters, consecutive dots, or malformed domain structure).',
      user,
      domain,
      syntaxValid: false,
      hasMxRecords: false,
      mxRecords: [],
      provider: 'Unknown',
      isDisposable: false,
      isRoleBased: false,
      isFreeMail: false,
      checkedAt: new Date().toISOString(),
    };
  }

  // Check for typo in domain
  let typoSuggestion: string | undefined;
  if (COMMON_TYPOS[domain]) {
    typoSuggestion = `${user}@${COMMON_TYPOS[domain]}`;
  }

  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  const isFreeMail = FREE_EMAIL_PROVIDERS.has(domain);
  const isRoleBased = ROLE_PREFIXES.has(user.toLowerCase());

  // Check DNS MX records
  const dnsResult = await lookupDomainDns(domain);

  let status: 'valid' | 'risky' | 'invalid' = 'valid';
  let deliverabilityScore = 95;
  let reason = 'DELIVERABLE';
  let explanation = 'Active mail server verified with valid DNS MX records. Ready for delivery.';

  if (isDisposable) {
    status = 'invalid';
    deliverabilityScore = 5;
    reason = 'DISPOSABLE_MAILBOX';
    explanation = 'Known disposable/burner email domain. Messages sent here will bounce or be discarded immediately.';
  } else if (!dnsResult.hasMx && !dnsResult.hasARecord) {
    status = 'invalid';
    deliverabilityScore = 0;
    reason = 'NO_MX_RECORDS';
    explanation = typoSuggestion
      ? `Domain "${domain}" does not exist or has no active mail exchange (MX) records. Did you mean ${typoSuggestion}?`
      : `Domain "${domain}" does not exist or has no active mail exchange (MX) records. Emails sent here will bounce.`;
  } else if (!dnsResult.hasMx && dnsResult.hasARecord) {
    status = 'risky';
    deliverabilityScore = 45;
    reason = 'FALLBACK_A_RECORD_ONLY';
    explanation = `Domain has no dedicated MX records, but an A record was found. SMTP delivery may fail on strict gateways.`;
  } else if (typoSuggestion) {
    status = 'risky';
    deliverabilityScore = 55;
    reason = 'DOMAIN_TYPO_SUSPECTED';
    explanation = `Suspicious domain name. Likely a typo for "${COMMON_TYPOS[domain]}". Correcting to "${typoSuggestion}" is recommended.`;
  } else if (isRoleBased) {
    status = 'risky';
    deliverabilityScore = 65;
    reason = 'ROLE_BASED_ACCOUNT';
    explanation = `Generic role-based address (${user}@) shared by teams. Lower engagement and higher unsubscribe rates expected.`;
  } else if (isFreeMail) {
    status = 'valid';
    deliverabilityScore = 88;
    reason = 'FREE_WEBMAIL_DELIVERABLE';
    explanation = 'Valid free webmail account with active Google/Yahoo/Microsoft mail server.';
  }

  return {
    email,
    normalizedEmail,
    status,
    deliverabilityScore,
    reason,
    explanation,
    user,
    domain,
    syntaxValid: true,
    hasMxRecords: dnsResult.hasMx,
    mxRecords: dnsResult.mxRecords,
    provider: dnsResult.provider,
    isDisposable,
    isRoleBased,
    isFreeMail,
    typoSuggestion,
    checkedAt: new Date().toISOString(),
  };
}

// ----------------- API ROUTES ----------------- //

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Single email verification endpoint
app.post('/api/verify-single', async (req, res) => {
  try {
    const { email } = req.body;
    if (typeof email !== 'string') {
      return res.status(400).json({ error: 'Field "email" is required.' });
    }
    const result = await verifyEmail(email);
    return res.json(result);
  } catch (err: any) {
    console.error('Verify single error:', err);
    return res.status(500).json({ error: 'Internal verification error', details: err.message });
  }
});

// Batch verification endpoint with concurrency control
app.post('/api/verify-batch', async (req, res) => {
  try {
    const { emails } = req.body;
    if (!Array.isArray(emails)) {
      return res.status(400).json({ error: 'Field "emails" must be an array of strings.' });
    }

    const CONCURRENCY_LIMIT = 15;
    const results = [];

    // Process in parallel chunks to maximize throughput without socket starvation
    for (let i = 0; i < emails.length; i += CONCURRENCY_LIMIT) {
      const chunk = emails.slice(i, i + CONCURRENCY_LIMIT);
      const chunkResults = await Promise.all(
        chunk.map(async (em) => {
          try {
            return await verifyEmail(typeof em === 'string' ? em : String(em || ''));
          } catch (e: any) {
            return {
              email: String(em || ''),
              normalizedEmail: String(em || '').toLowerCase(),
              status: 'invalid' as const,
              deliverabilityScore: 0,
              reason: 'LOOKUP_FAILED',
              explanation: 'Verification timed out or network error occurred during lookup.',
              user: '',
              domain: '',
              syntaxValid: false,
              hasMxRecords: false,
              mxRecords: [],
              provider: 'Unknown',
              isDisposable: false,
              isRoleBased: false,
              isFreeMail: false,
              checkedAt: new Date().toISOString(),
            };
          }
        })
      );
      results.push(...chunkResults);
    }

    return res.json({ results, count: results.length });
  } catch (err: any) {
    console.error('Verify batch error:', err);
    return res.status(500).json({ error: 'Internal batch verification error', details: err.message });
  }
});

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Optional Gemini AI Deliverability Audit
app.post('/api/ai-audit', async (req, res) => {
  try {
    const { total, valid, risky, invalid, topProviders, sampleInvalid } = req.body;
    
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        hasKey: false,
        executiveSummary: `Scanned ${total} email addresses: ${valid} valid (${Math.round((valid / (total || 1)) * 100)}%), ${risky} risky, and ${invalid} invalid.`,
        keyRecommendations: [
          'Exclude invalid domains and disposable inboxes before sending your campaign.',
          'Export clean data to maintain sender reputation and keep bounce rates below 2%.',
        ],
      });
    }

    const prompt = `You are a deliverability and email security expert.
Analyze this bulk email verification report and provide a crisp 3-sentence executive summary and 2 actionable recommendations for the sender:
- Total emails: ${total}
- Valid & Active: ${valid} (${Math.round((valid / (total || 1)) * 100)}%)
- Risky (Role/Catch-all/Typo): ${risky}
- Invalid/Bounce Trap/No MX: ${invalid}
- Top Mail Providers: ${JSON.stringify(topProviders || [])}
- Sample Invalid Errors: ${JSON.stringify(sampleInvalid || [])}

Provide your response adhering to the response schema.`;

    const modelConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: {
            type: Type.STRING,
            description: 'A crisp 3-sentence executive summary of the list deliverability health.',
          },
          keyRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: '2 actionable recommendations for the sender.',
          },
        },
        required: ['executiveSummary', 'keyRecommendations'],
      },
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: modelConfig,
      });
    } catch {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: modelConfig,
      });
    }

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      hasKey: true,
      executiveSummary: parsed.executiveSummary || 'Audit completed successfully.',
      keyRecommendations: parsed.keyRecommendations || [
        'Exclude invalid domains and disposable inboxes before broadcast.',
        'Verify sender authentication (SPF/DKIM) on your sending server.',
      ],
    });
  } catch (err: any) {
    console.error('Gemini audit error:', err);
    return res.json({
      hasKey: false,
      executiveSummary: 'Automated deliverability audit generated.',
      keyRecommendations: [
        'Exclude invalid domains and disposable inboxes before broadcast.',
        'Export deliverable records to ensure high inbox placement.',
      ],
    });
  }
});

// ----------------- VITE / STATIC HANDLER ----------------- //

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Email Verifier Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
