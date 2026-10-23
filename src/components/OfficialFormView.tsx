import React from 'react';
import { ApplicationFormData, Language, SignatureSettings } from '../types';
import { findOfficeByAddress } from '../data/immigrationOffices';
import { InteractiveSignatureOverlay } from './InteractiveSignatureOverlay';
import { cleanVisaStatus, normalizeDocVerificationNo } from '../utils/sanitizers';

import { WatermarkOverlay } from './WatermarkOverlay';
import { OfficialApprovedSeal } from './OfficialApprovedSeal';

interface OfficialFormViewProps {
  formData: ApplicationFormData;
  signatureUrl: string | null;
  sigSettings?: SignatureSettings;
  onSigSettingsChange?: React.Dispatch<React.SetStateAction<SignatureSettings>>;
  editable?: boolean;
  onFieldChange?: (field: keyof ApplicationFormData, value: any) => void;
  onDocPartChange?: (index: number, val: string) => void;
  lang?: Language;
  containerRef?: React.Ref<HTMLDivElement>;
  showWatermark?: boolean;
  onRightClickBlock?: () => void;
}

export const OfficialFormView: React.FC<OfficialFormViewProps> = ({
  formData,
  signatureUrl,
  sigSettings = { x: 0, y: 0, scale: 1.0, removeBg: true },
  onSigSettingsChange,
  editable = false,
  onFieldChange,
  onDocPartChange,
  containerRef,
  showWatermark = false,
  onRightClickBlock,
}) => {
  const matchedOffice = findOfficeByAddress(formData.address);

  const getOfficeChiefTitle = () => {
    if (!matchedOffice) {
      return '○○ 출입국·외국인청(사무소)장 귀하';
    }
    const name = matchedOffice.name;
    if (name.endsWith('청')) {
      return `${name}장 귀하`;
    }
    if (name.endsWith('사무소')) {
      return `${name}장 귀하`;
    }
    if (name.endsWith('출장소')) {
      return `${name}장 귀하`;
    }
    return `${name}장 귀하`;
  };

  const handleTextChange = (field: keyof ApplicationFormData, val: string) => {
    if (onFieldChange) onFieldChange(field, val);
  };

  const normalizedDocs = normalizeDocVerificationNo(formData.docVerificationNo);
  const docPart0 = normalizedDocs[0] || '';
  const docPart1 = normalizedDocs[1] || '';
  const docPart2 = normalizedDocs[2] || '';
  const docPart3 = normalizedDocs[3] || '';

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onRightClickBlock) onRightClickBlock();
      }}
      className="bg-white text-black shadow-2xl relative select-text mx-auto overflow-hidden"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '14mm 14mm 12mm 14mm',
        fontFamily: '"Noto Serif KR", "Batang", "Nanum Myeongjo", serif',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Watermark Overlay (REJECTION) if active */}
      <WatermarkOverlay show={Boolean(showWatermark)} />

      {/* Official KIIP Approved Seal Stamp when unlocked */}
      {!showWatermark && (
        <div className="absolute top-6 right-6 pointer-events-none z-10 animate-in fade-in zoom-in-90 duration-300">
          <OfficialApprovedSeal size={76} />
        </div>
      )}

      {/* Official Form Header */}
      <div className="mb-3">
        <p className="text-[10px] text-slate-700 mb-1 text-left font-serif">
          [별지 서식] 사회통합정보망(www.socinet.go.kr) - 민원서식
        </p>
        <h1 className="text-[23px] font-bold text-center tracking-[3px] mt-1 font-serif text-black">
          사회통합프로그램 연계 신청서
        </h1>
        <p className="text-[11px] text-center text-slate-600 mt-0.5 tracking-wider font-sans">
          (Application for Korea Immigration & Integration Program Linkage)
        </p>
      </div>

      {/* Main Form Table */}
      <table className="w-full border-collapse border-2 border-black text-[13px] leading-snug">
        <colgroup>
          <col style={{ width: '18%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '25%' }} />
        </colgroup>
        <tbody>
          {/* Block 1: 신청 대상 */}
          <tr className="border-t-2 border-black">
            <td
              rowSpan={2}
              className="bg-[#f2f2f2] font-bold text-center align-middle p-2 border border-black text-[12.5px]"
            >
              신청 대상
              <br />
              <span className="text-[10px] font-normal text-slate-600 font-sans">
                (※해당√표)
              </span>
            </td>
            <td colSpan={4} className="p-2 border border-black">
              {editable ? (
                <label className="inline-flex items-center gap-2 cursor-pointer font-serif">
                  <input
                    type="checkbox"
                    checked={formData.applyType === 'topik'}
                    onChange={() => handleTextChange('applyType', 'topik')}
                    className="w-4 h-4 accent-black"
                  />
                  <b className="text-[13px]">한국어능력시험(TOPIK) 연계평가 신청</b>
                </label>
              ) : (
                <div className="flex items-center gap-2 font-serif font-bold text-[13px]">
                  <span>{formData.applyType === 'topik' ? '☑' : '☐'}</span>
                  <span>한국어능력시험(TOPIK) 연계평가 신청</span>
                </div>
              )}
            </td>
          </tr>
          <tr className="border-b-2 border-black">
            <td colSpan={4} className="p-2 border border-black">
              {editable ? (
                <label className="inline-flex items-center gap-2 cursor-pointer font-serif text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.applyType === 'marriage'}
                    onChange={() => handleTextChange('applyType', 'marriage')}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-[13px]">결혼이민사증 소지자의 2단계 연계 신청</span>
                </label>
              ) : (
                <div className="flex items-center gap-2 font-serif text-[13px] text-slate-800">
                  <span>{formData.applyType === 'marriage' ? '☑' : '☐'}</span>
                  <span>결혼이민사증 소지자의 2단계 연계 신청</span>
                </div>
              )}
            </td>
          </tr>

          {/* Block 2: 신청인 */}
          <tr className="border-t-2 border-black">
            <td
              rowSpan={6}
              className="bg-[#f2f2f2] font-bold text-center align-middle p-1.5 border border-black tracking-widest text-[13px]"
            >
              신&nbsp;청&nbsp;인
            </td>
            <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
              성&nbsp;&nbsp;&nbsp;&nbsp;명
            </td>
            <td colSpan={3} className="p-1 border border-black">
              {editable ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleTextChange('name', e.target.value.toUpperCase())}
                  className="w-full h-8 px-2 bg-transparent border-0 font-serif font-bold text-[14px] text-black outline-none"
                  placeholder="0000 0000"
                />
              ) : (
                <div className="font-serif font-bold text-[14px] px-2 py-1 text-black">
                  {formData.name || '0000 0000'}
                </div>
              )}
            </td>
          </tr>

          <tr>
            <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black leading-tight text-[11.5px]">
              외국인(주민)
              <br />
              등록번호
            </td>
            <td className="p-1 border border-black">
              {editable ? (
                <div className="flex items-center justify-center gap-1 w-full">
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.regNumber1}
                    onChange={(e) =>
                      handleTextChange('regNumber1', e.target.value.replace(/[^0-9]/g, ''))
                    }
                    className="w-[46%] h-8 text-center bg-transparent border-0 font-serif font-bold text-[14px] outline-none"
                    placeholder="000000"
                  />
                  <span className="font-bold">-</span>
                  <input
                    type="text"
                    maxLength={7}
                    value={formData.regNumber2}
                    onChange={(e) =>
                      handleTextChange('regNumber2', e.target.value.replace(/[^0-9]/g, ''))
                    }
                    className="w-[46%] h-8 text-center bg-transparent border-0 font-serif font-bold text-[14px] outline-none"
                    placeholder="0000000"
                  />
                </div>
              ) : (
                <div className="font-serif font-bold text-[14px] text-center py-1 tracking-wider">
                  {formData.regNumber1 || '000000'} - {formData.regNumber2 || '0000000'}
                </div>
              )}
            </td>
            <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
              성&nbsp;&nbsp;별
            </td>
            <td className="p-1 border border-black text-center">
              {editable ? (
                <select
                  value={formData.gender}
                  onChange={(e) => handleTextChange('gender', e.target.value)}
                  className="w-full h-8 bg-transparent border-0 font-serif text-center outline-none cursor-pointer font-bold"
                >
                  <option value="">선택</option>
                  <option value="남">남 (Male)</option>
                  <option value="여">여 (Female)</option>
                </select>
              ) : (
                <div className="font-serif font-bold text-[13px] py-1">
                  {formData.gender ? `${formData.gender}자` : '남자'}
                </div>
              )}
            </td>
          </tr>

          <tr>
            <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
              국&nbsp;&nbsp;&nbsp;&nbsp;적
            </td>
            <td className="p-1 border border-black text-center">
              {editable ? (
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleTextChange('nationality', e.target.value)}
                  className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[13px] outline-none"
                  placeholder="Cambodia"
                />
              ) : (
                <div className="font-serif font-bold text-[13px] py-1">
                  {formData.nationality || 'Cambodia'}
                </div>
              )}
            </td>
            <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
              체류자격
            </td>
            <td className="p-1 border border-black text-center">
              {editable ? (
                <input
                  type="text"
                  value={cleanVisaStatus(formData.visaStatus)}
                  onChange={(e) => handleTextChange('visaStatus', cleanVisaStatus(e.target.value))}
                  className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[13px] outline-none"
                  placeholder="E-9-1"
                />
              ) : (
                <div className="font-serif font-bold text-[13px] py-1">
                  {cleanVisaStatus(formData.visaStatus) || 'E-9-1'}
                </div>
              )}
            </td>
          </tr>
          <tr>
            <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
              여권번호
            </td>
            <td className="p-1 border border-black text-center">
              {editable ? (
                <input
                  type="text"
                  value={formData.passportNo || ""}
                  onChange={(e) => handleTextChange("passportNo", e.target.value.toUpperCase().trim())}
                  className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[13px] text-black outline-none tracking-wider"
                  placeholder="N01847291"
                />
              ) : (
                <div className="font-serif font-bold text-[13px] py-1 tracking-wider">
                  {formData.passportNo || "N01847291"}
                </div>
              )}
            </td>
            <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black leading-tight text-[11.5px]">
              여권 유효기간
            </td>
            <td className="p-1 border border-black text-center">
              {editable ? (
                <input
                  type="text"
                  value={formData.passportExpiry || ""}
                  onChange={(e) => handleTextChange("passportExpiry", e.target.value)}
                  className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[13px] text-black outline-none"
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <div className="font-serif font-bold text-[13px] py-1">
                  {formData.passportExpiry || "2031-08-15"}
                </div>
              )}
            </td>
          </tr>

          <tr>
            <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
              체&nbsp;류&nbsp;지
            </td>
            <td colSpan={3} className="p-1 border border-black">
              {editable ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleTextChange('address', e.target.value)}
                  className="w-full h-8 px-2 bg-transparent border-0 font-serif font-bold text-[13px] text-black outline-none"
                  placeholder="00000 0000 000"
                />
              ) : (
                <div className="font-serif font-bold text-[12.5px] px-2 py-1 text-black">
                  {formData.address || '00000 0000 000'}
                </div>
              )}
            </td>
          </tr>

          <tr className="border-b-2 border-black">
            <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
              전화번호
            </td>
            <td className="p-1 border border-black text-center">
              {editable ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleTextChange('phone', e.target.value)}
                  className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[13px] text-black outline-none"
                  placeholder="010-0000-0000"
                />
              ) : (
                <div className="font-serif font-bold text-[13px] py-1">
                  {formData.phone || formData.mobile || '010-0000-0000'}
                </div>
              )}
            </td>
            <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
              휴대폰
            </td>
            <td className="p-1 border border-black text-center">
              {editable ? (
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => handleTextChange('mobile', e.target.value)}
                  className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[13px] text-black outline-none"
                  placeholder="010-0000-0000"
                />
              ) : (
                <div className="font-serif font-bold text-[13px] py-1">
                  {formData.mobile || formData.phone || '010-0000-0000'}
                </div>
              )}
            </td>
          </tr>

          {/* Block 3: 한국어능력시험 성적증명서 (OFFICIAL TOPIK SCORE REPORT) */}
          <tr className="border-t-2 border-black">
            <td
              rowSpan={4}
              className="bg-[#f2f2f2] font-bold text-center align-middle p-2 border border-black text-[12px] leading-tight"
            >
              한국어
              <br />
              능력시험
              <br />
              성적증명서
              <br />
              <span className="text-[9.5px] font-normal text-slate-700 font-sans block mt-1">
                (OFFICIAL
                <br />
                TOPIK SCORE
                <br />
                REPORT)
              </span>
            </td>
            <td className="bg-[#f2f2f2] font-bold text-center p-1.5 border border-black text-[12.5px]">
              문서확인번호
            </td>
            <td colSpan={3} className="p-2 border border-black text-center">
              {editable ? (
                <div className="flex flex-col items-center justify-center gap-1 w-full">
                  <div className="flex items-center justify-center gap-1.5 w-full" style={{ fontFamily: 'Noto Serif KR' }}>
                    {[0, 1, 2, 3].map((idx) => (
                      <React.Fragment key={idx}>
                        <input
                          type="text"
                          maxLength={4}
                          value={formData.docVerificationNo?.[idx] || ''}
                          onChange={(e) => {
                            if (onDocPartChange) onDocPartChange(idx, e.target.value);
                          }}
                          className="w-16 h-8 text-center bg-white border border-slate-500 font-serif font-bold text-[15pt] text-black outline-none"
                          style={{ fontFamily: 'Noto Serif KR' }}
                          placeholder="0000"
                        />
                        {idx < 3 && <span className="font-bold text-[15pt]">-</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-600 font-sans">
                    ※ 온라인 출력 성적증명서의 경우 작성
                  </span>
                </div>
              ) : (
                <div className="py-1">
                  <div
                    className="font-bold text-[16px] text-center tracking-widest text-black"
                    style={{ fontFamily: 'Noto Serif KR' }}
                  >
                    {docPart0 || '0000'} - {docPart1 || '0000'} - {docPart2 || '0000'} - {docPart3 || '0000'}
                  </div>
                  <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                    ※ 온라인 출력 성적증명서 확인번호 (16자리)
                  </span>
                </div>
              )}
            </td>
          </tr>

          <tr>
            <td
              colSpan={2}
              className="bg-[#f2f2f2] font-bold text-center p-1.5 border border-black text-[12px]"
            >
              수&nbsp;험&nbsp;번&nbsp;호&nbsp;
              <span className="text-[10px] font-normal text-slate-600 font-sans block sm:inline">
                (Registration No. / Application No.)
              </span>
            </td>
            <td colSpan={2} className="p-1 border border-black text-center">
              {editable ? (
                <div style={{ fontFamily: 'Noto Serif KR' }}>
                  <input
                    type="text"
                    value={formData.examNumber}
                    onChange={(e) => handleTextChange('examNumber', e.target.value)}
                    className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[14px] text-black outline-none tracking-wider"
                    style={{ fontFamily: 'Noto Serif KR' }}
                    placeholder="0000000000000"
                  />
                </div>
              ) : (
                <div
                  className="font-bold text-[14px] text-center py-1 tracking-wider text-black"
                  style={{ fontFamily: 'Noto Serif KR' }}
                >
                  {formData.examNumber || '0000000000000'}
                </div>
              )}
            </td>
          </tr>

          <tr>
            <td className="bg-[#f2f2f2] font-bold text-center p-1.5 border border-black text-[12px]">
              시&nbsp;험&nbsp;일
              <br />
              <span className="text-[10px] font-normal text-slate-600 font-sans">
                (Test Date)
              </span>
            </td>
            <td className="p-1 border border-black text-center">
              {editable ? (
                <input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => handleTextChange('examDate', e.target.value)}
                  className="w-full h-8 bg-transparent border-0 font-serif font-bold text-[13px] text-center outline-none"
                />
              ) : (
                <div className="font-serif font-bold text-[13px] py-1 text-center">
                  {formData.examDate || '0000-00-00'}
                </div>
              )}
            </td>
            <td className="bg-[#f2f2f2] font-bold text-center p-1.5 border border-black text-[12px]">
              회&nbsp;&nbsp;&nbsp;&nbsp;차
              <br />
              <span className="text-[10px] font-normal text-slate-600 font-sans">
                (Test Held)
              </span>
            </td>
            <td className="p-1 border border-black text-center">
              {editable ? (
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="text"
                    value={formData.round}
                    onChange={(e) =>
                      handleTextChange('round', e.target.value.replace(/[^0-9]/g, ''))
                    }
                    className="w-16 h-8 text-center bg-transparent border-0 font-serif font-bold text-[14px] outline-none"
                    placeholder="000"
                  />
                  <span className="font-bold">회</span>
                </div>
              ) : (
                <div className="font-serif font-bold text-[13.5px] py-1 text-center">
                  제 {formData.round || '000'} 회
                </div>
              )}
            </td>
          </tr>

          <tr className="border-b-2 border-black">
            <td className="bg-[#f2f2f2] font-bold text-center p-1.5 border border-black text-[12px]">
              성적유효기간
              <br />
              <span className="text-[10px] font-normal text-slate-600 font-sans">
                (Valid Until)
              </span>
            </td>
            <td className="p-1 border border-black text-center">
              {editable ? (
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => handleTextChange('validUntil', e.target.value)}
                  className="w-full h-8 bg-transparent border-0 font-serif font-bold text-[13px] text-center outline-none"
                />
              ) : (
                <div className="font-serif font-bold text-[13px] py-1 text-center text-rose-700">
                  {formData.validUntil || '0000-00-00'}
                </div>
              )}
            </td>
            <td className="bg-[#f2f2f2] font-bold text-center p-1.5 border border-black text-[12px]">
              등&nbsp;&nbsp;&nbsp;&nbsp;급
              <br />
              <span className="text-[10px] font-normal text-slate-600 font-sans">
                (Grade)
              </span>
            </td>
            <td className="p-1 border border-black text-center">
              {editable ? (
                <select
                  value={formData.grade}
                  onChange={(e) => handleTextChange('grade', e.target.value)}
                  className="w-full h-8 bg-transparent border-0 font-serif font-bold text-[14px] text-center outline-none cursor-pointer"
                >
                  <option value="">선택</option>
                  <option value="1급">1급 (Level 1)</option>
                  <option value="2급">2급 (Level 2)</option>
                  <option value="3급">3급 (Level 3)</option>
                  <option value="4급">4급 (Level 4)</option>
                  <option value="5급">5급 (Level 5)</option>
                  <option value="6급">6급 (Level 6)</option>
                </select>
              ) : (
                <div className="font-serif font-bold text-[14px] py-1 text-center text-emerald-800">
                  {formData.grade || '0급'}
                </div>
              )}
            </td>
          </tr>

          {/* Block 4: 해외 한국어 교육기관 이수증 사항 (결혼이민자 전용) */}
          <tr className="border-t-2 border-b-2 border-black">
            <td className="bg-[#f2f2f2] font-bold text-center align-middle p-2 border border-black text-[11.5px] leading-tight">
              법무부 지정
              <br />
              해외 한국어
              <br />
              교육기관
              <br />
              이수증 사항
            </td>
            <td colSpan={2} className="p-2 border border-black align-top">
              <div className="font-bold text-[11.5px] mb-1">교육기관명</div>
              {editable ? (
                <input
                  type="text"
                  value={formData.instituteName}
                  onChange={(e) => handleTextChange('instituteName', e.target.value)}
                  className="w-full h-7 bg-transparent border-b border-slate-300 font-serif text-[12.5px] outline-none"
                  placeholder="해당 시 기재"
                />
              ) : (
                <div className="font-serif text-[12px] min-h-[20px] text-slate-800">
                  {formData.instituteName || '-'}
                </div>
              )}
              <div className="text-[10px] text-slate-500 mt-1 font-sans">
                ※ 결혼이민사증 2단계 연계자만 작성
              </div>
            </td>
            <td colSpan={2} className="p-2 border border-black align-top">
              <div className="font-bold text-[11.5px] mb-1">이수일자</div>
              {editable ? (
                <input
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => handleTextChange('completionDate', e.target.value)}
                  className="w-full h-7 bg-transparent border-b border-slate-300 font-serif text-[12px] outline-none"
                />
              ) : (
                <div className="font-serif text-[12px] min-h-[20px] text-slate-800">
                  {formData.completionDate || '-'}
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Official Socinet Linkage Verification Strip */}
      <div className="my-2 p-1.5 bg-[#f8fafc] border border-black text-[11px] font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-black leading-tight">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold font-serif">※ 사회통합정보망(Socinet) 계정 정보 (연계 확인용) :</span>
          <span>아이디(ID): <strong className="font-mono text-black font-bold">{formData.socinetId || '-'}</strong></span>
          <span>비밀번호(PW): <strong className="font-mono text-black font-bold">{formData.socinetPw || '-'}</strong></span>
        </div>
        <span className="text-[10px] text-slate-700 font-bold">사회통합정보망 (www.socinet.go.kr)</span>
      </div>

      {/* Official Declaration Block */}
      <div className="text-center my-6 text-[13.5px] leading-relaxed font-bold font-serif">
        <p>나는 위에 기재한 사항이 사실과 틀림없음을 서약하고,</p>
        <p>사회통합프로그램 연계를 신청합니다.</p>
      </div>

      {/* Privacy Consent Box */}
      <div className="bg-[#fbfbfb] border-t-[1.5px] border-b border-black p-2.5 text-[11.5px] leading-snug font-serif">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <span className="font-bold">
            o 상기 본인은 사회통합프로그램 연계 신청을 위한 개인정보 이용에 동의합니다.
          </span>
          <div className="flex items-center gap-4 text-[12px] font-bold">
            <span className="inline-flex items-center gap-1">
              <span>{formData.consent === 'agree' ? '☑' : '☐'}</span> 동의함
            </span>
            <span className="inline-flex items-center gap-1">
              <span>{formData.consent === 'disagree' ? '☑' : '☐'}</span> 동의하지 않음
            </span>
          </div>
        </div>
        <p className="text-[10.5px] text-slate-700 pl-2">
          • 이용·보유기간 : 제공일로부터 5년(보유기간 경과 시 즉각 폐기) - 개인정보보호법 제15조 및 제24조 의거
        </p>
        <p className="text-[10.5px] text-slate-700 pl-2">
          • 거부시 불이익 조치 : 개인정보이용제공 부동의 시 본 연계 신청 불가
        </p>
      </div>

      {/* Warning Box */}
      <div className="border-b-[1.5px] border-black p-2 bg-white text-[10.5px] text-slate-800 leading-normal font-serif">
        <p>
          ※ 신청서에 허위사실을 기재하거나 허위의 한국어능력시험 성적증명서 또는 이수증(수료증)을 제출하였을 경우 당해 연계 신청 및 승인된 후 수료한 모든 사회통합프로그램 과정이 무효가 되며 이와 관련하여 처벌받을 수 있음
        </p>
      </div>

      {/* Footer with Date, Applicant Name, Signature Stamp & Office Destination */}
      <div className="mt-6 flex flex-col font-serif">
        <div className="ml-auto mr-4 mb-5 text-right space-y-2">
          {/* Application Date: Auto-detected current date with manual editing */}
          <div className="flex items-center justify-end gap-1.5 text-[12.5px] font-bold">
            <span>신청일자&nbsp;:&nbsp;&nbsp;</span>
            {editable ? (
              <>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.applyYear || ""}
                  onChange={(e) => handleTextChange("applyYear", e.target.value)}
                  className="w-14 text-center bg-transparent border-b border-black font-serif font-bold text-[12.5px] outline-none"
                  placeholder={new Date().getFullYear().toString()}
                />
                <span>년</span>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.applyMonth || ""}
                  onChange={(e) => handleTextChange("applyMonth", e.target.value)}
                  className="w-8 text-center bg-transparent border-b border-black font-serif font-bold text-[12.5px] outline-none"
                  placeholder={String(new Date().getMonth() + 1).padStart(2, "0")}
                />
                <span>월</span>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.applyDay || ""}
                  onChange={(e) => handleTextChange("applyDay", e.target.value)}
                  className="w-8 text-center bg-transparent border-b border-black font-serif font-bold text-[12.5px] outline-none"
                  placeholder={String(new Date().getDate()).padStart(2, "0")}
                />
                <span>일</span>
              </>
            ) : (
              <>
                <span>{formData.applyYear && formData.applyYear !== "0000" ? formData.applyYear : new Date().getFullYear()}년</span>
                <span>{formData.applyMonth && formData.applyMonth !== "00" ? formData.applyMonth : String(new Date().getMonth() + 1).padStart(2, "0")}월</span>
                <span>{formData.applyDay && formData.applyDay !== "00" ? formData.applyDay : String(new Date().getDate()).padStart(2, "0")}일</span>
              </>
            )}
          </div>

          {/* Applicant Name & Signature Stamp */}
          <div className="relative flex items-center justify-end gap-2 text-[12.5px] pt-1">
            <span className="font-bold">신&nbsp;청&nbsp;자&nbsp;:&nbsp;&nbsp;</span>
            <span className="font-bold tracking-wider text-[13px] text-black">
              {formData.applicantName || formData.name || '0000 0000'}
            </span>
            <span className="text-[11px] text-slate-600 font-normal">
              (서명 또는 인)
            </span>

            {/* Render Transparent Interactive Signature Stamp */}
            {signatureUrl && (
              <InteractiveSignatureOverlay
                signatureUrl={signatureUrl}
                sigSettings={sigSettings}
                setSigSettings={onSigSettingsChange || (() => {})}
                readOnly={!onSigSettingsChange}
              />
            )}


          </div>
        </div>

        {/* Dynamic Chief Designation */}
        <p className="text-[14px] font-bold text-left mt-3 tracking-wide">
          {getOfficeChiefTitle()}
        </p>
      </div>
    </div>
  );
};
