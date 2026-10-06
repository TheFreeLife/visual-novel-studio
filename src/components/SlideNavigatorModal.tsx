import React, { useState } from 'react';
import { NovelProject } from '../types/novel';
import { PRESET_BACKGROUNDS, getCharacterAvatarUrl, DEFAULT_AVATAR_IMAGES } from '../data/presetAssets';
import { 
  X, 
  Search, 
  Plus, 
  Copy, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Play,
  Layers,
  Users
} from 'lucide-react';

interface SlideNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
  currentSceneIndex: number;
  onSelectScene: (sceneIndex: number, lineIndex: number) => void;
  onAddScene: (afterIndex?: number) => void;
  onDuplicateScene: (index: number) => void;
  onDeleteScene: (index: number) => void;
  onMoveScene: (fromIndex: number, toIndex: number) => void;
}

export const SlideNavigatorModal: React.FC<SlideNavigatorModalProps> = ({
  isOpen,
  onClose,
  project,
  currentSceneIndex,
  onSelectScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onMoveScene,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const charMap = new Map(project.characters.map((c) => [c.id, c]));

  const filteredScenes = project.scenes.map((scene, originalIndex) => ({
    scene,
    originalIndex,
  })).filter(({ scene }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = scene.title?.toLowerCase().includes(q);
    const lineMatch = scene.lines.some((l) => l.text.toLowerCase().includes(q));
    const castMatch = scene.castCharacterIds?.some((id) => charMap.get(id)?.name.toLowerCase().includes(q));
    return titleMatch || lineMatch || castMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                장면 슬라이드 네비게이터 (PPT 뷰)
                <span className="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-800 rounded-full">
                  총 {project.scenes.length}개 장면
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                원하는 장면을 클릭하면 해당 장면과 배경으로 즉시 전환됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="장면, 대사, 인물 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => onAddScene(currentSceneIndex)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 장면 추가</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scene Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredScenes.map(({ scene, originalIndex }) => {
            const isCurrent = originalIndex === currentSceneIndex;
            const bgPreset = PRESET_BACKGROUNDS.find((b) => b.id === scene.background.value);
            const firstLine = scene.lines[0]?.text || '(대사 없음)';

            return (
              <div
                key={scene.id}
                onClick={() => {
                  onSelectScene(originalIndex, 0);
                  onClose();
                }}
                className={`group relative flex flex-col bg-slate-800/90 rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  isCurrent 
                    ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                {/* Thumbnail Header: Rectangular Background Box */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-700/60 p-2">
                  <div className="w-full h-full border border-dashed border-slate-600/80 rounded-lg flex flex-col items-center justify-center bg-slate-900/80 p-2 text-center">
                    <span className="text-base mb-0.5">🖼️</span>
                    <span className="text-[11px] text-blue-300 font-bold truncate max-w-[90%]">
                      {bgPreset?.name || scene.background.value}
                    </span>
                    <span className="text-[9px] text-slate-500">배경 영역</span>
                  </div>

                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[11px] font-mono font-bold text-white border border-white/10">
                    SCENE #{originalIndex + 1}
                  </div>

                  {isCurrent && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-blue-500 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>현재 씬</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-slate-300">
                    대사 {scene.lines.length}줄
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-3 flex-1 flex flex-col justify-between bg-slate-800/90">
                  <div>
                    <h3 className="text-xs font-bold text-white mb-1 truncate">
                      {scene.title || `장면 ${originalIndex + 1}`}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2 truncate">
                      <Users className="w-3 h-3 text-blue-400 shrink-0" />
                      {scene.castCharacterIds && scene.castCharacterIds.length > 0 ? (
                        <div className="flex items-center -space-x-1 shrink-0">
                          {scene.castCharacterIds.slice(0, 4).map((id) => {
                            const c = charMap.get(id);
                            if (!c) return null;
                            return (
                              <div
                                key={id}
                                style={{ borderColor: c.color }}
                                className="w-4 h-4 rounded-full overflow-hidden border bg-slate-950 shrink-0"
                                title={c.name}
                              >
                                <img
                                  src={getCharacterAvatarUrl(c)}
                                  alt={c.name}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = (c.gender === 'female' ? DEFAULT_AVATAR_IMAGES.female : DEFAULT_AVATAR_IMAGES.male);
                                  }}
                                  className="w-full h-full object-cover object-top"
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                      <span className="truncate">
                        {scene.castCharacterIds?.map((id) => charMap.get(id)?.name).filter(Boolean).join(', ') || '인물 없음'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed italic bg-slate-900/60 p-1.5 rounded">
                      "{firstLine}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-slate-400"
                  >
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onMoveScene(originalIndex, originalIndex - 1)}
                        disabled={originalIndex === 0}
                        title="앞으로 이동"
                        className="p-1 hover:text-white hover:bg-slate-700 disabled:opacity-20 rounded"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMoveScene(originalIndex, originalIndex + 1)}
                        disabled={originalIndex === project.scenes.length - 1}
                        title="뒤로 이동"
                        className="p-1 hover:text-white hover:bg-slate-700 disabled:opacity-20 rounded"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDuplicateScene(originalIndex)}
                        title="장면 복제"
                        className="p-1 hover:text-white hover:bg-slate-700 rounded"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteScene(originalIndex)}
                        disabled={project.scenes.length <= 1}
                        title="장면 삭제"
                        className="p-1 hover:text-rose-400 hover:bg-slate-700 disabled:opacity-20 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div>
            클릭하여 원하는 장면으로 즉시 이동하세요.
          </div>
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
