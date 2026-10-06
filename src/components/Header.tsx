import React, { useRef } from 'react';
import { NovelProject } from '../types/novel';
import { 
  Play, 
  Layers, 
  FileText, 
  FileDown, 
  Download, 
  Upload, 
  Sliders, 
  RotateCcw, 
  Check, 
  Sparkles,
  BookOpen,
  ScrollText
} from 'lucide-react';

interface HeaderProps {
  project: NovelProject;
  onUpdateTitle: (title: string) => void;
  onPlayCinema: () => void;
  onOpenSlideNavigator: () => void;
  onOpenBacklog: () => void;
  onOpenScriptImport: () => void;
  onOpenTxtExport: () => void;
  onOpenPdfExport: () => void;
  onOpenSettings: () => void;
  onExportJson: () => void;
  onImportJson: (project: NovelProject) => void;
  onResetSample: () => void;
  isAutoSaved: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateTitle,
  onPlayCinema,
  onOpenSlideNavigator,
  onOpenBacklog,
  onOpenScriptImport,
  onOpenTxtExport,
  onOpenPdfExport,
  onOpenSettings,
  onExportJson,
  onImportJson,
  onResetSample,
  isAutoSaved,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.scenes && Array.isArray(parsed.scenes)) {
          onImportJson(parsed);
        } else {
          alert('올바른 NovelStudio JSON 형식이 아닙니다.');
        }
      } catch (err) {
        alert('JSON 파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Project Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white hidden sm:inline">
            Novel<span className="text-blue-400">Studio</span>
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Editable Title */}
        <input
          type="text"
          value={project.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="작품 제목을 입력하세요"
          className="text-xs sm:text-sm font-bold text-slate-200 bg-transparent hover:bg-slate-900 focus:bg-slate-900 border border-transparent hover:border-slate-800 focus:border-blue-500 rounded px-2 py-1 max-w-[140px] sm:max-w-[220px] md:max-w-[280px] truncate transition-colors focus:outline-none"
        />

        {/* Auto save indicator */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>IndexedDB 자동저장됨</span>
        </div>
      </div>

      {/* Main Play Action & Navigation */}
      <div className="flex items-center gap-2">
        {/* Play Story (Cinema Mode) */}
        <button
          onClick={onPlayCinema}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-lg shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          title="스토리 전체화면 실행 (비주얼 노벨 모드)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>스토리 실행</span>
        </button>

        {/* Slide Sorter (PPT View) */}
        <button
          onClick={onOpenSlideNavigator}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
          title="특정 장면 이동 / 슬라이드 목록 (PPT처럼 이동)"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">장면 슬라이드</span>
        </button>

        {/* Backlog */}
        <button
          onClick={onOpenBacklog}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
          title="대사 기록 확인"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">대사 로그</span>
        </button>

        <div className="h-4 w-px bg-slate-800" />

        {/* Batch script text parser */}
        <button
          onClick={onOpenScriptImport}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="대본 텍스트 일괄 작성 및 불러오기"
        >
          <FileText className="w-4 h-4 text-indigo-400" />
        </button>

        {/* TXT Script Export */}
        <button
          onClick={onOpenTxtExport}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="대본 텍스트(.txt) 파일로 내보내기"
        >
          <ScrollText className="w-4 h-4 text-amber-400" />
        </button>

        {/* PDF Export */}
        <button
          onClick={onOpenPdfExport}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="스토리보드 PDF 내보내기"
        >
          <FileDown className="w-4 h-4 text-rose-400" />
        </button>

        {/* JSON Export */}
        <button
          onClick={onExportJson}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="전체 스토리 JSON 파일 저장"
        >
          <Download className="w-4 h-4 text-emerald-400" />
        </button>

        {/* JSON Import */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="스토리 JSON 파일 불러오기"
        >
          <Upload className="w-4 h-4 text-cyan-400" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="스토리 실행 및 오디오 설정"
        >
          <Sliders className="w-4 h-4 text-slate-300" />
        </button>

        {/* Sample Reset */}
        <button
          onClick={onResetSample}
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="기본 샘플 스토리 다시 불러오기"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
