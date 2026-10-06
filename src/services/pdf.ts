import jsPDF from 'jspdf';
import { NovelProject } from '../types/novel';

export function exportProjectToPdf(project: NovelProject): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Header / Title Page banner
  doc.setFillColor(15, 23, 42); // dark slate
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(project.title || '비주얼 노벨 시나리오 대본', margin, 20);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  const totalLines = project.scenes.reduce((acc, s) => acc + s.lines.length, 0);
  const subtitle = `작성자: ${project.author || '감독'} | 총 장면: ${project.scenes.length}개 | 총 대사: ${totalLines}줄 | 생성일: ${new Date(project.updatedAt).toLocaleDateString('ko-KR')}`;
  doc.text(subtitle, margin, 32);

  y = 50;

  const charMap = new Map(project.characters.map((c) => [c.id, c.name]));

  project.scenes.forEach((scene, sIdx) => {
    // Check page overflow for scene header
    if (y + 35 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    // Scene Header
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`[SCENE ${sIdx + 1}] ${scene.title || '장면'}`, margin + 4, y + 8);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const castNames = scene.castCharacterIds.map((id) => charMap.get(id) || id).join(', ') || '없음';
    doc.text(`배경: ${scene.background.value} | 등장: ${castNames}`, pageWidth - margin - 65, y + 8);

    y += 16;

    // Dialogue Lines in this scene
    scene.lines.forEach((line, lIdx) => {
      if (y + 24 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      const speakerName = line.speakerId ? (charMap.get(line.speakerId) || line.speakerCustomName || '캐릭터') : '나레이션';
      const isNarration = !line.speakerId;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'S');

      // Speaker & line #
      doc.setFontSize(9);
      doc.setTextColor(isNarration ? 100 : 37, isNarration ? 116 : 99, isNarration ? 139 : 235);
      doc.text(`${lIdx + 1}. [ ${speakerName} ]`, margin + 4, y + 6);

      // Dialog text
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      const splitText = doc.splitTextToSize(line.text || '(대사 없음)', contentWidth - 10);
      doc.text(splitText.slice(0, 2), margin + 4, y + 13);

      y += 23;
    });

    y += 6; // gap between scenes
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`NovelStudio Visual Novel Screenplay - Page ${i} / ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  const filename = `${project.title.replace(/\s+/g, '_') || 'storyboard'}.pdf`;
  doc.save(filename);
}

export function printStoryboard(project: NovelProject): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const charMap = new Map(project.characters.map((c) => [c.id, c.name]));

  const html = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>${project.title} - 스토리보드 & 대본</title>
      <style>
        body { font-family: 'Noto Sans KR', sans-serif; padding: 24px; color: #1e293b; line-height: 1.6; }
        .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; }
        .title { font-size: 24px; font-weight: bold; margin: 0; }
        .meta { font-size: 13px; color: #64748b; margin-top: 6px; }
        .scene-block { margin-bottom: 24px; page-break-inside: avoid; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
        .scene-header { background: #0f172a; color: white; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; }
        .line-card { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; background: #fff; }
        .line-card:last-child { border-bottom: none; }
        .speaker { font-weight: bold; color: #2563eb; font-size: 14px; margin-bottom: 4px; }
        .dialog { font-size: 14px; color: #0f172a; white-space: pre-wrap; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${project.title}</h1>
        <div class="meta">작가: ${project.author || '감독'} | 총 ${project.scenes.length}개 장면 | ${new Date().toLocaleDateString('ko-KR')} 출력</div>
      </div>
      ${project.scenes.map((scene, sIdx) => `
        <div class="scene-block">
          <div class="scene-header">
            <div><strong>SCENE ${sIdx + 1}: ${scene.title}</strong></div>
            <div style="font-size: 12px; color: #94a3b8;">배경: ${scene.background.value} | 등장: ${scene.castCharacterIds.map((id) => charMap.get(id)).filter(Boolean).join(', ')}</div>
          </div>
          ${scene.lines.map((line, lIdx) => `
            <div class="line-card">
              <div class="speaker">${lIdx + 1}. [ ${line.speakerId ? (charMap.get(line.speakerId) || '캐릭터') : '나레이션'} ]</div>
              <div class="dialog">${line.text}</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 350);
}
