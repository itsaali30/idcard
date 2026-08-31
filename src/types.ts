export interface IDCardRecord {
  id: string; // Unique record ID or row index
  aadhaarNumber: string; // 12-digit number e.g. "4582 9104 3821"
  nameTelugu: string; // e.g. "రమేష్ కుమార్"
  nameEnglish: string; // e.g. "Ramesh Kumar"
  dob: string; // e.g. "15/08/1990"
  genderTelugu: string; // e.g. "పురుషుడు" / "స్త్రీ"
  genderEnglish: string; // e.g. "MALE" / "FEMALE"
  fatherOrHusbandName?: string; // e.g. "S/O: Venkateshwarlu"
  phone?: string;
  photoUrl?: string;
  issueDate?: string; // e.g. "22/07/2011"
  detailsAsOn?: string; // e.g. "26/02/2026"
  addressTelugu: string; // Telugu address
  addressEnglish: string; // English address
  pinCode?: string;
  vid?: string; // Virtual ID 16 digits
  customQrData?: string; // Optional raw QR data
}

export interface CardCustomizationConfig {
  scale: number;
  showCutLines: boolean;
  maskAadhaar: boolean;
  highDpi: boolean;
  cardLayout: 'both' | 'front' | 'back' | 'flip';
  customBgUrl?: string;
  fontScale: number;
  photoBorder: boolean;
  contrastMode: boolean;
  qrCoverBg?: boolean;
  hideDynamicQr?: boolean;
  qrSize?: number;
  qrOffsetX?: number;
  qrOffsetY?: number;
  photoOffsetX?: number;
  photoOffsetY?: number;
}

export interface GoogleSheetConfig {
  sheetUrl: string;
  sheetId: string;
  sheetName: string;
  lastSyncedAt?: string;
  autoSync: boolean;
  columnMapping?: Record<string, string>;
}
