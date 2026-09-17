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

interface CountryRule {
  name: string;
  code: string;
  nationalPrefix?: string;
  classify: (nationalNumber: string) => {
    type: PhoneType;
    typeLabel: string;
    regionOrCity: string;
    isValid: boolean;
    issue?: string;
  };
}

const COUNTRY_RULES: Record<string, CountryRule> = {
  // Malaysia (+60)
  '60': {
    name: 'Malaysia',
    code: '60',
    nationalPrefix: '0',
    classify: (national) => {
      // Clean national number (strip leading 0 if present)
      const num = national.replace(/^0+/, '');

      // Check Toll-Free
      if (num.startsWith('1800') || num.startsWith('1300')) {
        return {
          type: 'toll_free',
          typeLabel: 'Toll-Free / Hotline',
          regionOrCity: num.startsWith('1800') ? 'Toll-Free (1800)' : 'Shared Cost (1300)',
          isValid: num.length === 10 || num.length === 8,
        };
      }

      // Mobile prefixes: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
      if (/^1[0-9]/.test(num)) {
        const prefix = num.substring(0, 2);
        // 11 is 10 digits national (11 digits with 60), others are 9 digits national (10 digits with 60)
        const isEleven = prefix === '11';
        const expectedLen = isEleven ? 10 : 9;
        const validLen = num.length >= 9 && num.length <= 10;

        let carrier = 'Mobile (General)';
        if (['12', '17'].includes(prefix)) carrier = 'Mobile (Maxis)';
        else if (['16', '14'].includes(prefix)) carrier = 'Mobile (Digi)';
        else if (['19', '13'].includes(prefix)) carrier = 'Mobile (Celcom)';
        else if (['18'].includes(prefix)) carrier = 'Mobile (U Mobile)';
        else if (['11'].includes(prefix)) carrier = 'Mobile (11x Block / Multi-carrier)';
        else if (['15'].includes(prefix)) carrier = 'Mobile / VoIP (15x)';

        if (!validLen) {
          return {
            type: 'mobile',
            typeLabel: 'Mobile (Incorrect Length)',
            regionOrCity: carrier,
            isValid: false,
            issue: `Mobile numbers in Malaysia require ${expectedLen} digits after prefix 0 (got ${num.length})`,
          };
        }

        return {
          type: 'mobile',
          typeLabel: 'Mobile Phone',
          regionOrCity: carrier,
          isValid: true,
        };
      }

      // Landline / Fixed Line Prefixes:
      // 3: Selangor, KL, Putrajaya (8 digits subscriber: 3 xxxx xxxx -> 9 digits national)
      // 4: Penang, Kedah, Perlis (7-8 digits subscriber: 4 xxx xxxx -> 8-9 digits national)
      // 5: Perak, Cameron Highlands
      // 6: Negeri Sembilan, Melaka, Muar
      // 7: Johor
      // 82 - 86: Sarawak
      // 87 - 89: Sabah, Labuan
      // 9: Pahang, Terengganu, Kelantan
      const landlinePrefixes: Record<string, string> = {
        '3': 'Kuala Lumpur / Selangor / Putrajaya (03)',
        '4': 'Penang / Kedah / Perlis (04)',
        '5': 'Perak / Cameron Highlands (05)',
        '6': 'Negeri Sembilan / Melaka / Muar (06)',
        '7': 'Johor (07)',
        '82': 'Sarawak - Kuching (082)',
        '83': 'Sarawak - Sri Aman (083)',
        '84': 'Sarawak - Sibu / Sarikei (084)',
        '85': 'Sarawak - Miri / Limbang (085)',
        '86': 'Sarawak - Bintulu (086)',
        '87': 'Labuan / Sabah Interior (087)',
        '88': 'Sabah - Kota Kinabalu / Kudat (088)',
        '89': 'Sabah - Sandakan / Tawau / Lahad Datu (089)',
        '9': 'Pahang / Terengganu / Kelantan (09)',
      };

      // Check 2-digit geographic prefixes first (82-89)
      const prefix2 = num.substring(0, 2);
      if (landlinePrefixes[prefix2]) {
        const validLen = num.length >= 8 && num.length <= 9;
        return {
          type: 'landline',
          typeLabel: 'Landline (Fixed Office Line)',
          regionOrCity: landlinePrefixes[prefix2],
          isValid: validLen,
          issue: validLen ? undefined : `Expected 8 or 9 digits for East Malaysia landline (got ${num.length})`,
        };
      }

      // Check 1-digit geographic prefix (3, 4, 5, 6, 7, 9)
      const prefix1 = num.substring(0, 1);
      if (landlinePrefixes[prefix1]) {
        // Area 03 has 8-digit subscriber (total 9 digits with 3)
        // Area 04-09 has 7 or 8 digits subscriber (total 8-9 digits)
        const validLen = num.length >= 8 && num.length <= 9;
        return {
          type: 'landline',
          typeLabel: 'Landline (Fixed Office Line)',
          regionOrCity: landlinePrefixes[prefix1],
          isValid: validLen,
          issue: validLen ? undefined : `Expected 8 or 9 digits for Peninsular Malaysia landline (got ${num.length})`,
        };
      }

      return {
        type: 'invalid',
        typeLabel: 'Invalid Malaysian Number',
        regionOrCity: 'Unrecognized Prefix',
        isValid: false,
        issue: 'Malaysian numbers must start with 01 (Mobile), 03-09 (Landline), or 1800/1300',
      };
    },
  },

  // Singapore (+65)
  '65': {
    name: 'Singapore',
    code: '65',
    classify: (national) => {
      const num = national.replace(/^0+/, '');
      if (num.length !== 8) {
        return {
          type: 'invalid',
          typeLabel: 'Invalid SG Length',
          regionOrCity: 'Singapore',
          isValid: false,
          issue: `Singapore numbers must be exactly 8 digits (got ${num.length})`,
        };
      }

      if (num.startsWith('8') || num.startsWith('9')) {
        return {
          type: 'mobile',
          typeLabel: 'Mobile Phone',
          regionOrCity: 'Singapore Mobile (Singtel / StarHub / M1 / SIMBA)',
          isValid: true,
        };
      }

      if (num.startsWith('6')) {
        return {
          type: 'landline',
          typeLabel: 'Landline (Fixed Office Line)',
          regionOrCity: 'Singapore Fixed Wireline',
          isValid: true,
        };
      }

      if (num.startsWith('3')) {
        return {
          type: 'voip',
          typeLabel: 'VoIP / IP Phone',
          regionOrCity: 'Singapore Broadband Phone',
          isValid: true,
        };
      }

      if (num.startsWith('1800')) {
        return {
          type: 'toll_free',
          typeLabel: 'Toll-Free',
          regionOrCity: 'Singapore Toll-Free (1800)',
          isValid: true,
        };
      }

      return {
        type: 'invalid',
        typeLabel: 'Invalid Singapore Prefix',
        regionOrCity: 'Singapore',
        isValid: false,
        issue: 'Singapore numbers must begin with 8/9 (Mobile), 6 (Landline), or 3 (VoIP)',
      };
    },
  },

  // United States & Canada (+1 - NANP)
  '1': {
    name: 'United States / Canada',
    code: '1',
    classify: (national) => {
      const num = national.replace(/^1+/, ''); // strip leading 1 if already in national
      if (num.length !== 10) {
        return {
          type: 'invalid',
          typeLabel: 'Invalid NANP Length',
          regionOrCity: 'North America (NANP)',
          isValid: false,
          issue: `US/Canada 10-digit number required (got ${num.length})`,
        };
      }

      const areaCode = num.substring(0, 3);

      // Toll-free
      if (['800', '888', '877', '866', '855', '844', '833'].includes(areaCode)) {
        return {
          type: 'toll_free',
          typeLabel: 'Toll-Free Hotline',
          regionOrCity: `Toll-Free (${areaCode})`,
          isValid: true,
        };
      }

      // Premium
      if (['900', '976'].includes(areaCode)) {
        return {
          type: 'toll_free',
          typeLabel: 'Premium Rate Line',
          regionOrCity: `Premium (${areaCode})`,
          isValid: true,
        };
      }

      // Prominent corporate landline / metro center area codes
      const knownLandlineAreaCodes: Record<string, string> = {
        '212': 'New York City - Manhattan, NY (Fixed/Wireline)',
        '202': 'Washington, DC (Metropolitan/Government)',
        '312': 'Chicago Downtown, IL (Fixed/Wireline)',
        '415': 'San Francisco Downtown, CA (Fixed/Wireline)',
        '213': 'Los Angeles Downtown, CA (Fixed/Wireline)',
        '617': 'Boston, MA (Fixed/Wireline)',
        '305': 'Miami, FL (Fixed/Wireline)',
        '206': 'Seattle, WA (Fixed/Wireline)',
      };

      if (knownLandlineAreaCodes[areaCode]) {
        return {
          type: 'landline',
          typeLabel: 'Landline (Metro Center Wireline)',
          regionOrCity: knownLandlineAreaCodes[areaCode],
          isValid: true,
        };
      }

      // In North America, mobile and landline are largely integrated into area codes.
      // Default standard NANP valid number
      return {
        type: 'mobile',
        typeLabel: 'Mobile / Wireline Line',
        regionOrCity: `North America (Area ${areaCode})`,
        isValid: true,
      };
    },
  },

  // United Kingdom (+44)
  '44': {
    name: 'United Kingdom',
    code: '44',
    classify: (national) => {
      const num = national.replace(/^0+/, '');

      // Mobile starts with 7 (e.g. 71xx, 77xx, 78xx, 79xx) - total 10 digits
      if (num.startsWith('7')) {
        const validLen = num.length === 10;
        return {
          type: 'mobile',
          typeLabel: 'Mobile Phone',
          regionOrCity: 'UK Mobile (EE / O2 / Vodafone / Three)',
          isValid: validLen,
          issue: validLen ? undefined : `UK mobile numbers require 10 digits after 44 (got ${num.length})`,
        };
      }

      // Landline starts with 1 or 2 (e.g. 20 London, 161 Manchester, 121 Birmingham)
      if (num.startsWith('1') || num.startsWith('2')) {
        const validLen = num.length >= 9 && num.length <= 10;
        let city = 'UK Geographic Landline';
        if (num.startsWith('20')) city = 'London (020)';
        else if (num.startsWith('161')) city = 'Manchester (0161)';
        else if (num.startsWith('121')) city = 'Birmingham (0121)';
        else if (num.startsWith('141')) city = 'Glasgow (0141)';
        else if (num.startsWith('28')) city = 'Northern Ireland (028)';

        return {
          type: 'landline',
          typeLabel: 'Landline (Fixed Office Line)',
          regionOrCity: city,
          isValid: validLen,
          issue: validLen ? undefined : `UK landline numbers require 9-10 digits (got ${num.length})`,
        };
      }

      // Non-geographic / Business starts with 3
      if (num.startsWith('3')) {
        return {
          type: 'landline',
          typeLabel: 'Business Rate Landline',
          regionOrCity: 'UK Non-Geographic (03xx)',
          isValid: num.length === 10,
        };
      }

      // Freephone 800, 808
      if (num.startsWith('800') || num.startsWith('808')) {
        return {
          type: 'toll_free',
          typeLabel: 'Freephone Hotline',
          regionOrCity: 'UK Freephone (0800)',
          isValid: true,
        };
      }

      return {
        type: 'invalid',
        typeLabel: 'Invalid UK Number',
        regionOrCity: 'United Kingdom',
        isValid: false,
        issue: 'UK numbers must start with 07 (Mobile), 01/02 (Landline), or 03/0800',
      };
    },
  },

  // Australia (+61)
  '61': {
    name: 'Australia',
    code: '61',
    classify: (national) => {
      const num = national.replace(/^0+/, '');

      // Mobile starts with 4 (04xx xxx xxx) - total 9 digits
      if (num.startsWith('4')) {
        const validLen = num.length === 9;
        return {
          type: 'mobile',
          typeLabel: 'Mobile Phone',
          regionOrCity: 'Australia Mobile (Telstra / Optus / TPG)',
          isValid: validLen,
          issue: validLen ? undefined : `Australian mobile numbers require 9 digits after 61 (got ${num.length})`,
        };
      }

      // Landline starts with 2 (NSW/ACT), 3 (VIC/TAS), 7 (QLD), 8 (WA/SA/NT)
      const ausRegions: Record<string, string> = {
        '2': 'Sydney / NSW / ACT (02)',
        '3': 'Melbourne / VIC / TAS (03)',
        '7': 'Brisbane / Queensland (07)',
        '8': 'Perth / Adelaide / WA / SA / NT (08)',
      };

      const firstDigit = num.substring(0, 1);
      if (ausRegions[firstDigit]) {
        return {
          type: 'landline',
          typeLabel: 'Landline (Fixed Office Line)',
          regionOrCity: ausRegions[firstDigit],
          isValid: num.length === 9,
        };
      }

      // Toll-free 1800, 1300
      if (num.startsWith('1800') || num.startsWith('1300')) {
        return {
          type: 'toll_free',
          typeLabel: 'Toll-Free Hotline',
          regionOrCity: num.startsWith('1800') ? 'Toll-Free (1800)' : 'Local Rate (1300)',
          isValid: true,
        };
      }

      return {
        type: 'invalid',
        typeLabel: 'Invalid Australian Number',
        regionOrCity: 'Australia',
        isValid: false,
        issue: 'Australian numbers must start with 04 (Mobile) or 02/03/07/08 (Landline)',
      };
    },
  },

  // India (+91)
  '91': {
    name: 'India',
    code: '91',
    classify: (national) => {
      const num = national.replace(/^0+/, '');
      if (num.length !== 10) {
        return {
          type: 'invalid',
          typeLabel: 'Invalid Length',
          regionOrCity: 'India',
          isValid: false,
          issue: `Indian mobile & landline require 10 digits (got ${num.length})`,
        };
      }

      // Mobile starts with 6, 7, 8, 9
      if (['6', '7', '8', '9'].includes(num.substring(0, 1))) {
        return {
          type: 'mobile',
          typeLabel: 'Mobile Phone',
          regionOrCity: 'India Mobile (Jio / Airtel / Vi / BSNL)',
          isValid: true,
        };
      }

      // Fixed Landlines: 11 (Delhi), 22 (Mumbai), 33 (Kolkata), 44 (Chennai), 80 (Bangalore), 40 (Hyderabad)
      const majorLandlines: Record<string, string> = {
        '11': 'Delhi NCR (011)',
        '22': 'Mumbai (022)',
        '33': 'Kolkata (033)',
        '44': 'Chennai (044)',
        '80': 'Bengaluru / Bangalore (080)',
        '40': 'Hyderabad (040)',
        '20': 'Pune (020)',
        '79': 'Ahmedabad (079)',
      };

      const p2 = num.substring(0, 2);
      if (majorLandlines[p2]) {
        return {
          type: 'landline',
          typeLabel: 'Landline (Fixed Office Line)',
          regionOrCity: majorLandlines[p2],
          isValid: true,
        };
      }

      return {
        type: 'landline',
        typeLabel: 'Landline / Regional',
        regionOrCity: `India Regional Wireline (${p2})`,
        isValid: true,
      };
    },
  },

  // Indonesia (+62)
  '62': {
    name: 'Indonesia',
    code: '62',
    classify: (national) => {
      const num = national.replace(/^0+/, '');
      if (num.startsWith('8')) {
        return {
          type: 'mobile',
          typeLabel: 'Mobile Phone',
          regionOrCity: 'Indonesia Mobile (Telkomsel / Indosat / XL)',
          isValid: num.length >= 9 && num.length <= 12,
        };
      }
      if (num.startsWith('21')) {
        return {
          type: 'landline',
          typeLabel: 'Landline (Fixed Office Line)',
          regionOrCity: 'Jakarta / Bodetabek (021)',
          isValid: num.length >= 8 && num.length <= 10,
        };
      }
      return {
        type: 'landline',
        typeLabel: 'Landline (Regional)',
        regionOrCity: 'Indonesia Regional Fixed Line',
        isValid: num.length >= 8 && num.length <= 10,
      };
    },
  },

  // United Arab Emirates (+971)
  '971': {
    name: 'United Arab Emirates',
    code: '971',
    classify: (national) => {
      const num = national.replace(/^0+/, '');
      if (['50', '52', '54', '55', '56', '58'].some((p) => num.startsWith(p))) {
        return {
          type: 'mobile',
          typeLabel: 'Mobile Phone',
          regionOrCity: 'UAE Mobile (e& / du)',
          isValid: num.length === 9,
        };
      }
      const uaeLandlines: Record<string, string> = {
        '2': 'Abu Dhabi (02)',
        '4': 'Dubai (04)',
        '6': 'Sharjah / Ajman / UAQ (06)',
        '7': 'Ras Al Khaimah (07)',
        '9': 'Fujairah (09)',
      };
      const p1 = num.substring(0, 1);
      if (uaeLandlines[p1]) {
        return {
          type: 'landline',
          typeLabel: 'Landline (Fixed Office Line)',
          regionOrCity: uaeLandlines[p1],
          isValid: num.length === 8 || num.length === 9,
        };
      }
      return {
        type: 'unknown',
        typeLabel: 'UAE Number',
        regionOrCity: 'United Arab Emirates',
        isValid: num.length >= 8 && num.length <= 10,
      };
    },
  },
};

