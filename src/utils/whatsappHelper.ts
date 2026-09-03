import { EmailRecord, ColumnMappings } from '../types';

export interface CleanPhoneResult {
  raw: string;
  digits: string;
  formatted: string;
  isValid: boolean;
}

// Clean phone numbers and prepend country code if needed
export function cleanPhoneNumber(rawPhone: string | number | undefined, defaultCountryCode = '60'): CleanPhoneResult {
  if (rawPhone === undefined || rawPhone === null) {
    return { raw: '', digits: '', formatted: '', isValid: false };
  }

  const raw = String(rawPhone).trim();
  if (!raw) {
    return { raw: '', digits: '', formatted: '', isValid: false };
  }

  // Normalize defaultCountryCode to purely digits without '+'
  const normCode = defaultCountryCode.replace(/\D/g, '') || '60';

  // Remove any spaces, dashes, brackets, dots
  let digits = raw.replace(/\D/g, '');

  // If the raw number started with '+', digits contains the full country code + number
  if (raw.startsWith('+')) {
    // Keep as is
  } else if (raw.startsWith('00')) {
    // International prefix like 0060 -> 60
    digits = digits.substring(2);
  } else if (raw.startsWith('0')) {
    // Local number starting with 0 (e.g., 0123456789 in Malaysia)
    // Replace leading 0 with default country code
    digits = `${normCode}${digits.substring(1)}`;
  } else if (digits.length <= 10 && !digits.startsWith(normCode)) {
    // Short number without country code
    digits = `${normCode}${digits}`;
  }

  // A valid mobile phone usually has between 8 and 15 digits
  const isValid = digits.length >= 8 && digits.length <= 16;

  // Pretty format for display
  let formatted = `+${digits}`;
  if (digits.startsWith('60') && digits.length >= 10) {
    // Malaysia: +60 12-345 6789
    formatted = `+60 ${digits.slice(2, 4)}-${digits.slice(4, 7)} ${digits.slice(7)}`;
  } else if (digits.startsWith('1') && digits.length === 11) {
    // US/Canada: +1 (415) 555-0199
    formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  } else if (digits.startsWith('65') && digits.length === 10) {
    // SG: +65 9123 4567
    formatted = `+65 ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }

  return {
    raw,
    digits,
    formatted,
    isValid,
  };
}

export interface PresetTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'director_verification',
    title: 'Director Verification & Official Inquiries',
    description: 'Professional outreach to confirm corporate communication channel',
    content:
      `Dear {owner_name},\n\nWe are reaching out regarding {company_name} (Registered Address: {registered_address}).\n\nOur records show {email} as your official corporate email. Could you kindly confirm if this is your active email for business correspondence?\n\nThank you for your time.\nCorporate Secretariat & Compliance`,
  },
  {
    id: 'invalid_email_alert',
    title: 'Invalid Email Alert & Update Request',
    description: 'Notifies owner that their email was flagged as invalid or bounced',
    content:
      `Hello {owner_name},\n\nOur system audit for {company_name} detected that the registered email on file ({email}) is currently {email_status} ({email_issue}).\n\nTo ensure uninterrupted delivery of legal notices and communications for {registered_address}, could you please provide your updated corporate email?\n\nBest regards,\nOperations Team`,
  },
  {
    id: 'business_outreach',
    title: 'Direct Business Proposal & Introduction',
    description: 'Polite executive message to start a direct WhatsApp conversation',
    content:
      `Hi {owner_name},\n\nHope this message finds you well at {company_name}. We attempted to connect via {email}, but wanted to reach out directly here to see if you would be open to a brief discussion regarding our partnership solutions.\n\nLooking forward to hearing from you!`,
  },
  {
    id: 'compliance_filing',
    title: 'Annual Compliance & Record Confirmation',
    description: 'Confirms director details and registered company address',
    content:
      `Official Notice for {company_name}\n\nAttention: {owner_name}\nRegistered Address: {registered_address}\nPrimary Email: {email}\n\nKindly acknowledge receipt of this message to confirm your registered details are up to date.`,
  },
];

export const DEFAULT_WHATSAPP_TEMPLATE = PRESET_TEMPLATES[0].content;

// Replaces all parameters in a template string with actual row values
export function interpolateWhatsAppMessage(
  template: string,
  record: EmailRecord,
  mappings: ColumnMappings
): string {
  let message = template;

  // Extract mapped values or fallbacks
  const ownerName =
    record.ownerName ||
    (mappings.ownerNameColumn ? String(record.rawData[mappings.ownerNameColumn] || '').trim() : '') ||
    'Director / Owner';

  const companyName =
    record.companyName ||
    (mappings.companyNameColumn ? String(record.rawData[mappings.companyNameColumn] || '').trim() : '') ||
    'Your Company';

  const email = record.currentEmail || record.originalEmail || '(No Email)';

  const phone =
    record.phoneNumber ||
    (mappings.phoneColumn ? String(record.rawData[mappings.phoneColumn] || '').trim() : '') ||
    '';

  const address =
    record.registeredAddress ||
    (mappings.addressColumn ? String(record.rawData[mappings.addressColumn] || '').trim() : '') ||
    'Registered Office';

  const emailStatus = record.verification
    ? `${record.verification.status.toUpperCase()} (${record.verification.deliverabilityScore}%)`
    : 'UNTESTED';

  const emailIssue = record.verification?.reason || 'Status Pending';
  const typoSuggestion = record.verification?.typoSuggestion || '';
  const provider = record.verification?.provider || 'Unknown';

  const variableMap: Record<string, string> = {
    // Owner name aliases
    '{owner_name}': ownerName,
    '{owner}': ownerName,
    '{director_name}': ownerName,
    '{director}': ownerName,
    '{name}': ownerName,
    '{contact_person}': ownerName,

    // Company name aliases
    '{company_name}': companyName,
    '{company}': companyName,
    '{business_name}': companyName,
    '{organization}': companyName,

    // Email aliases
    '{email}': email,
    '{email_address}': email,

    // Phone aliases
    '{phone}': phone,
    '{phone_number}': phone,
    '{mobile}': phone,

    // Address aliases
    '{registered_address}': address,
    '{address}': address,
    '{office_address}': address,

    // Verification diagnostics
    '{email_status}': emailStatus,
    '{email_issue}': emailIssue,
    '{reason}': emailIssue,
    '{typo_suggestion}': typoSuggestion,
    '{mail_provider}': provider,
  };

  // Replace standard placeholders
  Object.entries(variableMap).forEach(([key, val]) => {
    // Case-insensitive replace for {key}
    const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'gi');
    message = message.replace(regex, val);
  });

  // Also replace any generic raw column name: {Column Name} or {column_name}
  Object.entries(record.rawData).forEach(([colKey, colVal]) => {
    const directTag = `{${colKey}}`;
    const normalizedTag = `{${colKey.toLowerCase().replace(/[^a-z0-9]/g, '_')}}`;
    const strVal = String(colVal !== undefined && colVal !== null ? colVal : '').trim();

    message = message.split(directTag).join(strVal);
    message = message.split(normalizedTag).join(strVal);
  });

  return message;
}

// Generate the official WhatsApp universal URL
export function generateWhatsAppUrl(phoneDigits: string, text: string): string {
  const cleanDigits = phoneDigits.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanDigits}?text=${encodedText}`;
}
