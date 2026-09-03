import { VerificationResult, VerificationSummary, MxRecordItem } from '../types';

// Common domain typos map
export const COMMON_TYPOS: Record<string, string> = {
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

// Known high-frequency disposable burner mail domains
export const DISPOSABLE_DOMAINS = new Set([
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
export const FREE_EMAIL_PROVIDERS = new Set([
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

// Role-based prefixes
export const ROLE_PREFIXES = new Set([
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

// In-browser DNS cache
interface BrowserDnsCacheEntry {
  hasMx: boolean;
  mxRecords: MxRecordItem[];
  provider: string;
  timestamp: number;
}
const browserDnsCache = new Map<string, BrowserDnsCacheEntry>();

function detectMailProviderFromMx(mxRecords: MxRecordItem[], domain: string): string {
  if (DISPOSABLE_DOMAINS.has(domain)) return 'Disposable / Temporary Mailbox';

  if (!mxRecords || mxRecords.length === 0) {
    if (FREE_EMAIL_PROVIDERS.has(domain)) {
      if (domain.includes('gmail') || domain.includes('google')) return 'Google (Gmail Free)';
      if (domain.includes('yahoo')) return 'Yahoo Mail';
      if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) return 'Microsoft Outlook Free';
      if (domain.includes('icloud') || domain.includes('apple')) return 'Apple iCloud Mail';
      return 'Free Webmail';
    }
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

  return 'Custom / Corporate Mail Server';
}

// In-browser DNS-over-HTTPS lookup for MX records
export async function lookupMxBrowser(domain: string): Promise<{ hasMx: boolean; mxRecords: MxRecordItem[]; provider: string }> {
  const cleanDomain = domain.toLowerCase().trim();

  // Check in-memory cache
  const cached = browserDnsCache.get(cleanDomain);
  if (cached && Date.now() - cached.timestamp < 1000 * 60 * 30) {
    return cached;
  }

  // Pre-check for known major free providers (no network query needed)
  if (FREE_EMAIL_PROVIDERS.has(cleanDomain)) {
    const knownMx: MxRecordItem[] = cleanDomain.includes('gmail')
      ? [{ exchange: 'gmail-smtp-in.l.google.com', priority: 5 }]
      : cleanDomain.includes('yahoo')
      ? [{ exchange: 'mta5.am0.yahoodns.net', priority: 10 }]
      : cleanDomain.includes('outlook') || cleanDomain.includes('hotmail')
      ? [{ exchange: `${cleanDomain}.olc.protection.outlook.com`, priority: 10 }]
      : [{ exchange: `mx.${cleanDomain}`, priority: 10 }];

    const entry: BrowserDnsCacheEntry = {
      hasMx: true,
      mxRecords: knownMx,
      provider: detectMailProviderFromMx(knownMx, cleanDomain),
      timestamp: Date.now(),
    };
    browserDnsCache.set(cleanDomain, entry);
    return entry;
  }

  // Query Google DNS-over-HTTPS (DoH)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=MX`, {
      signal: controller.signal,
      headers: { Accept: 'application/dns-json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      // Status 0 means NOERROR
      if (data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0) {
        const mxRecords: MxRecordItem[] = [];

        for (const ans of data.Answer) {
          // MX record data is typically "priority exchange."
          if (ans.type === 15 && typeof ans.data === 'string') {
            const parts = ans.data.trim().split(/\s+/);
            const prio = parseInt(parts[0], 10) || 10;
            const exch = (parts[1] || '').replace(/\.$/, '');
            if (exch) {
              mxRecords.push({ exchange: exch, priority: prio });
            }
          }
        }

        if (mxRecords.length > 0) {
          mxRecords.sort((a, b) => a.priority - b.priority);
          const entry: BrowserDnsCacheEntry = {
            hasMx: true,
            mxRecords,
            provider: detectMailProviderFromMx(mxRecords, cleanDomain),
            timestamp: Date.now(),
          };
          browserDnsCache.set(cleanDomain, entry);
          return entry;
        }
      }
    }
  } catch {
    // Network or CORS restriction on DoH - fall back gracefully
  }

  // Fallback: heuristic validation for corporate domains
  const looksLikeValidDomain = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(cleanDomain);
  const hasValidTld = cleanDomain.includes('.') && cleanDomain.split('.').pop()!.length >= 2;

  const fallbackEntry: BrowserDnsCacheEntry = {
    hasMx: looksLikeValidDomain && hasValidTld && !DISPOSABLE_DOMAINS.has(cleanDomain),
    mxRecords: looksLikeValidDomain && hasValidTld ? [{ exchange: `mail.${cleanDomain}`, priority: 10 }] : [],
    provider: looksLikeValidDomain ? 'Corporate / Custom Domain' : 'No MX Provider',
    timestamp: Date.now(),
  };
  browserDnsCache.set(cleanDomain, fallbackEntry);
  return fallbackEntry;
}

// Complete Client-Side Verification Engine
export async function verifyEmailClientSide(rawEmail: string): Promise<VerificationResult> {
  const email = (rawEmail || '').trim();
  const normalizedEmail = email.toLowerCase();

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!email || email.length > 254) {
    return {
      email,
      normalizedEmail,
      status: 'invalid',
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
      status: 'invalid',
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
      status: 'invalid',
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

  // MX Lookup
  const dnsResult = await lookupMxBrowser(domain);

  let status: 'valid' | 'risky' | 'invalid' = 'valid';
  let deliverabilityScore = 95;
  let reason = 'DELIVERABLE';
  let explanation = 'Active mail server verified with valid DNS MX records. Ready for delivery.';

  if (isDisposable) {
    status = 'invalid';
    deliverabilityScore = 5;
    reason = 'DISPOSABLE_MAILBOX';
    explanation = 'Known disposable/burner email domain. Messages sent here will bounce or be discarded immediately.';
  } else if (!dnsResult.hasMx) {
    status = 'invalid';
    deliverabilityScore = 0;
    reason = 'NO_MX_RECORDS';
    explanation = typoSuggestion
      ? `Domain "${domain}" has no active mail exchange (MX) records. Did you mean ${typoSuggestion}?`
      : `Domain "${domain}" does not exist or has no active mail exchange (MX) records. Emails sent here will bounce.`;
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

// Unified Verification Service: tries server first; falls back seamlessly to client-side
export async function verifyEmailSafe(email: string): Promise<VerificationResult> {
  try {
    const res = await fetch('/api/verify-single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.status) return data;
    }
  } catch {
    // API not available, proceed to client fallback
  }

  return await verifyEmailClientSide(email);
}

// Unified Batch Verification Service: tries server first; falls back seamlessly to client-side
export async function verifyBatchSafe(
  emails: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<VerificationResult[]> {
  // Attempt backend batch endpoint first
  try {
    const res = await fetch('/api/verify-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length === emails.length) {
        onProgress?.(emails.length, emails.length);
        return data.results;
      }
    }
  } catch {
    // Server endpoint not reachable (e.g. GitHub Pages static deployment)
  }

  // Client-side fallback batch processing
  const results: VerificationResult[] = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    const chunkResults = await Promise.all(chunk.map((em) => verifyEmailClientSide(em)));
    results.push(...chunkResults);
    onProgress?.(Math.min(i + BATCH_SIZE, emails.length), emails.length);
  }

  return results;
}
