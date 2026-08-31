import Papa from 'papaparse';
import { IDCardRecord } from '../types';

export function extractGoogleSheetId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  
  // If it's already just the ID (alphanumeric, dashes, underscores, length ~30-50)
  if (/^[a-zA-Z0-9-_]{25,}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Match standard google spreadsheet URL patterns
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

export function buildGoogleSheetCsvUrl(urlOrId: string, sheetName?: string): string {
  const sheetId = extractGoogleSheetId(urlOrId);
  if (!sheetId) {
    // If it's already a direct CSV URL (e.g. published web link)
    if (urlOrId.includes('output=csv') || urlOrId.endsWith('.csv')) {
      return urlOrId;
    }
    return urlOrId;
  }
  
  // GViz endpoint works for any public or shared "Anyone with link can view" Google Sheet!
  let csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  if (sheetName) {
    csvUrl += `&sheet=${encodeURIComponent(sheetName)}`;
  }
  return csvUrl;
}

export async function fetchGoogleSheetData(sheetUrlOrId: string, sheetName?: string): Promise<{
  records: IDCardRecord[];
  rawColumns: string[];
  totalRows: number;
}> {
  const csvUrl = buildGoogleSheetCsvUrl(sheetUrlOrId, sheetName);
  
  const response = await fetch(csvUrl, {
    method: 'GET',
    headers: {
      'Accept': 'text/csv, text/plain, */*',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Google Sheet (${response.status} ${response.statusText}). Please make sure your sheet is shared as "Anyone with the link can view".`
    );
  }

  const csvText = await response.text();
  return parseCsvToRecords(csvText);
}

export function parseCsvToRecords(csvContent: string): {
  records: IDCardRecord[];
  rawColumns: string[];
  totalRows: number;
} {
  const parsed = Papa.parse<Record<string, string>>(csvContent.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new Error(parsed.errors[0]?.message || 'Failed to parse CSV file');
  }

  const rawColumns = parsed.meta.fields || [];
  
  const records: IDCardRecord[] = parsed.data.map((row, index) => {
    // Helper to find value by various column aliases
    const findVal = (...keys: string[]): string => {
      for (const key of keys) {
        const lowerKey = key.toLowerCase();
        for (const [col, val] of Object.entries(row)) {
          if (col.toLowerCase() === lowerKey || col.toLowerCase().includes(lowerKey)) {
            if (val && typeof val === 'string' && val.trim() !== '') {
              return val.trim();
            }
          }
        }
      }
      return '';
    };

    // Format Aadhaar Number nicely into 4-digit groups
    let rawAadhaar = findVal('aadhaar', 'uid', 'id_number', 'aadhaar_number', 'aadhaar_no', 'id', 'card_number');
    let formattedAadhaar = rawAadhaar.replace(/\D/g, '');
    if (formattedAadhaar.length >= 12) {
      formattedAadhaar = `${formattedAadhaar.slice(0, 4)} ${formattedAadhaar.slice(4, 8)} ${formattedAadhaar.slice(8, 12)}`;
    } else if (!rawAadhaar) {
      // Fallback ID if empty
      formattedAadhaar = `5830 1920 ${String(1000 + index).slice(1)}`;
    } else {
      formattedAadhaar = rawAadhaar;
    }

    const nameTelugu = findVal('name_telugu', 'name_te', 'telugu_name', 'nametelugu', 'name (telugu)', 'telugu') ||
      findVal('name', 'full_name', 'student_name', 'person_name') || `కార్డుదారు ${index + 1}`;

    const nameEnglish = findVal('name_english', 'name_en', 'english_name', 'nameenglish', 'name (english)', 'name', 'full_name') ||
      `Cardholder ${index + 1}`;

    const dob = findVal('dob', 'date_of_birth', 'birth_date', 'birthdate', 'd.o.b') || '15/08/1995';
    
    const rawGender = findVal('gender', 'sex', 'gender_en', 'gender_te');
    let genderTelugu = 'పురుషుడు';
    let genderEnglish = 'MALE';
    if (/female|woman|స్త్రీ|f/i.test(rawGender)) {
      genderTelugu = 'స్త్రీ';
      genderEnglish = 'FEMALE';
    } else if (/trans|ఇతర/i.test(rawGender)) {
      genderTelugu = 'ఇతర';
      genderEnglish = 'TRANSGENDER';
    }

    const fatherOrHusbandName = findVal('father_name', 'husband_name', 'guardian', 'father', 'husband', 'c_o', 'care_of');
    const phone = findVal('phone', 'mobile', 'cell', 'contact');
    const photoUrl = findVal('photo', 'photo_url', 'image', 'picture', 'avatar', 'img_url');
    const issueDate = findVal('issue_date', 'issued', 'issued_date', 'created_at') || '22/07/2011';
    const detailsAsOn = findVal('details_as_on', 'as_on', 'valid_date', 'updated_at') || '26/02/2026';
    
    const addressTelugu = findVal('address_telugu', 'address_te', 'telugu_address', 'addresstelugu') ||
      findVal('address', 'full_address') ||
      'చిరునామా: ఇంటి నెం: 1-23, మెయిన్ రోడ్, విజయవాడ, ఆంధ్రప్రదేశ్ - 520001';

    const addressEnglish = findVal('address_english', 'address_en', 'english_address', 'addressenglish') ||
      findVal('address', 'full_address') ||
      'Address: H.No: 1-23, Main Road, Vijayawada, Krishna Dist, Andhra Pradesh - 520001';

    const pinCode = findVal('pincode', 'pin_code', 'pin', 'zip') || '520001';
    const vid = findVal('vid', 'virtual_id') || `9182 3749 1029 ${String(4000 + index).slice(1)}`;

    return {
      id: String(index + 1),
      aadhaarNumber: formattedAadhaar,
      nameTelugu,
      nameEnglish,
      dob,
      genderTelugu,
      genderEnglish,
      fatherOrHusbandName,
      phone,
      photoUrl,
      issueDate,
      detailsAsOn,
      addressTelugu,
      addressEnglish,
      pinCode,
      vid,
    };
  });

  return {
    records,
    rawColumns,
    totalRows: records.length,
  };
}

export function generateSampleCsvString(): string {
  const headers = [
    'Aadhaar_Number',
    'Name_Telugu',
    'Name_English',
    'DOB',
    'Gender',
    'Father_Or_Husband_Name',
    'Phone',
    'Photo_URL',
    'Issue_Date',
    'Address_Telugu',
    'Address_English',
    'Pin_Code',
  ];

  const sampleRows = [
    [
      '458291043821',
      'కె. రమేష్ కుమార్',
      'K. Ramesh Kumar',
      '15/08/1990',
      'MALE',
      'S/O: కె. వెంకటేశ్వర్లు',
      '9876543210',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      '22/07/2011',
      'చిరునామా: S/O కె. వెంకటేశ్వర్లు, డోర్ నెం: 4-52/1, గాంధీ నగర్, గుంటూరు - 522002',
      'Address: S/O K. Venkateshwarlu, D.No: 4-52/1, Gandhi Nagar, Guntur - 522002',
      '522002',
    ],
    [
      '839210475629',
      'పి. లక్ష్మి ప్రసన్న',
      'P. Lakshmi Prasanna',
      '24/11/1994',
      'FEMALE',
      'W/O: పి. సత్యనారాయణ',
      '9123456780',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
      '14/03/2013',
      'చిరునామా: W/O పి. సత్యనారాయణ, ప్లాట్ నెం: 12, బాలాజీ కాలనీ, తిరుపతి - 517501',
      'Address: W/O P. Satyanarayana, Plot No: 12, Balaji Colony, Tirupati - 517501',
      '517501',
    ],
  ];

  return [
    headers.join(','),
    ...sampleRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
}