/**
 * Validates and classifies any phone number into Mobile, Landline, Toll-Free, or Invalid
 */
export function validateAndClassifyPhone(
  rawPhone: string | number | undefined,
  defaultCountryCode = '60'
): PhoneValidationResult {
  if (rawPhone === undefined || rawPhone === null) {
    return {
      raw: '',
      digits: '',
      formatted: '',
      isValid: false,
      type: 'invalid',
      typeLabel: 'Missing Phone Number',
      countryCode: '',
      countryName: 'Unknown',
      nationalNumber: '',
      regionOrCity: 'No number provided',
      isWhatsAppEligible: false,
      issue: 'Phone number field is empty',
      confidence: 'high',
    };
  }

  const raw = String(rawPhone).trim();
  if (!raw) {
    return {
      raw: '',
      digits: '',
      formatted: '',
      isValid: false,
      type: 'invalid',
      typeLabel: 'Missing Phone Number',
      countryCode: '',
      countryName: 'Unknown',
      nationalNumber: '',
      regionOrCity: 'No number provided',
      isWhatsAppEligible: false,
      issue: 'Phone number field is empty',
      confidence: 'high',
    };
  }

  // Normalize default country code to pure digits
  const normDefaultCode = defaultCountryCode.replace(/\D/g, '') || '60';

  // Extract all digits
  let allDigits = raw.replace(/\D/g, '');

  if (allDigits.length < 5) {
    return {
      raw,
      digits: allDigits,
      formatted: raw,
      isValid: false,
      type: 'invalid',
      typeLabel: 'Invalid (Too Short)',
      countryCode: normDefaultCode,
      countryName: 'Unknown',
      nationalNumber: allDigits,
      regionOrCity: 'Insufficient digits',
      isWhatsAppEligible: false,
      issue: `Number has only ${allDigits.length} digits (minimum 7 required)`,
      confidence: 'high',
    };
  }

  // Check if raw explicitly started with '+' or '00'
  let countryCode = '';
  let nationalNumber = '';

  if (raw.startsWith('+')) {
    // Determine country code by matching known country codes (up to 3 digits)
    const possibleCodes = ['971', '852', '60', '65', '44', '61', '91', '62', '49', '33', '81', '63', '1'];
    for (const code of possibleCodes) {
      if (allDigits.startsWith(code)) {
        countryCode = code;
        nationalNumber = allDigits.substring(code.length);
        break;
      }
    }
    if (!countryCode) {
      // Fallback: 2 digits for country code
      countryCode = allDigits.substring(0, 2);
      nationalNumber = allDigits.substring(2);
    }
  } else if (raw.startsWith('00')) {
    const after00 = allDigits.substring(2);
    const possibleCodes = ['971', '852', '60', '65', '44', '61', '91', '62', '49', '33', '81', '63', '1'];
    for (const code of possibleCodes) {
      if (after00.startsWith(code)) {
        countryCode = code;
        nationalNumber = after00.substring(code.length);
        break;
      }
    }
    if (!countryCode) {
      countryCode = after00.substring(0, 2);
      nationalNumber = after00.substring(2);
    }
  } else if (allDigits.startsWith('0')) {
    // Local number starting with 0 -> Prepend default country code
    countryCode = normDefaultCode;
    nationalNumber = allDigits.substring(1);
    allDigits = `${countryCode}${nationalNumber}`;
  } else if (allDigits.startsWith(normDefaultCode) && allDigits.length > 8) {
    countryCode = normDefaultCode;
    nationalNumber = allDigits.substring(normDefaultCode.length);
  } else {
    // No leading 0, no +, but might be local number without leading 0 (e.g. 123456789)
    // Or might be full international number
    const possibleCodes = ['971', '852', '60', '65', '44', '61', '91', '62', '49', '33', '81', '63'];
    let matched = false;
    for (const code of possibleCodes) {
      if (allDigits.startsWith(code) && allDigits.length >= 9) {
        countryCode = code;
        nationalNumber = allDigits.substring(code.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Default to prepending defaultCountryCode
      countryCode = normDefaultCode;
      nationalNumber = allDigits;
      allDigits = `${countryCode}${nationalNumber}`;
    }
  }

  // Format full digits E.164
  const fullDigits = `${countryCode}${nationalNumber}`;

  // Evaluate against rule set if available
  const rule = COUNTRY_RULES[countryCode];
  let type: PhoneType = 'unknown';
  let typeLabel = 'Standard Phone';
  let regionOrCity = rule ? rule.name : `Country +${countryCode}`;
  let isValid = fullDigits.length >= 8 && fullDigits.length <= 16;
  let issue: string | undefined = undefined;

  if (rule) {
    const classification = rule.classify(nationalNumber);
    type = classification.type;
    typeLabel = classification.typeLabel;
    regionOrCity = classification.regionOrCity;
    isValid = classification.isValid;
    issue = classification.issue;
  } else {
    // General fallback
    if (fullDigits.length < 8 || fullDigits.length > 16) {
      isValid = false;
      type = 'invalid';
      typeLabel = 'Invalid Length';
      issue = `International length out of bounds: ${fullDigits.length} digits`;
    } else {
      type = 'unknown';
      typeLabel = 'International Number';
    }
  }

  // WhatsApp eligibility: strictly valid mobile numbers
  // Note: Landlines typically cannot receive direct WhatsApp messages
  const isWhatsAppEligible = isValid && type === 'mobile';

  if (!isWhatsAppEligible && isValid && type === 'landline') {
    issue = 'Landline / Fixed Office Line: Cannot receive direct WhatsApp messages';
  }

  // Pretty display format
  let formatted = `+${fullDigits}`;
  if (countryCode === '60') {
    if (nationalNumber.startsWith('11') && nationalNumber.length === 10) {
      formatted = `+60 11-${nationalNumber.slice(2, 6)} ${nationalNumber.slice(6)}`;
    } else if (nationalNumber.startsWith('1') && nationalNumber.length === 9) {
      formatted = `+60 ${nationalNumber.slice(0, 2)}-${nationalNumber.slice(2, 5)} ${nationalNumber.slice(5)}`;
    } else if (nationalNumber.startsWith('3') && nationalNumber.length === 9) {
      formatted = `+60 3-${nationalNumber.slice(1, 5)} ${nationalNumber.slice(5)}`;
    } else if (nationalNumber.length >= 8) {
      formatted = `+60 ${nationalNumber.slice(0, 1)}-${nationalNumber.slice(1, 4)} ${nationalNumber.slice(4)}`;
    }
  } else if (countryCode === '65' && nationalNumber.length === 8) {
    formatted = `+65 ${nationalNumber.slice(0, 4)} ${nationalNumber.slice(4)}`;
  } else if (countryCode === '1' && nationalNumber.length === 10) {
    formatted = `+1 (${nationalNumber.slice(0, 3)}) ${nationalNumber.slice(3, 6)}-${nationalNumber.slice(6)}`;
  } else if (countryCode === '44') {
    formatted = `+44 ${nationalNumber.slice(0, 4)} ${nationalNumber.slice(4)}`;
  }

  return {
    raw,
    digits: fullDigits,
    formatted,
    isValid,
    type,
    typeLabel,
    countryCode,
    countryName: rule ? rule.name : `Country +${countryCode}`,
    nationalNumber,
    regionOrCity,
    isWhatsAppEligible,
    issue,
    confidence: rule ? 'high' : 'medium',
  };
}
