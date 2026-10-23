/**
 * Utility functions for image manipulation, background removal, and file conversion.
 */

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export interface RemoveBackgroundOptions {
  threshold?: number; // 10 to 90, default 50
  bgMode?: 'transparent' | 'white'; // 'transparent' or pure 'white'
  inkColor?: 'blue' | 'black' | 'original'; // '#1e3a8a', '#0f172a', or original pen color
  autoCrop?: boolean; // whether to trim empty margin around signature
}

/**
 * Enhanced adaptive signature background cleaner.
 * Removes shadows, paper tint, desk grain, and converts background to 100% transparent or pure white #ffffff.
 * Boosts pen ink contrast to deep blue or solid black.
 */
export function removeImageBackground(
  imageSource: string,
  options: RemoveBackgroundOptions = {}
): Promise<string> {
  const {
    threshold = 50,
    bgMode = 'transparent',
    inkColor = 'blue',
    autoCrop = true,
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(imageSource);
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Check if the image already has significant transparent pixels (e.g. drawn from HTML canvas)
      let transparentPixelCount = 0;
      const totalPixels = w * h;
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] < 128) transparentPixelCount++;
      }
      const isAlreadyDigitalCanvas = transparentPixelCount > (totalPixels / 16) * 0.15;

      if (isAlreadyDigitalCanvas) {
        // Handle digitally drawn signature: preserve strokes and apply background mode
        let minX = w;
        let minY = h;
        let maxX = 0;
        let maxY = 0;
        let hasInk = false;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            if (a < 30) {
              // Background pixel
              if (bgMode === 'white') {
                data[idx] = 255;
                data[idx + 1] = 255;
                data[idx + 2] = 255;
                data[idx + 3] = 255;
              } else {
                data[idx + 3] = 0;
              }
            } else {
              // Drawn ink pixel
              hasInk = true;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;

              const strokeAlpha = a / 255;
              if (inkColor === 'blue') {
                if (bgMode === 'white') {
                  data[idx] = Math.round(255 - (255 - 30) * strokeAlpha);
                  data[idx + 1] = Math.round(255 - (255 - 58) * strokeAlpha);
                  data[idx + 2] = Math.round(255 - (255 - 138) * strokeAlpha);
                  data[idx + 3] = 255;
                } else {
                  data[idx] = 30;
                  data[idx + 1] = 58;
                  data[idx + 2] = 138;
                  data[idx + 3] = a;
                }
              } else if (inkColor === 'black') {
                if (bgMode === 'white') {
                  data[idx] = Math.round(255 - (255 - 15) * strokeAlpha);
                  data[idx + 1] = Math.round(255 - (255 - 23) * strokeAlpha);
                  data[idx + 2] = Math.round(255 - (255 - 42) * strokeAlpha);
                  data[idx + 3] = 255;
                } else {
                  data[idx] = 15;
                  data[idx + 1] = 23;
                  data[idx + 2] = 42;
                  data[idx + 3] = a;
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        if (autoCrop && hasInk && minX < maxX && minY < maxY) {
          const pad = 12;
          const cx = Math.max(0, minX - pad);
          const cy = Math.max(0, minY - pad);
          const cw = Math.min(w - cx, maxX - minX + pad * 2);
          const ch = Math.min(h - cy, maxY - minY + pad * 2);
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cw;
          cropCanvas.height = ch;
          const cropCtx = cropCanvas.getContext('2d');
          if (cropCtx) {
            cropCtx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
            return resolve(cropCanvas.toDataURL('image/png'));
          }
        }
        return resolve(canvas.toDataURL('image/png'));
      }

      // 2. Real camera photograph of signature on paper:
      // Build an adaptive local background luminance map using tile grids
      // This completely cancels paper shadows, desk gradient lighting, and camera vignette!
      const tileSize = Math.max(16, Math.min(48, Math.floor(Math.min(w, h) / 12)));
      const gridCols = Math.ceil(w / tileSize);
      const gridRows = Math.ceil(h / tileSize);
      const bgGrid: number[][] = [];

      for (let gy = 0; gy < gridRows; gy++) {
        bgGrid[gy] = [];
        for (let gx = 0; gx < gridCols; gx++) {
          const startX = gx * tileSize;
          const startY = gy * tileSize;
          const endX = Math.min(w, startX + tileSize);
          const endY = Math.min(h, startY + tileSize);

          const luminances: number[] = [];
          for (let py = startY; py < endY; py += 2) {
            for (let px = startX; px < endX; px += 2) {
              const idx = (py * w + px) * 4;
              const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
              luminances.push(lum);
            }
          }

          if (luminances.length > 0) {
            luminances.sort((a, b) => a - b);
            // 90th percentile luminance represents local paper background
            const p90Idx = Math.floor(luminances.length * 0.90);
            bgGrid[gy][gx] = luminances[p90Idx] || 240;
          } else {
            bgGrid[gy][gx] = 240;
          }
        }
      }

      // Bilinear interpolation function for smooth local background luminance
      const getLocalBgLum = (x: number, y: number): number => {
        const gx = (x / tileSize) - 0.5;
        const gy = (y / tileSize) - 0.5;

        const x0 = Math.max(0, Math.floor(gx));
        const x1 = Math.min(gridCols - 1, x0 + 1);
        const y0 = Math.max(0, Math.floor(gy));
        const y1 = Math.min(gridRows - 1, y0 + 1);

        const fx = Math.max(0, Math.min(1, gx - x0));
        const fy = Math.max(0, Math.min(1, gy - y0));

        const top = (1 - fx) * bgGrid[y0][x0] + fx * bgGrid[y0][x1];
        const bottom = (1 - fx) * bgGrid[y1][x0] + fx * bgGrid[y1][x1];
        return (1 - fy) * top + fy * bottom;
      };

      // Sensitivity tuning:
      // threshold: 10 (light) to 90 (deep clean)
      // Cutoff: higher threshold = lower cutoff = more aggressive paper removal
      const contrastCutoff = Math.max(10, 36 - (threshold / 100) * 22);

      let minX = w;
      let minY = h;
      let maxX = 0;
      let maxY = 0;
      let hasInk = false;

      // First pass: mark ink vs paper and compute bounding box
      const isInkMap = new Uint8Array(w * h);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const localBg = getLocalBgLum(x, y);
          const contrast = localBg - lum;

          if (contrast >= contrastCutoff) {
            isInkMap[y * w + x] = 1;
            hasInk = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // Second pass: apply despeckle noise removal & render
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const pixelIdx = y * w + x;
          const isInk = isInkMap[pixelIdx] === 1;

          // Check if isolated single pixel noise
          let neighborInkCount = 0;
          if (isInk && x > 0 && x < w - 1 && y > 0 && y < h - 1) {
            if (isInkMap[pixelIdx - 1]) neighborInkCount++;
            if (isInkMap[pixelIdx + 1]) neighborInkCount++;
            if (isInkMap[pixelIdx - w]) neighborInkCount++;
            if (isInkMap[pixelIdx + w]) neighborInkCount++;
          }

          if (!isInk || (isInk && neighborInkCount === 0 && threshold > 45)) {
            // 100% Background - clean paper
            if (bgMode === 'white') {
              data[idx] = 255;
              data[idx + 1] = 255;
              data[idx + 2] = 255;
              data[idx + 3] = 255;
            } else {
              // 100% transparent - zero paper residue!
              data[idx] = 0;
              data[idx + 1] = 0;
              data[idx + 2] = 0;
              data[idx + 3] = 0;
            }
          } else {
            // Ink stroke pixel
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            const localBg = getLocalBgLum(x, y);
            const contrast = localBg - lum;

            // Smooth stroke anti-aliasing factor
            const strength = Math.min(1.0, Math.max(0.2, (contrast - contrastCutoff + 12) / 30));

            if (inkColor === 'blue') {
              // Fountain pen rich royal blue #1e3a8a
              if (bgMode === 'white') {
                data[idx] = Math.round(255 - (255 - 30) * strength);
                data[idx + 1] = Math.round(255 - (255 - 58) * strength);
                data[idx + 2] = Math.round(255 - (255 - 138) * strength);
                data[idx + 3] = 255;
              } else {
                data[idx] = 30;
                data[idx + 1] = 58;
                data[idx + 2] = 138;
                data[idx + 3] = Math.min(255, Math.round(255 * strength));
              }
            } else if (inkColor === 'black') {
              // Deep dark pen black #0f172a
              if (bgMode === 'white') {
                data[idx] = Math.round(255 - (255 - 15) * strength);
                data[idx + 1] = Math.round(255 - (255 - 23) * strength);
                data[idx + 2] = Math.round(255 - (255 - 42) * strength);
                data[idx + 3] = 255;
              } else {
                data[idx] = 15;
                data[idx + 1] = 23;
                data[idx + 2] = 42;
                data[idx + 3] = Math.min(255, Math.round(255 * strength));
              }
            } else {
              // Original ink color with boosted contrast
              if (bgMode === 'white') {
                data[idx] = Math.round(255 - (255 - r) * strength);
                data[idx + 1] = Math.round(255 - (255 - g) * strength);
                data[idx + 2] = Math.round(255 - (255 - b) * strength);
                data[idx + 3] = 255;
              } else {
                data[idx] = Math.min(255, Math.max(0, r - 30));
                data[idx + 1] = Math.min(255, Math.max(0, g - 30));
                data[idx + 2] = Math.min(255, Math.max(0, b - 30));
                data[idx + 3] = Math.min(255, Math.round(255 * strength));
              }
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Auto-crop to bounding box with padding
      if (autoCrop && hasInk && minX < maxX && minY < maxY) {
        const padding = 14;
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropW = Math.min(w - cropX, maxX - minX + padding * 2);
        const cropH = Math.min(h - cropY, maxY - minY + padding * 2);

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropW;
        cropCanvas.height = cropH;
        const cropCtx = cropCanvas.getContext('2d');
        if (cropCtx) {
          cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          return resolve(cropCanvas.toDataURL('image/png'));
        }
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => {
      console.warn('Error processing signature background removal:', e);
      resolve(imageSource);
    };
    img.src = imageSource;
  });
}

/**
 * Merges Alien Registration Card Front and Back onto a single page (A4 proportion, 1200 x 1700 px).
 */
export function mergeArcFrontAndBack(
  frontDataUrl: string,
  backDataUrl: string,
  applicantName: string = ''
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1697; // A4 standard ratio
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return reject(new Error('Cannot create canvas context'));
    }

    // White A4 background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title Header
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 36px "Noto Serif KR", serif, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('외국인등록증 사본 (앞면 / 뒷면)', canvas.width / 2, 80);

    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(
      `ALIEN REGISTRATION CARD COPY (FRONT & BACK) — ${applicantName || '신청인'}`,
      canvas.width / 2,
      120
    );

    // Subtle divider
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 145);
    ctx.lineTo(canvas.width - 80, 145);
    ctx.stroke();

    const loadImg = (url: string): Promise<HTMLImageElement> => {
      return new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = url;
      });
    };

    Promise.all([loadImg(frontDataUrl), loadImg(backDataUrl)])
      .then(([frontImg, backImg]) => {
        const cardWidth = 900;
        const cardHeight = 560;
        const cardX = (canvas.width - cardWidth) / 2;

        // Front Card Section
        ctx.fillStyle = '#0f766e';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('■ 앞 면 (Front Side)', cardX, 200);

        // Draw shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 6;
        ctx.drawImage(frontImg, cardX, 220, cardWidth, cardHeight);

        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Back Card Section
        ctx.fillStyle = '#0f766e';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('■ 뒷 면 (Back Side / 체류지 변경기록)', cardX, 850);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 6;
        ctx.drawImage(backImg, cardX, 870, cardWidth, cardHeight);

        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Footer note
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          '※ 본 사본은 법무부 사회통합프로그램(KIIP) 연계 신청용으로 제출되는 공식 서류 사본입니다.',
          canvas.width / 2,
          1560
        );

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      })
      .catch((err) => {
        console.error('Error drawing ARC merged canvas:', err);
        resolve(frontDataUrl);
      });
  });
}
