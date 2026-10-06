import React, { useRef, useEffect } from 'react';
import { NovelProject } from '../types/novel';
import { X, BookOpen } from 'lucide-react';

interface BacklogModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
  currentSceneIndex: number;
  currentLineIndex: number;
  onJumpToLine: (sceneIndex: number, lineIndex: number) => void;
}

export const BacklogModal: React.FC<BacklogModalProps> = ({
  isOpen,
  onClose,
  project,
  currentSceneIndex,
  currentLineIndex,
  onJumpToLine,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const charMap = new Map(project.characters.map((c) => [c.id, c]));

  // Build flattened history up to current scene & current line
  const historyItems: Array<{
    sceneIndex: number;
    sceneTitle: string;
    lineIndex: number;
    speakerId: string | null;
    speakerName: string;
    speakerColor?: string;
    text: string;
    isCurrent: boolean;
  }> = [];

  project.scenes.forEach((scene, sIdx) => {
    if (sIdx > currentSceneIndex) return;

    scene.lines.forEach((line, lIdx) => {
      if (sIdx === currentSceneIndex && lIdx > currentLineIndex) return;

      const speakerChar = line.speakerId ? charMap.get(line.speakerId) : null;
      const isCurrent = sIdx === currentSceneIndex && lIdx === currentLineIndex;

      historyItems.push({
        sceneIndex: sIdx,
        sceneTitle: scene.title || `장면 ${sIdx + 1}`,
        lineIndex: lIdx,
        speakerId: line.speakerId,
        speakerName: speakerChar ? speakerChar.name : (line.speakerCustomName || '나레이션'),
        speakerColor: speakerChar?.color,
        text: line.text,
        isCurrent
      });
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">대사 로그 기록 (Backlog)</h2>
              <p className="text-xs text-slate-400">지금까지 진행된 스토리 대사를 다시 확인합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3">
          {historyItems.map((item, idx) => {
            const isNarration = !item.speakerId;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.isCurrent
                    ? 'bg-blue-950/30 border-blue-500/50 shadow-sm ring-1 ring-blue-500/30'
                    : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                      {item.sceneTitle} #{item.lineIndex + 1}
                    </span>
                    <span 
                      style={{ color: item.speakerColor || (isNarration ? '#94a3b8' : '#38bdf8') }}
                      className="text-xs font-bold"
                    >
                      {item.speakerName}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onJumpToLine(item.sceneIndex, item.lineIndex);
                      onClose();
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium hover:underline"
                  >
                    이 대사로 가기
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {item.text || <span className="text-slate-500 italic">(대사 없음)</span>}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>총 {historyItems.length}줄의 대사 기록</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
