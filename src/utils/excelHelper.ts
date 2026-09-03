import * as XLSX from 'xlsx';
import { EmailRecord, VerificationResult, ColumnMappings } from '../types';

export interface ParsedSheetData {
  fileName: string;
  sheetNames: string[];
  selectedSheet: string;
  columns: string[];
  columnMappings: ColumnMappings;
  detectedEmailColumn: string;
  records: EmailRecord[];
}

// Auto-detect the column most likely to contain email addresses
export function detectEmailColumn(columns: string[], sampleRows: Record<string, any>[]): string {
  // 1. Look for column header names
  const headerMatch = columns.find((col) => {
    const normalized = col.toLowerCase().replace(/[^a-z0-9]/g, '');
    return [
      'email',
      'emailaddress',
      'emails',
      'emailaddr',
      'e-mail',
      'mail',
      'contactemail',
      'useremail',
      'directoremail',
      'companyemail',
      'officialemail',
    ].includes(normalized);
  });
  if (headerMatch) return headerMatch;

  // 2. Scan sample data for '@' symbol
  const emailRegex = /@.*\./;
  for (const col of columns) {
    const matchCount = sampleRows.slice(0, 15).filter((row) => {
      const val = String(row[col] || '');
      return emailRegex.test(val);
    }).length;

    if (matchCount > 0) {
      return col;
    }
  }

  return columns[0] || '';
}

// Auto-detect phone / WhatsApp column
export function detectPhoneColumn(columns: string[], sampleRows: Record<string, any>[]): string {
  const headerMatch = columns.find((col) => {
    const normalized = col.toLowerCase().replace(/[^a-z0-9]/g, '');
    return [
      'phone',
      'phonenumber',
      'mobile',
      'mobilenumber',
      'contact',
      'contactnumber',
      'contactno',
      'telephone',
      'tel',
      'whatsapp',
      'whatsappnumber',
      'hp',
      'hpnumber',
      'cell',
      'cellphone',
      'directorphone',
      'ownerphone',
    ].includes(normalized);
  });
  if (headerMatch) return headerMatch;

  // Scan for numbers with typical phone structure (starts with +, 0, or digit sequence)
  const phoneRegex = /^(\+?\d[\d\s\-\(\)\.]{6,20})$/;
  for (const col of columns) {
    const matchCount = sampleRows.slice(0, 15).filter((row) => {
      const val = String(row[col] || '').trim();
      return phoneRegex.test(val) && val.replace(/\D/g, '').length >= 7;
    }).length;

    if (matchCount >= 2) {
      return col;
    }
  }

  return '';
}

// Auto-detect Director / Owner Name column
export function detectOwnerNameColumn(columns: string[]): string {
  const headerMatch = columns.find((col) => {
    const normalized = col.toLowerCase().replace(/[^a-z0-9]/g, '');
    return [
      'director',
      'directorname',
      'owner',
      'ownername',
      'companyowner',
      'contactperson',
      'fullname',
      'name',
      'personincharge',
      'pic',
      'directorowner',
      'directorfullname',
      'founder',
      'executive',
    ].includes(normalized);
  });
  return headerMatch || '';
}

// Auto-detect Company Name column
export function detectCompanyNameColumn(columns: string[]): string {
  const headerMatch = columns.find((col) => {
    const normalized = col.toLowerCase().replace(/[^a-z0-9]/g, '');
    return [
      'company',
      'companyname',
      'organization',
      'business',
      'businessname',
      'enterprise',
      'entity',
      'corporate',
      'company_name',
    ].includes(normalized);
  });
  return headerMatch || '';
}

// Auto-detect Registered Address column
export function detectAddressColumn(columns: string[]): string {
  const headerMatch = columns.find((col) => {
    const normalized = col.toLowerCase().replace(/[^a-z0-9]/g, '');
    return [
      'registeredaddress',
      'address',
      'registeredoffice',
      'officeaddress',
      'companyaddress',
      'location',
      'premises',
      'streetaddress',
      'regaddress',
    ].includes(normalized);
  });
  return headerMatch || '';
}

export function detectAllColumns(columns: string[], sampleRows: Record<string, any>[]): ColumnMappings {
  return {
    emailColumn: detectEmailColumn(columns, sampleRows),
    phoneColumn: detectPhoneColumn(columns, sampleRows),
    ownerNameColumn: detectOwnerNameColumn(columns),
    companyNameColumn: detectCompanyNameColumn(columns),
    addressColumn: detectAddressColumn(columns),
  };
}

