import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { IDCardRecord } from '../types';

export async function downloadCardAsImage(
  elementId: string,
  record: IDCardRecord,
  format: 'png' | 'jpeg' = 'png',
  suffix: string = 'Full'
): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) {
    throw new Error('Card element not found for export');
  }

  // Ensure all Google Web Fonts and Telugu fonts are fully loaded before rendering
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }

  const cleanName = (record.nameEnglish || 'Cardholder').replace(/[^a-zA-Z0-9]/g, '_');
  const cleanId = record.aadhaarNumber.replace(/\s+/g, '');
  const fileName = `Aadhaar_${cleanName}_${cleanId}_${suffix}.${format}`;

  // Use higher pixel ratio for crisp 300 DPI print quality
  const options = {
    quality: 0.98,
    pixelRatio: 3,
    backgroundColor: '#ffffff',
    cacheBust: true,
  };

  const dataUrl = format === 'png' ? await toPng(node, options) : await toJpeg(node, options);

  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadCardAsPdf(
  elementId: string,
  record: IDCardRecord,
  isDualSide: boolean = true
): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) {
    throw new Error('Card element not found for export');
  }

  // Ensure all Google Web Fonts and Telugu fonts are fully loaded before capturing
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }

  const cleanName = (record.nameEnglish || 'Cardholder').replace(/[^a-zA-Z0-9]/g, '_');
  const cleanId = record.aadhaarNumber.replace(/\s+/g, '');
  const fileName = `Aadhaar_${cleanName}_${cleanId}.pdf`;

  const dataUrl = await toPng(node, {
    quality: 1,
    pixelRatio: 3.5,
    backgroundColor: '#ffffff',
    cacheBust: true,
  });

  // Standard CR80 Card Dimensions: 85.6mm x 53.98mm
  // Dual side unfolded / foldable: 171.2mm x 53.98mm or on standard A4 page with cut guides
  // Let's create an A4 PDF document with the card positioned at the center top with millimeter precision
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: isDualSide ? [175, 60] : [90, 60],
  });

  if (isDualSide) {
    // 171.2mm width x 53.98mm height with 2mm safety margin
    pdf.addImage(dataUrl, 'PNG', 2, 3, 171, 54);
  } else {
    // Single card 85.6mm x 53.98mm
    pdf.addImage(dataUrl, 'PNG', 2, 3, 86, 54);
  }

  pdf.save(fileName);
}

export function triggerPrintCard(): void {
  window.print();
}
