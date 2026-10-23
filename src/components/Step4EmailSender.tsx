import React, { useState, useEffect } from 'react';
import { ApplicationFormData, Language, ImmigrationOffice } from '../types';
import { getTranslation } from '../utils/translations';
import { IMMIGRATION_OFFICES, findOfficeByAddress } from '../data/immigrationOffices';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Building2, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck,
  Paperclip,
  ExternalLink
} from 'lucide-react';

interface Step4EmailSenderProps {
  formData: ApplicationFormData;
  lang: Language;
  onPrev: () => void;
  onRestart: () => void;
}

export const Step4EmailSender: React.FC<Step4EmailSenderProps> = ({
  formData,
  lang,
  onPrev,
  onRestart,
}) => {
  const t = getTranslation(lang);

  // Selected office
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('');
  const [customRecipientEmail, setCustomRecipientEmail] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-detect office based on address
  useEffect(() => {
    const matched = findOfficeByAddress(formData.address);
    if (matched) {
      setSelectedOfficeId(matched.id);
      setCustomRecipientEmail(matched.email);
    } else {
      setSelectedOfficeId('');
    }
  }, [formData.address]);

  const handleSelectOffice = (id: string) => {
    setSelectedOfficeId(id);
    const office = IMMIGRATION_OFFICES.find((o) => o.id === id);
    if (office) {
      setCustomRecipientEmail(office.email);
    }
  };

  const selectedOffice = IMMIGRATION_OFFICES.find((o) => o.id === selectedOfficeId) || null;
  const activeRecipientEmail = customRecipientEmail.trim() || selectedOffice?.email || '';

  const applicantDisplayName = formData.applicantName || formData.name || "EANG VEASNA";

  // Build Subject
  const emailSubject = `사회통합프로그램(사회통합정보망) 연계 신청 서류 제출 - ${applicantDisplayName}`;

  // Build Body exactly as requested by user
  const defaultEmailBody = `안녕하세요. ${applicantDisplayName}입니다.

사회통합프로그램(사회통합정보망) 연계 신청 서류를 새로 제출하였습니다.
바쁘시겠지만 확인 후 빠른 처리 부탁드립니다.

감사합니다.

[신청자 정보]
성명: ${applicantDisplayName}
연락처: ${formData.phone || formData.mobile || "010-0000-0000"}
Socinet ID: ${formData.socinetId || ""}
Socinet 비밀번호: ${formData.socinetPw || ""}

첨부: 통합 PDF (신청서, TOPIK 성적증명서, 외국인등록증, 여권)`;

  const [emailBody, setEmailBody] = useState<string>(defaultEmailBody);

  useEffect(() => {
    setEmailBody(defaultEmailBody);
  }, [formData.name, formData.applicantName, formData.phone, formData.mobile, formData.socinetId, formData.socinetPw]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleOpenMailto = () => {
    if (!activeRecipientEmail) {
      alert('출입국관서 이메일 주소를 입력하거나 선택해 주세요.');
      return;
    }
    const mailtoUrl = `mailto:${activeRecipientEmail}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            {t.step4Tab}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {t.step4Title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.step4Subtitle}
        </p>

        {/* Address and Jurisdiction status */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block">
              {t.residenceAddress}
            </span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {formData.address || '(미입력)'}
            </span>
          </div>

          {selectedOffice ? (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-100/70 px-3 py-1.5 rounded-xl font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>관할 관서: {selectedOffice.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-800 bg-amber-100/70 px-3 py-1.5 rounded-xl font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t.notMatchedWarning}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Email Form Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Office Select Dropdown & Manual Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>받는 사람 (출입국관서 이메일)</span>
                <span className="text-rose-500">*</span>
                <span className="text-[11px] font-normal text-slate-500">{t.manualSelectOrEdit}</span>
              </label>
              {selectedOffice && (
                <span className="text-blue-600 text-xs font-semibold">
                  전화: {selectedOffice.phone}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Dropdown selector */}
              <div>
                <select
                  value={selectedOfficeId}
                  onChange={(e) => handleSelectOffice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-semibold text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="">{t.selectOffice}</option>
                  {IMMIGRATION_OFFICES.map((office) => (
                    <option key={office.id} value={office.id}>
                      {office.name} ({office.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Manual Direct Editable Input */}
              <div className="relative">
                <input
                  type="email"
                  placeholder={lang === 'km' ? 'kiipdaejeon@korea.kr (កែដោយដៃ)' : lang === 'ko' ? 'kiipdaejeon@korea.kr (직접 입력)' : 'kiipdaejeon@korea.kr (custom edit)'}
                  value={customRecipientEmail}
                  onChange={(e) => setCustomRecipientEmail(e.target.value)}
                  className="w-full pl-4 pr-24 py-3 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(activeRecipientEmail, 'email')}
                  disabled={!activeRecipientEmail}
                  className="absolute right-2 top-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedField === 'email' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Selected Office Details Card */}
            {selectedOffice && (
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>{selectedOffice.name} (이민통합지원센터)</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedOffice.address}</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>전용 전화: <strong>{selectedOffice.phone}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-blue-100/70 text-blue-800 font-semibold text-[11px]">
                    관할 관서 자동 선택됨
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Email Subject */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t.emailSubject}
              </label>
              <button
                onClick={() => copyToClipboard(emailSubject, 'subject')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {copiedField === 'subject' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copySubjectBtn}</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={emailSubject}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm text-slate-900 select-all"
            />
          </div>

          {/* Email Content / Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t.emailContent}
              </label>
              <button
                onClick={() => copyToClipboard(emailBody, 'body')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {copiedField === 'body' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copyBodyBtn}</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={14}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 font-mono text-xs sm:text-sm text-slate-900 leading-relaxed outline-none transition-colors"
              title="អាចកែប្រែខ្លឹមសារ Email ដោយដៃបាន"
            />
          </div>

          {/* Big Action Button: 1-Click Open Email */}
          <div className="pt-2">
            <button
              onClick={handleOpenMailto}
              disabled={!selectedOffice}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-extrabold text-base shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{t.openEmailClientBtn}</span>
            </button>
          </div>

          {/* Critical Reminder Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Paperclip className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-amber-900">{t.attachReminderTitle}</p>
              <p className="text-amber-800 leading-relaxed">
                {t.attachReminderDesc}
              </p>
              <p className="text-amber-700 text-[11px]">
                <span>{lang === 'km' ? 'ឈ្មោះ File: ' : lang === 'ko' ? '첨부 파일: ' : 'File: '}<strong>사회통합프로그램_연계신청서_{formData.name || '신청인'}.pdf</strong></span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav footer */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 text-sm hover:bg-slate-100 transition-colors"
        >
          {t.prevStep}
        </button>

        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm transition-colors shadow-xs"
        >
          {t.newApplication}
        </button>
      </div>
    </div>
  );
};
