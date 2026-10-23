import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { UploadedDocuments, ApplicationFormData } from '../types';
import { mergeArcFrontAndBack } from './imageUtils';

export interface GeneratePdfOptions {
  formElement: HTMLElement;
  docs: UploadedDocuments;
  formData: ApplicationFormData;
}

/**
 * Converts SVG or raw vector data URLs into standard high-resolution raster JPEG data URLs
 * to ensure 100% compatibility with jsPDF's addImage across all browsers.
 */
export async function ensureRasterDataUrl(dataUrl: string): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
  if (!dataUrl.startsWith('data:image/svg+xml') && !dataUrl.includes('image/svg+xml')) {
    return dataUrl;
  }
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 1200;
          canvas.height = img.naturalHeight || img.height || 1650;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
            return;
          }
        } catch (e) {
          console.warn('Canvas conversion error in ensureRasterDataUrl:', e);
        }
        resolve(dataUrl);
      };
      img.onerror = (e) => {
        console.warn('SVG image load error in ensureRasterDataUrl:', e);
        resolve(dataUrl);
      };
      img.src = dataUrl;
    } catch (e) {
      resolve(dataUrl);
    }
  });
}

/**
 * Generates a unified high-resolution multi-page PDF in the strict required sequence:
 * Page 1: 사회통합프로그램 연계 신청서 (Official Form Template)
 * Page 2: TOPIK 성적증명서 (Official TOPIK Score Report)
 * Page 3: 외국인등록증 — 앞면 + 뒷면 (Merged ARC on a single page)
 * Page 4+: 여권 (Passport pages, if uploaded)
 */
export async function generateMergedPdf({
  formElement,
  docs,
  formData,
}: GeneratePdfOptions): Promise<jsPDF> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210; // A4 width mm
  const pageHeight = 297; // A4 height mm

  // ==========================================
  // PAGE 1: 사회통합프로그램 연계 신청서 Template (Official Form with Signature)
  // ==========================================
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // fallback
    }
  }

  // Ensure DOM rendering & signature overlay are fully drawn
  await new Promise((r) => setTimeout(r, 160));

  const formCanvas = await html2canvas(formElement, {
    scale: 2, // 2x high-DPI resolution for crisp Korean text and signature
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    onclone: (_clonedDoc, clonedElement) => {
      // Ensure element has standard layout and visible block display
      clonedElement.style.display = 'block';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.transform = 'none';
      clonedElement.style.margin = '0 auto';
    },
  });

  const formImgData = formCanvas.toDataURL('image/jpeg', 0.98);
  pdf.addImage(formImgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

  // ==========================================
  // PAGE 2: TOPIK 성적증명서
  // ==========================================
  if (docs.topikCertList && docs.topikCertList.length > 0) {
    for (let i = 0; i < docs.topikCertList.length; i++) {
      const topikItem = docs.topikCertList[i];
      pdf.addPage('a4', 'portrait');

      // Header label on PDF
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `[첨부 1] 한국어능력시험(TOPIK) 성적증명서 사본 — ${formData.name || '신청인'}`,
        15,
        12
      );

      // Ensure SVG is rasterized into standard JPEG/PNG data URL
      const rasterTopikUrl = await ensureRasterDataUrl(topikItem.dataUrl);

      // Fit inside 180mm x 265mm margins
      try {
        pdf.addImage(
          rasterTopikUrl,
          'JPEG',
          15,
          16,
          180,
          265,
          undefined,
          'FAST'
        );
      } catch (err) {
        // Fallback for PNG or other format
        pdf.addImage(
          rasterTopikUrl,
          'PNG',
          15,
          16,
          180,
          265,
          undefined,
          'FAST'
        );
      }
    }
  }

  // ==========================================
  // PAGE 3: 외국인등록증 (앞면 + 뒷면 Merged on 1 Page)
  // ==========================================
  if (docs.arcFront && docs.arcBack) {
    pdf.addPage('a4', 'portrait');

    const mergedArcDataUrl = await mergeArcFrontAndBack(
      docs.arcFront,
      docs.arcBack,
      formData.name
    );

    pdf.addImage(
      mergedArcDataUrl,
      'JPEG',
      0,
      0,
      pageWidth,
      pageHeight,
      undefined,
      'FAST'
    );
  } else if (docs.arcFront) {
    // If only front is available
    pdf.addPage('a4', 'portrait');
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`[첨부 2] 외국인등록증 사본 — ${formData.name || '신청인'}`, 15, 15);
    const rasterArcUrl = await ensureRasterDataUrl(docs.arcFront);
    pdf.addImage(rasterArcUrl, 'JPEG', 15, 25, 180, 115, undefined, 'FAST');
  }

  // ==========================================
  // PAGE 4+: 여권 (Passport pages if uploaded)
  // ==========================================
  if (docs.passportList && docs.passportList.length > 0) {
    for (let i = 0; i < docs.passportList.length; i++) {
      const pass = docs.passportList[i];
      pdf.addPage('a4', 'portrait');

      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `[첨부 3] 여권 사본 (${i + 1}/${docs.passportList.length}) — ${formData.name || '신청인'}`,
        15,
        12
      );

      const rasterPassUrl = await ensureRasterDataUrl(pass.dataUrl);
      try {
        pdf.addImage(rasterPassUrl, 'JPEG', 15, 18, 180, 260, undefined, 'FAST');
      } catch {
        pdf.addImage(rasterPassUrl, 'PNG', 15, 18, 180, 260, undefined, 'FAST');
      }
    }
  }

  return pdf;
}

/**
 * Generates a single-page high-resolution PDF of only the official application form template
 */
export async function generateSingleFormPdf(
  formElement: HTMLElement
): Promise<jsPDF> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;

  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // fallback
    }
  }

  await new Promise((r) => setTimeout(r, 160));

  const formCanvas = await html2canvas(formElement, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    onclone: (_clonedDoc, clonedElement) => {
      clonedElement.style.display = 'block';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.transform = 'none';
      clonedElement.style.margin = '0 auto';
    },
  });

  const formImgData = formCanvas.toDataURL('image/jpeg', 0.98);
  pdf.addImage(formImgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  return pdf;
}

/**
 * Downloads the generated PDF with a clean standardized filename.
 */
export function downloadPdfFile(pdf: jsPDF, applicantName: string) {
  const safeName = (applicantName || '신청인').replace(/[^a-zA-Z0-9가-힣]/g, '_');
  const filename = `사회통합프로그램_연계신청서_통합서류_${safeName}.pdf`;
  pdf.save(filename);
}

/**
 * Downloads only the single-page application form.
 */
export function downloadSingleFormPdf(pdf: jsPDF, applicantName: string) {
  const safeName = (applicantName || '신청인').replace(/[^a-zA-Z0-9가-힣]/g, '_');
  const filename = `사회통합프로그램_연계신청서_단독본문_${safeName}.pdf`;
  pdf.save(filename);
}
