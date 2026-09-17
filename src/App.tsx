import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SingleVerifyWidget } from './components/SingleVerifyWidget';
import { FileUploadZone } from './components/FileUploadZone';
import { StatsCards } from './components/StatsCards';
import { DashboardFilters } from './components/DashboardFilters';
import { EmailTable } from './components/EmailTable';
import { DiagnosticModal } from './components/DiagnosticModal';
import { ExportModal } from './components/ExportModal';
import { AiInsightsBanner } from './components/AiInsightsBanner';
import { ColumnMappingBar } from './components/ColumnMappingBar';
import { WhatsAppTemplateModal } from './components/WhatsAppTemplateModal';
import { WhatsAppSendModal } from './components/WhatsAppSendModal';
import { UserGuideModal } from './components/UserGuideModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CloudDatabaseSyncBar } from './components/CloudDatabaseSyncBar';
import { SavedDatasetsModal } from './components/SavedDatasetsModal';
import { SavedDatasetMeta, updateRecordOutreach } from './lib/firebase';
import {
  EmailRecord,
  VerificationResult,
  VerificationSummary,
  FilterState,
  ColumnMappings,
} from './types';
import {
  ParsedSheetData,
  parseExcelFile,
  generateSampleDataset,
  exportDataset,
  ExportOptions,
} from './utils/excelHelper';
import {
  DEFAULT_WHATSAPP_TEMPLATE,
  interpolateWhatsAppMessage,
  cleanPhoneNumber,
  generateWhatsAppUrl,
  validateAndClassifyPhone,
} from './utils/whatsappHelper';
import { verifyBatchSafe, verifyEmailSafe } from './utils/clientVerification';
import {
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  MessageSquare,
  BookOpen,
  FolderOpen,
  ShieldCheck,
} from 'lucide-react';

const STORAGE_KEY_TEMPLATE = 'mailverify_whatsapp_template_v1';
const STORAGE_KEY_COUNTRY = 'mailverify_whatsapp_country_v1';

const getSafeLocalStorage = (key: string, fallback: string): string => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const setSafeLocalStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage restrictions
  }
};

