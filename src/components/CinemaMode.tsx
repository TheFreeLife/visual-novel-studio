import React, { useEffect } from 'react';
import { NovelProject } from '../types/novel';
import { NovelStage } from './NovelStage';
import { Minimize2 } from 'lucide-react';

interface CinemaModeProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
  currentSceneIndex: number;
  currentLineIndex: number;
  onNavigate: (sceneIndex: number, lineIndex: number) => void;
  onOpenSlideNavigator: () => void;
  onOpenBacklog: () => void;
}

export const CinemaMode: React.FC<CinemaModeProps> = ({
  isOpen,
  onClose,
  project,
  currentSceneIndex,
  currentLineIndex,
  onNavigate,
  onOpenSlideNavigator,
  onOpenBacklog,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      {/* Top Floating Exit Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md text-xs font-semibold shadow-lg transition-all"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>에디터로 복귀 (ESC)</span>
        </button>
      </div>

      {/* Main Stage */}
      <div className="w-full h-full flex items-center justify-center">
        <NovelStage
          project={project}
          currentSceneIndex={currentSceneIndex}
          currentLineIndex={currentLineIndex}
          onNavigate={onNavigate}
          onOpenSlideNavigator={onOpenSlideNavigator}
          onOpenBacklog={onOpenBacklog}
          onToggleCinemaMode={onClose}
          isCinemaMode={true}
        />
      </div>
    </div>
  );
};
