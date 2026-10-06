import React from 'react';
import { NovelProject } from '../types/novel';
import { exportProjectToPdf, printStoryboard } from '../services/pdf';
import { X, FileDown, Printer, CheckCircle2, BookOpen } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">시나리오 스토리보드 PDF 내보내기</h2>
              <p className="text-xs text-slate-400">대본 및 장면 연출 정보를 문서로 출력합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">프로젝트명:</span>
              <span className="font-bold text-white truncate max-w-[200px]">{project.title}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">총 장면 수:</span>
              <span className="font-bold text-blue-400">{project.scenes.length}개 씬</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">등장인물:</span>
              <span className="text-slate-300">{project.characters.map((c) => c.name).join(', ')}</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Direct PDF Download */}
            <button
              onClick={() => {
                exportProjectToPdf(project);
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileDown className="w-5 h-5 text-blue-200 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div>PDF 파일로 즉시 다운로드 (.pdf)</div>
                  <div className="text-[11px] text-blue-200 font-normal">A4 규격 스토리보드 문서 파일 생성</div>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-blue-200 opacity-60" />
            </button>

            {/* Print / Save as PDF */}
            <button
              onClick={() => {
                printStoryboard(project);
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl font-semibold text-xs transition-all group"
            >
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div>브라우저 인쇄 &amp; PDF 저장</div>
                  <div className="text-[11px] text-slate-400 font-normal">글꼴이 보존되는 고해상도 인쇄 뷰어 실행</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