function DashboardApp() {
  const { isDark } = useTheme();
  const {
    user,
    saveDatasetToDb,
    dbSyncStatus,
    isSavingToDb,
    lastSavedAt,
    savedDatasets,
    loginWithGoogle,
  } = useAuth();

  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });

  const [sheetData, setSheetData] = useState<ParsedSheetData | null>(null);
  const [currentDatasetId, setCurrentDatasetId] = useState<string | null>(null);
  const [isSavedDatasetsModalOpen, setIsSavedDatasetsModalOpen] = useState(false);
  const [records, setRecords] = useState<EmailRecord[]>([]);
  const [mappings, setMappings] = useState<ColumnMappings>({
    emailColumn: '',
    phoneColumn: '',
    ownerNameColumn: '',
    companyNameColumn: '',
    addressColumn: '',
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // WhatsApp configuration & modals
  const [whatsAppTemplate, setWhatsAppTemplate] = useState<string>(() => {
    return getSafeLocalStorage(STORAGE_KEY_TEMPLATE, DEFAULT_WHATSAPP_TEMPLATE);
  });
  const [defaultCountryCode, setDefaultCountryCode] = useState<string>(() => {
    return getSafeLocalStorage(STORAGE_KEY_COUNTRY, '60');
  });
  const [isWhatsAppTemplateModalOpen, setIsWhatsAppTemplateModalOpen] = useState(false);
  const [whatsAppSendRecord, setWhatsAppSendRecord] = useState<EmailRecord | null>(null);

  // Filter & Pagination State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    phoneFilter: 'all',
    outreachFilter: 'all',
    provider: 'all',
    minScore: 0,
    maxScore: 100,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Diagnostic & Export Modals
  const [inspectRecord, setInspectRecord] = useState<EmailRecord | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  // Save WhatsApp template changes to localStorage
  const handleSaveWhatsAppTemplate = (newText: string, countryCode: string) => {
    setWhatsAppTemplate(newText);
    setDefaultCountryCode(countryCode);
    setSafeLocalStorage(STORAGE_KEY_TEMPLATE, newText);
    setSafeLocalStorage(STORAGE_KEY_COUNTRY, countryCode);

    // Re-evaluate phone classification for all records with the new default country code
    setRecords((prev) =>
      prev.map((r) => ({
        ...r,
        phoneValidation: r.phoneNumber ? validateAndClassifyPhone(r.phoneNumber, countryCode) : undefined,
      }))
    );
  };

  // Handle batch verification (resilient with online and client-side fallback)
  const runBatchVerification = useCallback(async (targetRecords: EmailRecord[]) => {
    if (targetRecords.length === 0) return;

    setIsVerifying(true);
    const totalToVerify = targetRecords.length;
    setProgress({ current: 0, total: totalToVerify });

    const CHUNK_SIZE = 15;
    const recordMap = new Map<string, EmailRecord>();

    for (let i = 0; i < targetRecords.length; i += CHUNK_SIZE) {
      const chunk = targetRecords.slice(i, i + CHUNK_SIZE);
      const emails = chunk.map((r) => r.currentEmail);

      try {
        const results = await verifyBatchSafe(emails);
        chunk.forEach((rec, idx) => {
          const verification = results[idx];
          if (verification) {
            recordMap.set(rec.id, {
              ...rec,
              verification,
            });
          }
        });
      } catch (err) {
        console.error('Batch verification error:', err);
      }

      const completed = Math.min(i + CHUNK_SIZE, totalToVerify);
      setProgress({ current: completed, total: totalToVerify });

      // Update state incrementally so UI renders progress smoothly
      setRecords((prev) =>
        prev.map((r) => (recordMap.has(r.id) ? recordMap.get(r.id)! : r))
      );
    }

    setIsVerifying(false);
  }, []);

  // Sync current dataset and records to user's private Firestore database
  const syncCurrentDatasetToCloud = useCallback(
    async (targetRecords?: EmailRecord[], dsId?: string) => {
      if (!user || !sheetData) return;
      const recs = targetRecords || records;
      if (recs.length === 0) return;

      const id = dsId || currentDatasetId || `dataset_${Date.now()}`;
      if (!currentDatasetId) {
        setCurrentDatasetId(id);
      }

      const validCount = recs.filter((r) => r.verification?.status === 'valid').length;
      const riskyCount = recs.filter((r) => r.verification?.status === 'risky').length;
      const invalidCount = recs.filter((r) => r.verification?.status === 'invalid').length;
      const untestedCount = recs.filter(
        (r) => !r.verification || r.verification.status === 'untested'
      ).length;
      const whatsappSentCount = recs.filter((r) => r.whatsappSent).length;
      const emailSentCount = recs.filter((r) => r.emailSent).length;

      const meta = {
        id,
        fileName: sheetData.fileName,
        sheetName: sheetData.selectedSheet,
        rowCount: recs.length,
        validCount,
        riskyCount,
        invalidCount,
        untestedCount,
        whatsappSentCount,
        emailSentCount,
        columnMappings: mappings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await saveDatasetToDb(meta, recs);
      } catch (err) {
        console.error('Error auto-syncing dataset to Firestore:', err);
      }
    },
    [user, sheetData, records, currentDatasetId, mappings, saveDatasetToDb]
  );

  // When new file or dataset is parsed
  const handleDataParsed = useCallback(
    (parsed: ParsedSheetData) => {
      const newDatasetId = `dataset_${Date.now()}`;
      setCurrentDatasetId(newDatasetId);
      setSheetData(parsed);
      setRecords(parsed.records);
      setMappings(parsed.columnMappings);
      setCurrentPage(1);
      setFilters({
        search: '',
        status: 'all',
        provider: 'all',
        minScore: 0,
        maxScore: 100,
      });

      // Automatically launch verification on the imported records
      runBatchVerification(parsed.records);
    },
    [runBatchVerification]
  );

  // Load dataset previously stored in user's cloud database
  const handleLoadSavedDataset = (meta: SavedDatasetMeta, loadedRecords: EmailRecord[]) => {
    const headers = [
      meta.columnMappings.emailColumn,
      meta.columnMappings.phoneColumn,
      meta.columnMappings.ownerNameColumn,
      meta.columnMappings.companyNameColumn,
      meta.columnMappings.addressColumn,
    ].filter(Boolean) as string[];

    const reconstructedSheet: ParsedSheetData = {
      fileName: meta.fileName,
      sheetNames: [meta.sheetName || 'Sheet1'],
      selectedSheet: meta.sheetName || 'Sheet1',
      columns: headers,
      records: loadedRecords,
      columnMappings: meta.columnMappings,
      detectedEmailColumn: meta.columnMappings.emailColumn || '',
    };

    setSheetData(reconstructedSheet);
    setRecords(loadedRecords);
    setMappings(meta.columnMappings);
    setCurrentDatasetId(meta.id);
    setCurrentPage(1);
    setFilters({
      search: '',
      status: 'all',
      phoneFilter: 'all',
      outreachFilter: 'all',
      provider: 'all',
      minScore: 0,
      maxScore: 100,
    });
  };

  // Load sample dataset
  const handleLoadSample = useCallback(() => {
    const buffer = generateSampleDataset();
    const parsed = parseExcelFile(buffer, 'Sample_Corporate_Directors.xlsx');
    handleDataParsed(parsed);
  }, [handleDataParsed]);

  // Reset to initial screen
  const handleReset = () => {
    setSheetData(null);
    setRecords([]);
    setCurrentDatasetId(null);
    setMappings({
      emailColumn: '',
      phoneColumn: '',
      ownerNameColumn: '',
      companyNameColumn: '',
      addressColumn: '',
    });
    setFilters({
      search: '',
      status: 'all',
      phoneFilter: 'all',
      provider: 'all',
      minScore: 0,
      maxScore: 100,
    });
  };

  // Update Column Mappings dynamically
  const handleUpdateMappings = (newMappings: ColumnMappings) => {
    if (!sheetData) return;

    const emailColChanged = newMappings.emailColumn !== mappings.emailColumn;

    const updatedRecords: EmailRecord[] = records.map((r) => {
      const emailVal = newMappings.emailColumn
        ? String(r.rawData[newMappings.emailColumn] || '').trim()
        : r.currentEmail;

      const ownerVal = newMappings.ownerNameColumn
        ? String(r.rawData[newMappings.ownerNameColumn] || '').trim()
        : r.ownerName;

      const companyVal = newMappings.companyNameColumn
        ? String(r.rawData[newMappings.companyNameColumn] || '').trim()
        : r.companyName;

      const phoneVal = newMappings.phoneColumn
        ? String(r.rawData[newMappings.phoneColumn] || '').trim()
        : r.phoneNumber;

      const addressVal = newMappings.addressColumn
        ? String(r.rawData[newMappings.addressColumn] || '').trim()
        : r.registeredAddress;

      const phoneValidation = phoneVal
        ? validateAndClassifyPhone(phoneVal, defaultCountryCode)
        : undefined;

      return {
        ...r,
        emailColumnName: newMappings.emailColumn || r.emailColumnName,
        originalEmail: emailColChanged ? emailVal : r.originalEmail,
        currentEmail: emailColChanged ? emailVal : r.currentEmail,
        verification: emailColChanged ? undefined : r.verification,
        typoFixed: emailColChanged ? false : r.typoFixed,
        ownerName: ownerVal,
        companyName: companyVal,
        phoneNumber: phoneVal,
        phoneValidation,
        registeredAddress: addressVal,
      };
    });

    setMappings(newMappings);
    setRecords(updatedRecords);

    if (emailColChanged) {
      runBatchVerification(updatedRecords);
    }
  };

  // 1-Click WhatsApp Direct Launch
  const handleDirectSendWhatsApp = (record: EmailRecord) => {
    const rawPhone =
      record.phoneNumber || (mappings.phoneColumn ? record.rawData[mappings.phoneColumn] : '');
    const phoneInfo = cleanPhoneNumber(rawPhone, defaultCountryCode);

    if (!phoneInfo.isValid) {
      // If phone is missing/invalid, open the preview modal so the user can inspect or copy
      setWhatsAppSendRecord(record);
      return;
    }

    const message = interpolateWhatsAppMessage(whatsAppTemplate, record, mappings);
    const url = generateWhatsAppUrl(phoneInfo.digits, message);

    // Open WhatsApp in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');

    // Mark row as contacted
    handleMarkWhatsAppSent(record.id);
  };

  // Preview before WhatsApp sending
  const handlePreviewWhatsApp = (record: EmailRecord) => {
    setWhatsAppSendRecord(record);
  };

  // Mark a row as WhatsApp Sent
  const handleMarkWhatsAppSent = (recordId: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              whatsappSent: true,
              whatsappSentAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  // Toggle individual WhatsApp sent status
  const handleToggleWhatsAppSent = (recordId: string, value?: boolean) => {
    let targetNewStatus = false;
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const newStatus = value !== undefined ? value : !r.whatsappSent;
        targetNewStatus = newStatus;
        return {
          ...r,
          whatsappSent: newStatus,
          whatsappSentAt: newStatus ? (r.whatsappSentAt || new Date().toISOString()) : undefined,
        };
      })
    );

    if (user && currentDatasetId) {
      updateRecordOutreach(user.uid, currentDatasetId, recordId, {
        whatsappSent: targetNewStatus,
        whatsappSentAt: targetNewStatus ? new Date().toISOString() : undefined,
      }).catch(console.error);
    }
  };

  // Toggle individual Email sent status
  const handleToggleEmailSent = (recordId: string, value?: boolean) => {
    let targetNewStatus = false;
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const newStatus = value !== undefined ? value : !r.emailSent;
        targetNewStatus = newStatus;
        return {
          ...r,
          emailSent: newStatus,
          emailSentAt: newStatus ? (r.emailSentAt || new Date().toISOString()) : undefined,
        };
      })
    );

    if (user && currentDatasetId) {
      updateRecordOutreach(user.uid, currentDatasetId, recordId, {
        emailSent: targetNewStatus,
        emailSentAt: targetNewStatus ? new Date().toISOString() : undefined,
      }).catch(console.error);
    }
  };

  // Quick email dispatch via standard mailto protocol
  const handleSendEmail = (record: EmailRecord) => {
    const email = record.currentEmail;
    if (!email) return;

    const company = record.companyName || '';
    const owner = record.ownerName || '';
    const subject = encodeURIComponent(
      company ? `Outreach & Inquiry - ${company}` : `Outreach & Partnership Inquiry`
    );
    const body = encodeURIComponent(
      `Hi ${owner || 'there'},\n\nI hope this email finds you well. I am reaching out regarding ${
        company || 'your business'
      }.\n\nBest regards,`
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    // Mark as email sent
    handleToggleEmailSent(record.id, true);
  };

  // Mark all records of a specific company as contacted (WhatsApp, Email, or Both)
  const handleMarkCompanyContacted = (
    companyName: string,
    channel: 'whatsapp' | 'email' | 'both',
    status: boolean
  ) => {
    if (!companyName) return;
    const norm = companyName.trim().toLowerCase();
    const now = new Date().toISOString();

    setRecords((prev) =>
      prev.map((r) => {
        const rComp = (r.companyName || '').trim().toLowerCase();
        if (rComp !== norm) return r;

        const updated = { ...r };
        if (channel === 'whatsapp' || channel === 'both') {
          updated.whatsappSent = status;
          updated.whatsappSentAt = status ? (r.whatsappSentAt || now) : undefined;
        }
        if (channel === 'email' || channel === 'both') {
          updated.emailSent = status;
          updated.emailSentAt = status ? (r.emailSentAt || now) : undefined;
        }
        return updated;
      })
    );
  };

  // Batch mark selected rows or filtered view as contacted
  const handleBatchMarkContacted = (
    channel: 'whatsapp' | 'email' | 'both',
    status: boolean
  ) => {
    const selectedIds = new Set(records.filter((r) => r.isSelected).map((r) => r.id));
    const targetIds = selectedIds.size > 0 ? selectedIds : new Set(filteredRecords.map((r) => r.id));
    if (targetIds.size === 0) return;

    const now = new Date().toISOString();
    setRecords((prev) =>
      prev.map((r) => {
        if (!targetIds.has(r.id)) return r;

        const updated = { ...r };
        if (channel === 'whatsapp' || channel === 'both') {
          updated.whatsappSent = status;
          updated.whatsappSentAt = status ? (r.whatsappSentAt || now) : undefined;
        }
        if (channel === 'email' || channel === 'both') {
          updated.emailSent = status;
          updated.emailSentAt = status ? (r.emailSentAt || now) : undefined;
        }
        return updated;
      })
    );
  };

  // Fix single typo
  const handleFixSingleTypo = async (record: EmailRecord) => {
    if (!record.verification?.typoSuggestion) return;
    const fixedEmail = record.verification.typoSuggestion;

    // Immediately update local email
    const updatedRecord: EmailRecord = {
      ...record,
      currentEmail: fixedEmail,
      typoFixed: true,
    };

    setRecords((prev) => prev.map((r) => (r.id === record.id ? updatedRecord : r)));

    // Re-verify the fixed email with safe fallback
    try {
      const verifiedResult = await verifyEmailSafe(fixedEmail);
      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id ? { ...updatedRecord, verification: verifiedResult } : r
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Fix all typos across dataset in one click
  const handleFixAllTypos = async () => {
    const typoRecords = records.filter(
      (r) => r.verification?.typoSuggestion && !r.typoFixed
    );
    if (typoRecords.length === 0) return;

    setIsVerifying(true);
    const updated = [...records];

    for (const rec of typoRecords) {
      const fixedEmail = rec.verification!.typoSuggestion!;
      const idx = updated.findIndex((r) => r.id === rec.id);
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          currentEmail: fixedEmail,
          typoFixed: true,
        };
      }
    }

    setRecords(updated);

    // Re-verify the updated records in batch
    const fixedList = updated.filter((r) => r.typoFixed);
    await runBatchVerification(fixedList);
    setIsVerifying(false);
  };

  // Selection toggle
  const handleToggleSelectRow = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSelected: !r.isSelected } : r))
    );
  };

  // Filter records based on active filters
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const res = rec.verification;
      const emailLower = rec.currentEmail.toLowerCase();
      const rawValues = Object.values(rec.rawData)
        .map((v) => String(v).toLowerCase())
        .join(' ');
      const pVal = rec.phoneValidation || (rec.phoneNumber ? validateAndClassifyPhone(rec.phoneNumber, defaultCountryCode) : undefined);

      // Search query across email, owner name, company name, phone, phone type/region, or reason
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesEmail = emailLower.includes(q);
        const matchesOwner = (rec.ownerName || '').toLowerCase().includes(q);
        const matchesCompany = (rec.companyName || '').toLowerCase().includes(q);
        const matchesPhone = (rec.phoneNumber || '').toLowerCase().includes(q);
        const matchesPhoneType = (pVal?.typeLabel || '').toLowerCase().includes(q);
        const matchesPhoneRegion = (pVal?.regionOrCity || '').toLowerCase().includes(q);
        const matchesReason = res?.reason.toLowerCase().includes(q) || false;
        const matchesExpl = res?.explanation.toLowerCase().includes(q) || false;
        const matchesRaw = rawValues.includes(q);
        if (
          !matchesEmail &&
          !matchesOwner &&
          !matchesCompany &&
          !matchesPhone &&
          !matchesPhoneType &&
          !matchesPhoneRegion &&
          !matchesReason &&
          !matchesExpl &&
          !matchesRaw
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status === 'valid' && res?.status !== 'valid') return false;
      if (filters.status === 'risky' && res?.status !== 'risky') return false;
      if (filters.status === 'invalid' && res?.status !== 'invalid') return false;
      if (filters.status === 'untested' && res !== undefined) return false;
      if (filters.status === 'hasTypo' && (!res?.typoSuggestion || rec.typoFixed)) return false;

      // Phone Line Classification filter
      if (filters.phoneFilter && filters.phoneFilter !== 'all') {
        if (filters.phoneFilter === 'mobile' && pVal?.type !== 'mobile') return false;
        if (filters.phoneFilter === 'landline' && pVal?.type !== 'landline') return false;
        if (filters.phoneFilter === 'toll_free' && pVal?.type !== 'toll_free') return false;
        if (filters.phoneFilter === 'invalid' && pVal?.type !== 'invalid') return false;
        if (filters.phoneFilter === 'has_phone' && !rec.phoneNumber) return false;
        if (filters.phoneFilter === 'no_phone' && !!rec.phoneNumber) return false;
      }

      // Outreach status filter (WhatsApp, Email, Both, or Not Contacted)
      if (filters.outreachFilter && filters.outreachFilter !== 'all') {
        const hasWa = !!rec.whatsappSent;
        const hasEm = !!rec.emailSent;
        if (filters.outreachFilter === 'contacted_any' && !hasWa && !hasEm) return false;
        if (filters.outreachFilter === 'whatsapp_sent' && !hasWa) return false;
        if (filters.outreachFilter === 'email_sent' && !hasEm) return false;
        if (filters.outreachFilter === 'both_sent' && (!hasWa || !hasEm)) return false;
        if (filters.outreachFilter === 'not_contacted' && (hasWa || hasEm)) return false;
      }

      // Provider filter
      if (filters.provider !== 'all' && res?.provider !== filters.provider) return false;

      return true;
    });
  }, [records, filters, defaultCountryCode]);

  // Select all filtered toggle
  const allFilteredSelected = useMemo(() => {
    if (filteredRecords.length === 0) return false;
    return filteredRecords.every((r) => r.isSelected);
  }, [filteredRecords]);

  const handleToggleSelectAllFiltered = () => {
    const newSelectedState = !allFilteredSelected;
    const filteredIds = new Set(filteredRecords.map((r) => r.id));
    setRecords((prev) =>
      prev.map((r) => (filteredIds.has(r.id) ? { ...r, isSelected: newSelectedState } : r))
    );
  };

  // Summary statistics computation
  const summary: VerificationSummary = useMemo(() => {
    let total = records.length;
    let untested = 0;
    let valid = 0;
    let risky = 0;
    let invalid = 0;
    let typoCount = 0;
    let disposableCount = 0;
    let roleCount = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let whatsappSentCount = 0;
    let emailSentCount = 0;
    let contactedCount = 0;
    let bothContactedCount = 0;
    let notContactedCount = 0;
    let hasPhoneCount = 0;
    let mobilePhoneCount = 0;
    let landlinePhoneCount = 0;
    let invalidPhoneCount = 0;
    const providerMap = new Map<string, number>();

    records.forEach((rec) => {
      const hasWa = !!rec.whatsappSent;
      const hasEm = !!rec.emailSent;
      if (hasWa) whatsappSentCount++;
      if (hasEm) emailSentCount++;
      if (hasWa || hasEm) contactedCount++;
      if (hasWa && hasEm) bothContactedCount++;
      if (!hasWa && !hasEm) notContactedCount++;

      const pVal = rec.phoneValidation || (rec.phoneNumber ? validateAndClassifyPhone(rec.phoneNumber, defaultCountryCode) : undefined);
      if (rec.phoneNumber && rec.phoneNumber.trim().length > 3) {
        hasPhoneCount++;
        if (pVal?.type === 'mobile') mobilePhoneCount++;
        else if (pVal?.type === 'landline') landlinePhoneCount++;
        else if (pVal?.type === 'invalid') invalidPhoneCount++;
      }

      const v = rec.verification;
      if (!v) {
        untested++;
      } else {
        if (v.status === 'valid') valid++;
        else if (v.status === 'risky') risky++;
        else if (v.status === 'invalid') invalid++;

        if (v.typoSuggestion && !rec.typoFixed) typoCount++;
        if (v.isDisposable) disposableCount++;
        if (v.isRoleBased) roleCount++;

        totalScore += v.deliverabilityScore;
        scoreCount++;

        const prov = v.provider || 'Other';
        providerMap.set(prov, (providerMap.get(prov) || 0) + 1);
      }
    });

    const topProviders = Array.from(providerMap.entries())
      .map(([provider, count]) => ({ provider, count }))
      .sort((a, b) => b.count - a.count);

    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    return {
      total,
      untested,
      valid,
      risky,
      invalid,
      typoCount,
      disposableCount,
      roleCount,
      whatsappSentCount,
      emailSentCount,
      contactedCount,
      bothContactedCount,
      notContactedCount,
      hasPhoneCount,
      mobilePhoneCount,
      landlinePhoneCount,
      invalidPhoneCount,
      avgScore,
      topProviders,
    };
  }, [records, defaultCountryCode]);

  const selectedCount = useMemo(() => records.filter((r) => r.isSelected).length, [records]);

  // Export dataset handler
  const handleExport = (options: ExportOptions) => {
    if (!sheetData) return;
    exportDataset(records, filteredRecords, options, sheetData.fileName);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Navbar
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        hasData={!!sheetData}
        isVerifying={isVerifying}
        totalRecords={records.length}
        onOpenWhatsAppTemplate={() => setIsWhatsAppTemplateModalOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenSavedDatasets={() => setIsSavedDatasetsModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Quick single email tester bar */}
        <SingleVerifyWidget />

        {!sheetData ? (
          /* Empty State: Upload / Ingestion Screen */
          <div>
            <div className="text-center max-w-2xl mx-auto mb-6 px-2">
              <h1
                className={`text-xl sm:text-3xl font-bold tracking-tight mb-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Excel Email Verification & Director WhatsApp Outreach
              </h1>
              <p
                className={`text-xs sm:text-sm mb-3 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Upload your company spreadsheet with director or owner names, corporate emails, phone numbers, and addresses. Verify deliverability, flag invalid addresses, and send prescripted WhatsApp messages with automatic data interpolation.
              </p>
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setIsUserGuideOpen(true)}
                  id="btn-hero-user-guide"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors shadow-2xs cursor-pointer min-h-[36px] ${
                    isDark
                      ? 'bg-blue-950/80 text-blue-300 border-blue-800 hover:bg-blue-900'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>User Manual & Guide</span>
                </button>

                {user && (
                  <button
                    onClick={() => setIsSavedDatasetsModalOpen(true)}
                    id="btn-hero-my-datasets"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors shadow-2xs cursor-pointer min-h-[36px] ${
                      isDark
                        ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>My Cloud Datasets ({savedDatasets.length})</span>
                  </button>
                )}
              </div>
            </div>

            <FileUploadZone
              onDataParsed={handleDataParsed}
              onLoadSample={handleLoadSample}
              isLoading={isVerifying}
            />
          </div>
        ) : (
          /* Dashboard State: Active Dataset */
          <div className="space-y-6">
            {/* Cloud Database Sync Status & Actions */}
            <CloudDatabaseSyncBar
              fileName={sheetData.fileName}
              totalRecords={records.length}
              onOpenSavedDatasets={() => setIsSavedDatasetsModalOpen(true)}
              onSyncNow={() => syncCurrentDatasetToCloud()}
            />

            {/* Sheet & Column Mapping Bar */}
            <ColumnMappingBar
              fileName={sheetData.fileName}
              sheetName={sheetData.selectedSheet}
              rowCount={records.length}
              columns={sheetData.columns}
              mappings={mappings}
              onUpdateMappings={handleUpdateMappings}
              onOpenWhatsAppModal={() => setIsWhatsAppTemplateModalOpen(true)}
            />

            {/* Verification Progress Bar */}
            {isVerifying && (
              <div className="bg-blue-600 text-white rounded-xl p-4 shadow-xs animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying DNS MX Mail Servers & Deliverability...</span>
                  </div>
                  <span className="font-mono">
                    {progress.current} / {progress.total} emails (
                    {progress.total > 0
                      ? Math.round((progress.current / progress.total) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full bg-blue-900/40 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${
                        progress.total > 0 ? (progress.current / progress.total) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Summary Statistics Cards */}
            <StatsCards
              summary={summary}
              onFilterByStatus={(status) => setFilters((prev) => ({ ...prev, status }))}
              activeStatus={filters.status}
              onFilterByPhone={(phoneFilter) => {
                setFilters((prev) => ({
                  ...prev,
                  phoneFilter: prev.phoneFilter === phoneFilter ? 'all' : phoneFilter,
                }));
                setCurrentPage(1);
              }}
              activePhoneFilter={filters.phoneFilter}
              onFilterByOutreach={(outreachFilter) => {
                setFilters((prev) => ({
                  ...prev,
                  outreachFilter: prev.outreachFilter === outreachFilter ? 'all' : outreachFilter,
                }));
                setCurrentPage(1);
              }}
              activeOutreachFilter={filters.outreachFilter}
            />

            {/* AI Insights & Campaign Deliverability Advice */}
            <AiInsightsBanner summary={summary} records={records} />

            {/* Dashboard Filters & Batch Controls */}
            <DashboardFilters
              filters={filters}
              onFilterChange={(newFilters) => {
                setFilters((prev) => ({ ...prev, ...newFilters }));
                setCurrentPage(1);
              }}
              summary={summary}
              onOpenExportModal={() => setIsExportOpen(true)}
              onFixAllTypos={handleFixAllTypos}
              onVerifyBatch={() =>
                runBatchVerification(records.filter((r) => !r.verification))
              }
              isVerifying={isVerifying}
              selectedCount={selectedCount}
              totalFilteredCount={filteredRecords.length}
              onToggleSelectAllFiltered={handleToggleSelectAllFiltered}
              allFilteredSelected={allFilteredSelected}
              onBatchMarkContacted={handleBatchMarkContacted}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Interactive Data Table / Cards with WhatsApp & Email Outreach */}
            <EmailTable
              records={filteredRecords}
              allRecords={records}
              mappings={mappings}
              defaultCountryCode={defaultCountryCode}
              onToggleSelectRow={handleToggleSelectRow}
              onFixSingleTypo={handleFixSingleTypo}
              onInspectRecord={(rec) => setInspectRecord(rec)}
              onSendWhatsApp={handleDirectSendWhatsApp}
              onPreviewWhatsApp={handlePreviewWhatsApp}
              onToggleWhatsAppSent={handleToggleWhatsAppSent}
              onToggleEmailSent={handleToggleEmailSent}
              onSendEmail={handleSendEmail}
              onMarkCompanyContacted={handleMarkCompanyContacted}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              totalFilteredRecords={filteredRecords.length}
              viewMode={viewMode}
            />
          </div>
        )}
      </main>

      {/* Draft Prescripted WhatsApp Message Modal */}
      <WhatsAppTemplateModal
        isOpen={isWhatsAppTemplateModalOpen}
        onClose={() => setIsWhatsAppTemplateModalOpen(false)}
        templateText={whatsAppTemplate}
        onSaveTemplate={handleSaveWhatsAppTemplate}
        mappings={mappings}
        availableColumns={sheetData?.columns || []}
        records={records}
        defaultCountryCode={defaultCountryCode}
      />

      {/* Row-specific WhatsApp Preview & Send Modal */}
      <WhatsAppSendModal
        isOpen={!!whatsAppSendRecord}
        record={whatsAppSendRecord}
        onClose={() => setWhatsAppSendRecord(null)}
        templateText={whatsAppTemplate}
        mappings={mappings}
        defaultCountryCode={defaultCountryCode}
        onMarkSent={handleMarkWhatsAppSent}
      />

      {/* Deep Inspection Diagnostics Modal */}
      <DiagnosticModal
        record={inspectRecord}
        onClose={() => setInspectRecord(null)}
        onFixTypo={handleFixSingleTypo}
      />

      {/* Clean Data Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
        summary={summary}
        selectedCount={selectedCount}
        filteredCount={filteredRecords.length}
        fileName={sheetData?.fileName || 'clean_records.xlsx'}
      />

      {/* Interactive User Manual & Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        onLoadSample={handleLoadSample}
      />

      {/* Cloud Saved Datasets Modal for Logged In User */}
      <SavedDatasetsModal
        isOpen={isSavedDatasetsModalOpen}
        onClose={() => setIsSavedDatasetsModalOpen(false)}
        onLoadDataset={handleLoadSavedDataset}
        currentDatasetId={currentDatasetId || undefined}
      />

      {/* Dashboard Footer with Signature */}
      <footer
        id="app-footer"
        className={`mt-12 py-6 border-t backdrop-blur-xs text-xs transition-colors ${
          isDark
            ? 'border-slate-800 bg-slate-900/90 text-slate-400'
            : 'border-slate-200 bg-white/90 text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Email Verifier & Director Outreach Suite
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Automated DNS Hygiene & WhatsApp Automation
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={() => setIsUserGuideOpen(true)}
              id="footer-btn-user-guide"
              className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-400 font-medium hover:underline cursor-pointer min-h-[36px]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>User Manual & Guide</span>
            </button>
            <span className="text-slate-400">•</span>
            <div
              id="dashboard-developer-signature"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium border shadow-2xs ${
                isDark
                  ? 'bg-slate-800 text-slate-200 border-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200/90'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>
                Developed by <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Ammar Thaqif</strong>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
