import React, { useEffect, useState } from 'react';
import { IDCardRecord, CardCustomizationConfig } from '../types';
import { generateAadhaarQrDataUrl } from '../utils/qrGenerator';
import { Scissors, Phone, Mail, Globe } from 'lucide-react';

interface AadhaarCardTemplateProps {
  record: IDCardRecord;
  config: CardCustomizationConfig;
  className?: string;
  id?: string;
}

export const AadhaarCardTemplate: React.FC<AadhaarCardTemplateProps> = ({
  record,
  config,
  className = '',
  id = 'aadhaar-card-print-area',
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    generateAadhaarQrDataUrl(record).then((url) => {
      if (isMounted) setQrCodeUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [record]);

  // Mask Aadhaar if config enabled: e.g. "XXXX XXXX 1201"
  const getDisplayAadhaar = () => {
    if (!config.maskAadhaar) return record.aadhaarNumber;
    const parts = record.aadhaarNumber.split(' ');
    if (parts.length === 3) {
      return `XXXX XXXX ${parts[2]}`;
    }
    return `XXXX XXXX ${record.aadhaarNumber.slice(-4)}`;
  };

  const showFront = config.cardLayout === 'both' || config.cardLayout === 'front';
  const showBack = config.cardLayout === 'both' || config.cardLayout === 'back';

  // If customBgUrl is provided and cardLayout is 'both', use custom background overlay mode
  if (config.customBgUrl && config.cardLayout === 'both') {
    const qrSize = config.qrSize ?? 156;
    const qrRight = 18 - (config.qrOffsetX ?? 0);
    const qrTop = 54 + (config.qrOffsetY ?? 0);
    const photoLeft = 46 + (config.photoOffsetX ?? 0);
    const photoTop = 62 + (config.photoOffsetY ?? 0);

    return (
      <div
        id={id}
        className={`relative inline-block select-none bg-white text-slate-900 shadow-2xl transition-all border border-slate-900 overflow-hidden ${className}`}
        style={{
          width: '880px',
          height: '280px',
          fontFamily: "'Plus Jakarta Sans', 'Noto Sans Telugu', sans-serif",
        }}
      >
        {/* Background Image (blank.jpg) */}
        <img
          src={config.customBgUrl}
          alt="Card Background Template"
          className="absolute inset-0 h-full w-full object-fill pointer-events-none z-0"
        />

        {/* ================= FRONT SIDE OVERLAY (LEFT 440px) ================= */}
        <div className="absolute left-0 top-0 w-[440px] h-[280px] z-10 pointer-events-none">
          {/* Photo */}
          <div
            className="absolute overflow-hidden rounded-[1px] border border-slate-400/80 bg-slate-100 shadow-xs z-20 pointer-events-auto"
            style={{
              left: `${photoLeft}px`,
              top: `${photoTop}px`,
              width: '92px',
              height: '110px',
            }}
          >
            {record.photoUrl ? (
              <img
                src={record.photoUrl}
                alt={record.nameEnglish}
                className="h-full w-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-slate-200 text-slate-400">
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="text-[7px] text-slate-500 font-medium">ఫోటో / Photo</span>
              </div>
            )}
          </div>

          {/* Cardholder Details Block */}
          <div className="absolute left-[150px] top-[58px] w-[275px] flex flex-col pointer-events-auto">
            {/* Telugu Name */}
            <div className="text-[13px] font-bold text-slate-950 font-['Noto_Sans_Telugu'] tracking-tight leading-[1.25] pb-0.5">
              {record.nameTelugu}
            </div>

            {/* English Name */}
            <div className="text-[12px] font-bold text-slate-950 tracking-tight leading-[1.25] pb-1">
              {record.nameEnglish}
            </div>

            {/* DOB */}
            <div className="text-[9.5px] font-medium text-slate-900 flex items-center gap-1.5 whitespace-nowrap leading-[1.2] pb-0.5">
              <span className="font-['Noto_Sans_Telugu'] font-semibold">పుట్టిన తేదీ/DOB:</span>
              <span className="font-bold text-slate-950 font-mono tracking-tight">
                {record.dob.replace(/^(పుట్టిన తేదీ\/DOB:|DOB:?)\s*/i, '')}
              </span>
            </div>

            {/* Gender */}
            <div className="text-[9.5px] font-medium text-slate-900 flex items-center gap-1 whitespace-nowrap leading-[1.2]">
              <span className="font-bold text-slate-950 font-['Noto_Sans_Telugu']">
                {record.genderTelugu.replace(/\/.*$/, '').trim()}
              </span>
              <span className="font-bold text-slate-950">
                / {record.genderEnglish.replace(/^.*\/\s*/, '').trim().toUpperCase()}
              </span>
            </div>
          </div>

          {/* Front Aadhaar Number */}
          <div className="absolute left-0 bottom-[23px] w-[440px] text-center text-[19.5px] font-black tracking-[0.16em] text-slate-950 font-mono">
            {getDisplayAadhaar()}
          </div>
        </div>

        {/* ================= BACK SIDE OVERLAY (RIGHT 440px) ================= */}
        <div className="absolute left-[440px] top-0 w-[440px] h-[280px] z-10 pointer-events-none">
          {/* Telugu Address */}
          <div className="absolute left-[44px] top-[62px] w-[215px] text-[8.5px] leading-[1.32] text-slate-950 font-['Noto_Sans_Telugu']">
            <span className="font-bold text-slate-950 block">చిరునామా:</span>
            <span className="font-normal text-slate-900">
              {record.addressTelugu.replace(/^చిరునామా:\s*/i, '')}
            </span>
          </div>

          {/* English Address */}
          <div className="absolute left-[44px] top-[122px] w-[215px] text-[8px] leading-[1.28] text-slate-900">
            <span className="font-bold text-slate-950 block">Address:</span>
            <span className="font-medium text-slate-900">
              {record.addressEnglish.replace(/^Address:\s*/i, '')}
            </span>
          </div>

          {/* Dynamic 2D QR Code - Exact Cover Sizing for Background QR */}
          {!config.hideDynamicQr && (
            <div
              className="absolute z-20 bg-white p-0.5 border border-slate-900 shadow-xs pointer-events-auto"
              style={{
                right: `${qrRight}px`,
                top: `${qrTop}px`,
                width: `${qrSize}px`,
                height: `${qrSize}px`,
              }}
            >
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Aadhaar Secure QR"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                  <span className="text-[8px] text-slate-400">Generating QR...</span>
                </div>
              )}
            </div>
          )}

          {/* Back Aadhaar Number */}
          <div className="absolute left-0 bottom-[31px] w-[440px] text-center text-[18.5px] font-black tracking-[0.16em] text-slate-950 font-mono">
            {getDisplayAadhaar()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={`relative inline-flex select-none bg-white text-slate-900 shadow-2xl transition-all border border-slate-900 ${className}`}
      style={{
        width: config.cardLayout === 'both' ? '880px' : '440px',
        height: '280px',
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans Telugu', sans-serif",
      }}
    >
      {/* ======================= FRONT CARD ======================= */}
      {showFront && (
        <div
          id="aadhaar-front-card"
          className="relative flex flex-col justify-between overflow-hidden bg-white px-2.5 pt-1 pb-1"
          style={{
            width: config.cardLayout === 'both' ? '440px' : '100%',
            height: '280px',
            boxSizing: 'border-box',
          }}
        >
          {/* Custom user background if uploaded */}
          {config.customBgUrl && (
            <img
              src={config.customBgUrl}
              alt="Custom Card Background"
              className="absolute inset-0 h-full w-full object-cover opacity-90 pointer-events-none"
            />
          )}

          {/* Top Scissor Cut Guide Line */}
          <div className="relative flex items-center justify-center w-full my-0.5 z-20">
            <div className="flex-1 border-t border-dashed border-slate-400/90" />
            <div className="px-2 flex items-center gap-1 bg-white text-slate-700">
              <Scissors className="h-3 w-3 -rotate-90 text-slate-600" />
            </div>
            <div className="flex-1 border-t border-dashed border-slate-400/90" />
          </div>

          {/* Vertical Spine Issue Date on Left Margin */}
          <div
            className="absolute left-[-15px] top-[140px] -translate-y-1/2 origin-center -rotate-90 text-[7px] font-bold text-slate-800 tracking-tight whitespace-nowrap z-20"
            style={{ width: '190px', textAlign: 'center' }}
          >
            Aadhaar no. issued: {record.issueDate || '22/07/2011'}
          </div>

          {/* Front Header */}
          <div className="relative flex items-center justify-between pb-0.5 pl-4 pr-1">
            {/* National Emblem */}
            <div className="flex flex-col items-center justify-center -mt-0.5">
              <svg viewBox="0 0 100 130" className="h-8.5 w-auto text-slate-900" fill="currentColor">
                <path d="M50 5 C40 5 35 15 35 25 C35 32 38 38 43 42 C30 45 22 55 22 68 C22 75 25 82 30 87 L28 100 L72 100 L70 87 C75 82 78 75 78 68 C78 55 70 45 57 42 C62 38 65 32 65 25 C65 15 60 5 50 5 Z M50 12 C55 12 58 18 58 25 C58 32 55 38 50 38 C45 38 42 32 42 25 C42 18 45 12 50 12 Z M35 65 C35 55 42 48 50 48 C58 48 65 55 65 65 C65 75 58 82 50 82 C42 82 35 75 35 65 Z" />
                <rect x="25" y="103" width="50" height="6" rx="2" fill="#0f172a" />
                <circle cx="50" cy="116" r="6" fill="none" stroke="#0f172a" strokeWidth="2" />
                <rect x="15" y="124" width="70" height="4" fill="#0f172a" />
              </svg>
              <span className="text-[5.5px] font-bold text-slate-800 uppercase tracking-tighter">
                सत्यमेव जयते
              </span>
            </div>

            {/* Central Government Header with Saffron & Green Stripes */}
            <div className="flex flex-col items-center text-center px-1">
              {/* Saffron Ribbon */}
              <div className="w-52 h-4 bg-gradient-to-r from-[#ea580c]/80 via-[#f97316] to-[#ea580c]/80 rounded-full flex items-center justify-center shadow-xs">
                <span className="text-[9.5px] font-extrabold text-slate-950 font-['Noto_Sans_Telugu']">
                  భారత ప్రభుత్వం
                </span>
              </div>
              {/* Green Ribbon */}
              <div className="w-56 h-3.5 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 rounded-full flex items-center justify-center -mt-0.5 shadow-xs">
                <span className="text-[9px] font-bold text-white tracking-wide">
                  Government of India
                </span>
              </div>
            </div>

            {/* Aadhaar Logo */}
            <div className="flex flex-col items-center -mt-0.5">
              <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 120 100" className="h-8 w-auto">
                  <path d="M60,10 A40,40 0 0,1 95,30 L85,38 A28,28 0 0,0 60,22 Z" fill="#ea580c" />
                  <path d="M60,10 A40,40 0 0,0 25,30 L35,38 A28,28 0 0,1 60,22 Z" fill="#ea580c" />
                  <circle cx="60" cy="40" r="18" fill="#f97316" />
                  <path d="M48,60 Q60,42 72,60" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M44,68 Q60,46 76,68" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M40,76 Q60,50 80,76" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M36,84 Q60,54 84,84" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[7.5px] font-extrabold text-red-700 -mt-1 font-['Noto_Sans_Telugu']">
                ఆధార్
              </span>
            </div>
          </div>

          {/* Front Middle Body (Photo + Person Details) */}
          <div className="relative z-10 flex flex-1 items-center gap-3 pl-4 pr-1 py-0.5">
            {/* Passport Photo */}
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="h-[92px] w-[76px] overflow-hidden rounded-[2px] border border-slate-400 bg-slate-100 shadow-xs">
                {record.photoUrl ? (
                  <img
                    src={record.photoUrl}
                    alt={record.nameEnglish}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-slate-200 text-slate-400">
                    <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span className="text-[7px] text-slate-500 font-medium">ఫోటో / Photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Identity Details */}
            <div className="flex flex-1 flex-col justify-center space-y-0.5 text-left leading-tight">
              {/* Telugu Name */}
              <div className="text-[12.5px] font-bold text-slate-950 font-['Noto_Sans_Telugu'] tracking-tight">
                {record.nameTelugu}
              </div>

              {/* English Name */}
              <div className="text-[11.5px] font-bold text-slate-900 tracking-tight">
                {record.nameEnglish}
              </div>

              {/* Father / Husband Name if present */}
              {record.fatherOrHusbandName && (
                <div className="text-[8px] font-semibold text-slate-700">
                  {record.fatherOrHusbandName}
                </div>
              )}

              {/* DOB */}
              <div className="pt-0.5 text-[9.5px] font-medium text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-['Noto_Sans_Telugu'] font-semibold">పుట్టిన తేదీ/DOB:</span>
                <span className="font-bold text-slate-950 font-mono tracking-tight">
                  {record.dob.replace(/^(పుట్టిన తేదీ\/DOB:|DOB:?)\s*/i, '')}
                </span>
              </div>

              {/* Gender */}
              <div className="text-[9.5px] font-medium text-slate-800 flex items-center gap-1 whitespace-nowrap">
                <span className="font-bold text-slate-950 font-['Noto_Sans_Telugu']">
                  {record.genderTelugu.replace(/\/.*$/, '').trim()}
                </span>
                <span className="font-bold text-slate-950">
                  / {record.genderEnglish.replace(/^.*\/\s*/, '').trim().toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Front Warning / Disclaimer Red Border Box */}
          <div className="relative z-10 mx-2.5 mb-1 rounded-[2px] border border-red-600 bg-white px-2 py-0.5 text-[5.8px] leading-[1.22] text-slate-800">
            <p className="font-['Noto_Sans_Telugu'] text-slate-900 font-medium">
              ఆధార్ అనేది గుర్తింపు రుజువు మాత్రమే, పౌరసత్వం లేదా పుట్టిన తేదీ కి కాదు. ఇది ధృవీకరణతో మాత్రమే ఉపయోగించాలి (ఆన్‌లైన్ ప్రమాణీకరణ లేదా QR కోడ్ / ఆఫ్‌లైన్ XML యొక్క స్కానింగ్).
            </p>
            <p className="text-slate-800 font-medium mt-0.5">
              <strong className="text-slate-950">Aadhaar is proof of identity, not of citizenship or date of birth.</strong> It should be used with verification (online authentication, or scanning of QR code / offline XML).
            </p>
          </div>

          {/* Front Aadhaar Number Segmented Display */}
          <div className="relative z-10 flex flex-col items-center justify-center pb-0.5">
            <div className="text-[17px] font-black tracking-[0.16em] text-slate-950 font-mono">
              {getDisplayAadhaar()}
            </div>
          </div>

          {/* Solid Red Line across Bottom */}
          <div className="w-full border-t-2 border-red-600" />

          {/* Front Bottom Slogan */}
          <div className="relative flex items-center justify-center pt-0.5 pb-0.5">
            <span className="text-[11px] font-black text-slate-950 font-['Noto_Sans_Telugu'] tracking-wide">
              నా ఆధార్, నా గుర్తింపు
            </span>
          </div>
        </div>
      )}

      {/* ======================= SCISSOR CUT LINE ======================= */}
      {config.cardLayout === 'both' && config.showCutLines && (
        <div className="relative flex w-[0px] flex-col items-center justify-between border-l border-dashed border-slate-500 z-30">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-0.5 text-slate-700">
            <Scissors className="h-3.5 w-3.5 text-slate-700" />
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white px-0.5 text-slate-700">
            <Scissors className="h-3.5 w-3.5 text-slate-700" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-0.5 text-slate-700">
            <Scissors className="h-3.5 w-3.5 text-slate-700" />
          </div>
        </div>
      )}

      {/* ======================= BACK CARD ======================= */}
      {showBack && (
        <div
          id="aadhaar-back-card"
          className="relative flex flex-col justify-between overflow-hidden bg-white px-2.5 pt-1 pb-1"
          style={{
            width: config.cardLayout === 'both' ? '440px' : '100%',
            height: '280px',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Scissor Cut Guide Line */}
          <div className="relative flex items-center justify-center w-full my-0.5 z-20">
            <div className="flex-1 border-t border-dashed border-slate-400/90" />
            <div className="px-2 flex items-center gap-1 bg-white text-slate-700">
              <Scissors className="h-3 w-3 -rotate-90 text-slate-600" />
            </div>
            <div className="flex-1 border-t border-dashed border-slate-400/90" />
          </div>

          {/* Vertical Spine Details as on Left Margin */}
          <div
            className="absolute left-[-15px] top-[140px] -translate-y-1/2 origin-center -rotate-90 text-[7px] font-bold text-slate-800 tracking-tight whitespace-nowrap z-20"
            style={{ width: '190px', textAlign: 'center' }}
          >
            Details as on: {record.detailsAsOn || '26/02/2026'}
          </div>

          {/* Back Header */}
          <div className="relative flex items-center justify-between pb-0.5 pl-4 pr-1">
            {/* National Emblem */}
            <div className="flex flex-col items-center justify-center -mt-0.5">
              <svg viewBox="0 0 100 130" className="h-8.5 w-auto text-slate-900" fill="currentColor">
                <path d="M50 5 C40 5 35 15 35 25 C35 32 38 38 43 42 C30 45 22 55 22 68 C22 75 25 82 30 87 L28 100 L72 100 L70 87 C75 82 78 75 78 68 C78 55 70 45 57 42 C62 38 65 32 65 25 C65 15 60 5 50 5 Z M50 12 C55 12 58 18 58 25 C58 32 55 38 50 38 C45 38 42 32 42 25 C42 18 45 12 50 12 Z M35 65 C35 55 42 48 50 48 C58 48 65 55 65 65 C65 75 58 82 50 82 C42 82 35 75 35 65 Z" />
                <rect x="25" y="103" width="50" height="6" rx="2" fill="#0f172a" />
                <circle cx="50" cy="116" r="6" fill="none" stroke="#0f172a" strokeWidth="2" />
                <rect x="15" y="124" width="70" height="4" fill="#0f172a" />
              </svg>
              <span className="text-[5.5px] font-bold text-slate-800 uppercase tracking-tighter">
                सत्यमेవ जयते
              </span>
            </div>

            {/* Central Authority Header with Saffron & Green Stripes */}
            <div className="flex flex-col items-center text-center px-1">
              <div className="w-52 h-4 bg-gradient-to-r from-[#ea580c]/80 via-[#f97316] to-[#ea580c]/80 rounded-full flex items-center justify-center shadow-xs">
                <span className="text-[8.5px] font-bold text-slate-950 font-['Noto_Sans_Telugu']">
                  భారత విశిష్ట గుర్తింపు ప్రాధికార సంస్థ
                </span>
              </div>
              <div className="w-56 h-3.5 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 rounded-full flex items-center justify-center -mt-0.5 shadow-xs">
                <span className="text-[8px] font-bold text-white tracking-tight">
                  Unique Identification Authority of India
                </span>
              </div>
            </div>

            {/* Aadhaar Logo */}
            <div className="flex flex-col items-center -mt-0.5">
              <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 120 100" className="h-8 w-auto">
                  <path d="M60,10 A40,40 0 0,1 95,30 L85,38 A28,28 0 0,0 60,22 Z" fill="#ea580c" />
                  <path d="M60,10 A40,40 0 0,0 25,30 L35,38 A28,28 0 0,1 60,22 Z" fill="#ea580c" />
                  <circle cx="60" cy="40" r="18" fill="#f97316" />
                  <path d="M48,60 Q60,42 72,60" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M44,68 Q60,46 76,68" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M40,76 Q60,50 80,76" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M36,84 Q60,54 84,84" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[7.5px] font-extrabold text-red-700 -mt-1 font-['Noto_Sans_Telugu']">
                ఆధార్
              </span>
            </div>
          </div>

          {/* Back Middle Body (Address on Left + Scannable QR Code on Right) */}
          <div className="relative z-10 flex flex-1 items-start gap-2 pl-4 pr-1 py-0.5">
            {/* Address Details (Telugu + English) */}
            <div className="flex flex-1 flex-col justify-center space-y-1 text-left">
              {/* Telugu Address */}
              <div className="text-[7.8px] leading-[1.25] text-slate-900 font-['Noto_Sans_Telugu']">
                <span className="font-bold text-slate-950 block">చిరునామా:</span>
                <span className="font-normal text-slate-800">
                  {record.addressTelugu.replace(/^చిరునామా:\s*/i, '')}
                </span>
              </div>

              {/* English Address */}
              <div className="text-[7.5px] leading-[1.2] text-slate-800">
                <span className="font-bold text-slate-950 block">Address:</span>
                <span className="font-medium text-slate-800">
                  {record.addressEnglish.replace(/^Address:\s*/i, '')}
                </span>
              </div>
            </div>

            {/* High-Resolution Dynamic 2D QR Code */}
            <div className="relative shrink-0 flex flex-col items-center justify-center p-0.5 bg-white border border-slate-400 rounded-xs shadow-xs">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Aadhaar Secure QR"
                  className="h-[102px] w-[102px] object-contain"
                />
              ) : (
                <div className="h-[102px] w-[102px] bg-slate-100 flex items-center justify-center">
                  <span className="text-[8px] text-slate-400">Generating QR...</span>
                </div>
              )}
            </div>
          </div>

          {/* Back Aadhaar Number Bar */}
          <div className="relative z-10 flex flex-col items-center justify-center py-1">
            <div className="text-[17px] font-black tracking-[0.15em] text-slate-950 font-mono">
              {getDisplayAadhaar()}
            </div>
          </div>

          {/* Solid Red Line across Bottom */}
          <div className="w-full border-t-2 border-red-600" />

          {/* Back Footer (Helpline, Email, Website) */}
          <div className="relative flex items-center justify-around bg-white py-0.5 text-[7.5px] font-bold text-slate-900">
            <div className="flex items-center gap-1">
              <Phone className="h-2.5 w-2.5 text-slate-800" />
              <span>1947</span>
            </div>
            <div className="text-slate-400 font-light">|</div>
            <div className="flex items-center gap-1">
              <Mail className="h-2.5 w-2.5 text-slate-800" />
              <span>help@uidai.gov.in</span>
            </div>
            <div className="text-slate-400 font-light">|</div>
            <div className="flex items-center gap-1">
              <Globe className="h-2.5 w-2.5 text-slate-800" />
              <span>www.uidai.gov.in</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