// Parse Excel or CSV file buffer
export function parseExcelFile(
  fileBuffer: ArrayBuffer,
  fileName: string,
  targetSheetName?: string,
  customMappings?: Partial<ColumnMappings>
): ParsedSheetData {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const selectedSheet = targetSheetName && sheetNames.includes(targetSheetName) ? targetSheetName : sheetNames[0];
  const worksheet = workbook.Sheets[selectedSheet];

  // Convert to JSON array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  // Extract all unique columns
  const columnSet = new Set<string>();
  rawRows.forEach((row) => {
    Object.keys(row).forEach((key) => columnSet.add(key));
  });
  const columns = Array.from(columnSet);

  const detectedMappings = detectAllColumns(columns, rawRows);
  const columnMappings: ColumnMappings = {
    ...detectedMappings,
    ...customMappings,
  };

  const detectedEmailColumn = columnMappings.emailColumn || columns[0] || '';

  const records: EmailRecord[] = rawRows.map((row, index) => {
    const emailVal = String(row[detectedEmailColumn] || '').trim();
    const ownerName = columnMappings.ownerNameColumn ? String(row[columnMappings.ownerNameColumn] || '').trim() : '';
    const companyName = columnMappings.companyNameColumn ? String(row[columnMappings.companyNameColumn] || '').trim() : '';
    const phoneNumber = columnMappings.phoneColumn ? String(row[columnMappings.phoneColumn] || '').trim() : '';
    const registeredAddress = columnMappings.addressColumn ? String(row[columnMappings.addressColumn] || '').trim() : '';

    return {
      id: `row-${index + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      rowIndex: index + 1,
      originalEmail: emailVal,
      currentEmail: emailVal,
      ownerName: ownerName || undefined,
      companyName: companyName || undefined,
      phoneNumber: phoneNumber || undefined,
      registeredAddress: registeredAddress || undefined,
      rawData: row,
      emailColumnName: detectedEmailColumn,
      isSelected: false,
      typoFixed: false,
      whatsappSent: false,
    };
  });

  return {
    fileName,
    sheetNames,
    selectedSheet,
    columns,
    columnMappings,
    detectedEmailColumn,
    records,
  };
}

// Parse raw pasted string of emails (one per line, comma or semicolon separated)
export function parseRawEmailList(rawText: string): ParsedSheetData {
  const lines = rawText
    .split(/[\r\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const records: EmailRecord[] = lines.map((email, index) => ({
    id: `paste-${index + 1}-${Date.now()}`,
    rowIndex: index + 1,
    originalEmail: email,
    currentEmail: email,
    rawData: { Email: email, Source: 'Manual Paste / Input' },
    emailColumnName: 'Email',
    isSelected: false,
    typoFixed: false,
    whatsappSent: false,
  }));

  const columnMappings: ColumnMappings = {
    emailColumn: 'Email',
    phoneColumn: '',
    ownerNameColumn: '',
    companyNameColumn: '',
    addressColumn: '',
  };

  return {
    fileName: 'Pasted_Email_List.xlsx',
    sheetNames: ['Pasted Contacts'],
    selectedSheet: 'Pasted Contacts',
    columns: ['Email', 'Source'],
    columnMappings,
    detectedEmailColumn: 'Email',
    records,
  };
}

// Generate realistic sample Excel file containing company directors, owners, emails, phones, and addresses
export function generateSampleDataset(): ArrayBuffer {
  const sampleContacts = [
    {
      'Director Name': "Tan Sri Dato' Richard Lee",
      'Company Name': 'Apex Global Logistics Sdn Bhd',
      'Designation': 'Managing Director',
      'Email': 'richard.lee@apexlogistics.com.my',
      'Phone Number': '+60 12-345 6789',
      'Registered Address': 'Level 28, Menara Ilham, No. 8 Jalan Binjai, 50450 Kuala Lumpur',
      'Industry': 'Freight & Logistics',
    },
    {
      'Director Name': 'Elena Rostova',
      'Company Name': 'Quantum Nexus Technologies Pte Ltd',
      'Designation': 'Founder & Executive Director',
      'Email': 'elena.rostova@outlok.com', // Typo in outlook
      'Phone Number': '+65 9123 4567',
      'Registered Address': '8 Marina View, #15-01 Asia Square Tower 1, Singapore 018960',
      'Industry': 'Software & AI',
    },
    {
      'Director Name': 'Dr. Ahmad Farhan Bin Zulkifli',
      'Company Name': 'Nusantara BioSciences Sdn Bhd',
      'Designation': 'Chief Executive Officer',
      'Email': 'farhan.zulkifli@gmail.com', // Free mail
      'Phone Number': '+60 19-876 5432',
      'Registered Address': 'Suite 12-03, Plaza Sentral, Jalan Stesen Sentral 5, 50470 Kuala Lumpur',
      'Industry': 'Biotechnology',
    },
    {
      'Director Name': 'Michael Vance',
      'Company Name': 'Cyberdyne Precision Systems LLC',
      'Designation': 'Director of Operations',
      'Email': 'm.vance@gmial.com', // Typo in gmail
      'Phone Number': '+1 (415) 555-0199',
      'Registered Address': '100 Pine Street, Suite 1250, San Francisco, CA 94111, USA',
      'Industry': 'Robotics & Hardware',
    },
    {
      'Director Name': 'Datin Serina Wong',
      'Company Name': 'Starlight Holdings Berhad',
      'Designation': 'Executive Chairman',
      'Email': 'serina@google.com', // Valid corporate
      'Phone Number': '+60 11-2345 6789',
      'Registered Address': 'Wisma Starlight, No. 45 Jalan Sultan Ismail, 50250 Kuala Lumpur',
      'Industry': 'Investment & Real Estate',
    },
    {
      'Director Name': 'Temp Burner Account',
      'Company Name': 'Ghost Entity Tech Ltd',
      'Designation': 'Unknown Owner',
      'Email': 'throwawaydirector@mailinator.com', // Disposable
      'Phone Number': '+60 13-000 1122',
      'Registered Address': 'Unit 3-B, Lot 888 Industrial Park, Subang Jaya, Selangor',
      'Industry': 'Consulting',
    },
    {
      'Director Name': 'Jessica Pearson',
      'Company Name': 'Pearson & Specter Legal Advisory',
      'Designation': 'Senior Managing Partner',
      'Email': 'jessica.pearson@microsoft.com', // Valid
      'Phone Number': '+1 (212) 555-0143',
      'Registered Address': '601 Lexington Avenue, 45th Floor, New York, NY 10022, USA',
      'Industry': 'Legal Advisory',
    },
    {
      'Director Name': 'Billing & Finance Admin',
      'Company Name': 'Acme Heavy Industrial Corp',
      'Designation': 'Finance Controller',
      'Email': 'billing@acme.com', // Role-based account
      'Phone Number': '+60 3-7890 1234',
      'Registered Address': 'Plot 19, Kawasan Perindustrian Senai, 81400 Senai, Johor',
      'Industry': 'Manufacturing',
    },
    {
      'Director Name': 'Alexander Thorne',
      'Company Name': 'Thorne Global Energy Ltd',
      'Designation': 'Chief Executive Officer',
      'Email': 'thorne@fake-energy-domain-99999912.xyz', // No MX records
      'Phone Number': '+44 7911 123456',
      'Registered Address': '100 Bishopsgate, Level 18, London EC2N 4AG, United Kingdom',
      'Industry': 'Renewable Energy',
    },
    {
      'Director Name': 'Lim Guan Seng',
      'Company Name': 'Heritage Straits Trading Sdn Bhd',
      'Designation': 'Company Owner',
      'Email': 'guanseng.lim@yahoo.com', // Valid free webmail
      'Phone Number': '0164455667', // Local format without country code
      'Registered Address': 'No. 12, Jalan Pantai Jerjak 1, Sungai Nibong, 11900 Bayan Lepas, Penang',
      'Industry': 'Import & Export',
    },
    {
      'Director Name': 'Invalid Syntax Contact',
      'Company Name': 'Malformed Records Corp',
      'Designation': 'General Manager',
      'Email': 'director@@syntax..broken', // Invalid syntax
      'Phone Number': '+60 17-654 3210',
      'Registered Address': 'Lot 44, Section 13, 46200 Petaling Jaya, Selangor',
      'Industry': 'General Services',
    },
    {
      'Director Name': 'Amina Al-Mansoor',
      'Company Name': 'Oasis Capital Partners Pte Ltd',
      'Designation': 'Managing Director',
      'Email': 'amina.mansoor@proton.me', // Valid secure mail
      'Phone Number': '+65 8234 5678',
      'Registered Address': '1 Raffles Place, #20-02 One Raffles Place, Singapore 048616',
      'Industry': 'Venture Capital',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleContacts);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Directors & Owners');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return excelBuffer;
}

// Export cleaned data to user chosen format
export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'json';
  scope: 'valid_only' | 'valid_and_risky' | 'all_with_diagnostics' | 'selected_only' | 'filtered_view';
  includeVerificationColumns: boolean;
  applyTypoFixes: boolean;
}

export function exportDataset(
  records: EmailRecord[],
  filteredRecords: EmailRecord[],
  options: ExportOptions,
  originalFileName: string
) {
  let targetRecords: EmailRecord[] = [];

  switch (options.scope) {
    case 'valid_only':
      targetRecords = records.filter((r) => r.verification?.status === 'valid');
      break;
    case 'valid_and_risky':
      targetRecords = records.filter((r) => r.verification?.status === 'valid' || r.verification?.status === 'risky');
      break;
    case 'selected_only':
      targetRecords = records.filter((r) => r.isSelected);
      if (targetRecords.length === 0) targetRecords = filteredRecords;
      break;
    case 'filtered_view':
      targetRecords = filteredRecords;
      break;
    case 'all_with_diagnostics':
    default:
      targetRecords = records;
      break;
  }

  // Construct final row objects
  const outputRows = targetRecords.map((rec) => {
    const rowObj: Record<string, any> = { ...rec.rawData };

    // Update the email in the original column if typo was fixed or updated
    const finalEmail = options.applyTypoFixes && rec.verification?.typoSuggestion
      ? rec.verification.typoSuggestion
      : rec.currentEmail;

    rowObj[rec.emailColumnName] = finalEmail;

    if (rec.ownerName) rowObj['Director / Owner Name'] = rec.ownerName;
    if (rec.companyName) rowObj['Company Name'] = rec.companyName;
    if (rec.phoneNumber) rowObj['Phone Number'] = rec.phoneNumber;
    if (rec.registeredAddress) rowObj['Registered Address'] = rec.registeredAddress;

    if (options.includeVerificationColumns) {
      rowObj['Verification Status'] = rec.verification ? rec.verification.status.toUpperCase() : 'UNTESTED';
      rowObj['Deliverability Score'] = rec.verification ? `${rec.verification.deliverabilityScore}%` : 'N/A';
      rowObj['Status Reason'] = rec.verification?.reason || 'Untested';
      rowObj['Status Explanation'] = rec.verification?.explanation || '';
      rowObj['Mail Provider'] = rec.verification?.provider || 'Unknown';
      rowObj['Has MX Records'] = rec.verification ? (rec.verification.hasMxRecords ? 'YES' : 'NO') : 'N/A';
      rowObj['Is Disposable'] = rec.verification ? (rec.verification.isDisposable ? 'YES' : 'NO') : 'N/A';
      rowObj['Is Role Account'] = rec.verification ? (rec.verification.isRoleBased ? 'YES' : 'NO') : 'N/A';
      rowObj['WhatsApp Contacted'] = rec.whatsappSent ? 'YES' : 'NO';
      if (rec.whatsappSentAt) {
        rowObj['WhatsApp Sent At'] = rec.whatsappSentAt;
      }
      if (rec.verification?.typoSuggestion) {
        rowObj['Suggested Typo Fix'] = rec.verification.typoSuggestion;
      }
    }

    return rowObj;
  });

  const baseName = originalFileName.replace(/\.[^/.]+$/, '');
  const timestamp = new Date().toISOString().slice(0, 10);
  const downloadFileName = `${baseName}_clean_${options.scope}_${timestamp}.${options.format}`;

  if (options.format === 'json') {
    const jsonStr = JSON.stringify(outputRows, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, downloadFileName);
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(outputRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clean Data');

  if (options.format === 'csv') {
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, downloadFileName);
    return;
  }

  // Excel format
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, downloadFileName);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
