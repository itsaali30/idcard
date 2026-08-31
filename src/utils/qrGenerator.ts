import QRCode from 'qrcode';
import { IDCardRecord } from '../types';

export async function generateAadhaarQrDataUrl(record: IDCardRecord): Promise<string> {
  const cleanAadhaar = record.aadhaarNumber.replace(/\s+/g, '');
  
  // Standard Aadhaar XML-like QR structure or JSON structure
  const qrPayload = record.customQrData || 
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<PrintLetterBarcodeData ` +
    `uid="${cleanAadhaar}" ` +
    `name="${record.nameEnglish}" ` +
    `name_te="${record.nameTelugu}" ` +
    `gender="${record.genderEnglish.startsWith('F') ? 'F' : 'M'}" ` +
    `dob="${record.dob}" ` +
    `co="${record.fatherOrHusbandName || ''}" ` +
    `dist="Andhra Pradesh" ` +
    `pc="${record.pinCode || '522002'}" ` +
    `issued="${record.issueDate || '22/07/2011'}"/>`;

  try {
    const dataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    // Fallback simple QR
    return QRCode.toDataURL(cleanAadhaar || 'AADHAAR-VERIFIED', {
      margin: 1,
      width: 400,
    });
  }
}
