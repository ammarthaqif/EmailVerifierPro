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
  registeredAddress?: string;
  verification?: VerificationResult;
  isSelected?: boolean;
  typoFixed?: boolean;
  whatsappSent?: boolean;
  whatsappSentAt?: string | number;
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
  hasPhoneCount?: number;
  avgScore: number;
  topProviders: { provider: string; count: number }[];
}

export interface FilterState {
  search: string;
  status: 'all' | 'valid' | 'risky' | 'invalid' | 'untested' | 'hasTypo';
  whatsappFilter?: 'all' | 'sent' | 'not_sent' | 'has_phone' | 'no_phone';
  provider: string;
  minScore: number;
  maxScore: number;
}

