import React, { useState, useMemo } from 'react';
import { NovelProject } from '../types/novel';
import { exportProjectToNovelScriptTxt, downloadNovelScriptTxt } from '../services/scriptParser';
import { X, ScrollText, Download, Copy, Check, FileText } from 'lucide-react';

interface TxtExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
}

export const TxtExportModal: React.FC<TxtExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [includeSceneHeaders, setIncludeSceneHeaders] = useState(false);
  const [copied, setCopied] = useState(false);

  // 실시간으로 변환된 대본 TXT 텍스트 생성
  const scriptText = useMemo(() => {
    return exportProjectToNovelScriptTxt(project.scenes, project.characters, {
      includeSceneHeaders,
    });
  }, [project.scenes, project.characters, includeSceneHeaders]);

  const totalLines = useMemo(() => {
    return project.scenes.reduce((acc, s) => acc + (s.lines?.length || 0), 0);
  }, [project.scenes]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!scriptText) return;
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadNovelScriptTxt(
      project.title,
      project.scenes,
      project.characters,
      { includeSceneHeaders }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">대본 텍스트(.txt) 내보내기</h2>
              <p className="text-xs text-slate-400">
                소설 및 시나리오 표준 양식으로 서식화된 순수 텍스트 파일입니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info & Options Bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Format Guide Badge */}
          <div className="flex flex-wrap items-center gap-2 text-slate-400">
            <span className="text-slate-300 font-semibold">템플릿 규칙:</span>
            <span className="bg-slate-800/80 px-2 py-0.5 rounded text-blue-400 font-mono">이름: "대사"</span>
            <span className="bg-slate-800/80 px-2 py-0.5 rounded text-amber-400 font-mono">이름: '생각'</span>
            <span className="bg-slate-800/80 px-2 py-0.5 rounded text-emerald-400 font-mono">[상황]: 나레이션</span>
            <span className="bg-slate-800/80 px-2 py-0.5 rounded text-purple-400 font-mono">씬 전환: ***</span>
          </div>

          {/* Scene Header Toggle */}
          {project.scenes.length > 1 && (
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none hover:text-white">
              <input
                type="checkbox"
                checked={includeSceneHeaders}
                onChange={(e) => setIncludeSceneHeaders(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
              />
              <span className="text-xs">장면 제목 헤더 포함</span>
            </label>
          )}
        </div>

        {/* Content Preview */}
        <div className="p-6 flex-1 flex flex-col min-h-0 space-y-2.5 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">원고 미리보기</span>
              <span>•</span>
              <span className="text-blue-400 font-medium">{project.scenes.length}개 장면</span>
              <span>•</span>
              <span className="text-slate-300">총 {totalLines}개 문장</span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">대사 속 괄호 (...)는 작은따옴표 '...' 생각으로 자동 분할됩니다</span>
          </div>

          <div className="relative flex-1 w-full min-h-0">
            <textarea
              readOnly
              value={scriptText}
              placeholder="내보낼 대본 내용이 없습니다."
              className="w-full h-full p-5 sm:p-6 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs sm:text-sm leading-relaxed sm:leading-loose resize-none focus:outline-none focus:border-slate-600 select-all overflow-y-auto shadow-inner"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            닫기
          </button>

          <div className="flex items-center gap-2.5">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>전체 복사</span>
                </>
              )}
            </button>

            {/* Download TXT Button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>.txt 파일로 다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
