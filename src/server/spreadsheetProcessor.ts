import * as XLSX from 'xlsx';
import { EmailRecord, ColumnMappings } from '../types';
import { validateAndClassifyPhone } from '../utils/phoneValidator';

export interface ServerParsedSheetData {
  fileName: string;
  sheetNames: string[];
  selectedSheet: string;
  columns: string[];
  columnMappings: ColumnMappings;
  detectedEmailColumn: string;
  totalRows: number;
  records: EmailRecord[];
  processingTimeMs: number;
  serverProcessed: boolean;
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
      'emailid',
      'e-mail',
      'mail',
      'contactemail',
      'useremail',
      'directoremail',
      'companyemail',
      'officialemail',
      'corporateemail',
    ].includes(normalized);
  });
  if (headerMatch) return headerMatch;

  // 2. Scan sample data for '@' symbol
  const emailRegex = /@.*\./;
  for (const col of columns) {
    const matchCount = sampleRows.slice(0, 20).filter((row) => {
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
      'companyphone',
      'officenumber',
    ].includes(normalized);
  });
  if (headerMatch) return headerMatch;

  // Scan for numbers with typical phone structure
  const phoneRegex = /^(\+?\d[\d\s\-().]{6,20})$/;
  for (const col of columns) {
    const matchCount = sampleRows.slice(0, 20).filter((row) => {
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
      'managingdirector',
      'ceo',
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
      'corporatename',
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
      'fulladdress',
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

export interface ProcessSpreadsheetOptions {
  targetSheetName?: string;
  customMappings?: Partial<ColumnMappings>;
  defaultCountryCode?: string;
}

/**
 * Executes high-performance spreadsheet processing on the web server
 * Offloads XLSX parsing, decompression, column heuristics, and phone categorization
 * from user laptop CPU to the Cloud Run server.
 */
export function processSpreadsheetOnServer(
  buffer: Buffer,
  fileName: string,
  options: ProcessSpreadsheetOptions = {}
): ServerParsedSheetData {
  const startTime = Date.now();

  // Read workbook natively in Node.js
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    throw new Error('No worksheets found in uploaded file.');
  }

  const selectedSheet =
    options.targetSheetName && sheetNames.includes(options.targetSheetName)
      ? options.targetSheetName
      : sheetNames[0];

  const worksheet = workbook.Sheets[selectedSheet];
  if (!worksheet) {
    throw new Error(`Worksheet "${selectedSheet}" not found in workbook.`);
  }

  // Convert to JSON objects with default string values
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  // Extract unique column names
  const columnSet = new Set<string>();
  rawRows.forEach((row) => {
    Object.keys(row).forEach((k) => columnSet.add(k));
  });
  const columns = Array.from(columnSet);

  // Auto-detect columns
  const detectedMappings = detectAllColumns(columns, rawRows);
  const columnMappings: ColumnMappings = {
    ...detectedMappings,
    ...(options.customMappings || {}),
  };

  const detectedEmailColumn = columnMappings.emailColumn || columns[0] || '';
  const countryCode = options.defaultCountryCode || '60';

  // Build record models and classify telephone lines on the server
  const records: EmailRecord[] = rawRows.map((row, index) => {
    const emailVal = String(row[detectedEmailColumn] || '').trim();
    const ownerName = columnMappings.ownerNameColumn
      ? String(row[columnMappings.ownerNameColumn] || '').trim()
      : '';
    const companyName = columnMappings.companyNameColumn
      ? String(row[columnMappings.companyNameColumn] || '').trim()
      : '';
    const phoneNumber = columnMappings.phoneColumn
      ? String(row[columnMappings.phoneColumn] || '').trim()
      : '';
    const registeredAddress = columnMappings.addressColumn
      ? String(row[columnMappings.addressColumn] || '').trim()
      : '';

    const phoneValidation = phoneNumber
      ? validateAndClassifyPhone(phoneNumber, countryCode)
      : undefined;

    return {
      id: `row-${index + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      rowIndex: index + 1,
      originalEmail: emailVal,
      currentEmail: emailVal,
      ownerName: ownerName || undefined,
      companyName: companyName || undefined,
      phoneNumber: phoneNumber || undefined,
      phoneValidation,
      registeredAddress: registeredAddress || undefined,
      rawData: row,
      emailColumnName: detectedEmailColumn,
      isSelected: false,
      typoFixed: false,
      whatsappSent: false,
      emailSent: false,
    };
  });

  const processingTimeMs = Date.now() - startTime;

  return {
    fileName,
    sheetNames,
    selectedSheet,
    columns,
    columnMappings,
    detectedEmailColumn,
    totalRows: records.length,
    records,
    processingTimeMs,
    serverProcessed: true,
  };
}
