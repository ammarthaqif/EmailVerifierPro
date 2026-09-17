export type VerificationStatus = 'valid' | 'risky' | 'invalid' | 'untested';

export interface MxRecordItem {
  exchange: string;
  priority: number;
}

export interface VerificationResult {
  email: string;
  normalizedEmail: string;
  status: VerificationStatus;
  deliverabilityScore: number; // 0 - 100
  reason: string;
  explanation: string;
  user: string;
  domain: string;
  syntaxValid: boolean;
  hasMxRecords: boolean;
  mxRecords: MxRecordItem[];
  provider: string;
  isDisposable: boolean;
  isRoleBased: boolean;
  isFreeMail: boolean;
  typoSuggestion?: string;
  checkedAt: string;
}

export type PhoneType = 'mobile' | 'landline' | 'toll_free' | 'voip' | 'invalid' | 'unknown';

export interface PhoneValidationResult {
  raw: string;
  digits: string;
  formatted: string;
  isValid: boolean;
  type: PhoneType;
  typeLabel: string;
  countryCode: string;
  countryName: string;
  nationalNumber: string;
  regionOrCity: string;
  isWhatsAppEligible: boolean;
  issue?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ColumnMappings {
  emailColumn: string;
  phoneColumn: string;
  ownerNameColumn: string;
  companyNameColumn: string;
  addressColumn: string;
}

export interface EmailRecord {
  id: string;
  rowIndex: number;
  originalEmail: string;
  currentEmail: string;
  rawData: Record<string, any>;
  emailColumnName: string;
  ownerName?: string;
  companyName?: string;
  phoneNumber?: string;
  phoneValidation?: PhoneValidationResult;
  registeredAddress?: string;
  verification?: VerificationResult;
  isSelected?: boolean;
  typoFixed?: boolean;
  whatsappSent?: boolean;
  whatsappSentAt?: string | number;
  emailSent?: boolean;
  emailSentAt?: string | number;
}

export interface WhatsAppTemplateConfig {
  id: string;
  name: string;
  text: string;
  defaultCountryCode: string;
}

export interface VerificationSummary {
  total: number;
  untested: number;
  valid: number;
  risky: number;
  invalid: number;
  typoCount: number;
  disposableCount: number;
  roleCount: number;
  whatsappSentCount?: number;
  emailSentCount?: number;
  contactedCount?: number;
  bothContactedCount?: number;
  notContactedCount?: number;
  hasPhoneCount?: number;
  mobilePhoneCount?: number;
  landlinePhoneCount?: number;
  invalidPhoneCount?: number;
  avgScore: number;
  topProviders: { provider: string; count: number }[];
}

export interface FilterState {
  search: string;
  status: 'all' | 'valid' | 'risky' | 'invalid' | 'untested' | 'hasTypo';
  whatsappFilter?: 'all' | 'sent' | 'not_sent' | 'has_phone' | 'no_phone';
  phoneFilter?: 'all' | 'mobile' | 'landline' | 'toll_free' | 'invalid' | 'has_phone' | 'no_phone';
  outreachFilter?: 'all' | 'contacted_any' | 'whatsapp_sent' | 'email_sent' | 'both_sent' | 'not_contacted';
  provider: string;
  minScore: number;
  maxScore: number;
}

export type DashboardTheme = 'slate' | 'midnight' | 'emerald' | 'sapphire' | 'amber';

export interface ThemeConfig {
  id: DashboardTheme;
  name: string;
  isDark: boolean;
  accentColor: string;
  bgClass: string;
}

