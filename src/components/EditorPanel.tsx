import React, { useState } from 'react';
import { 
  NovelProject, 
  Scene, 
  DialogLine, 
  Character, 
  CharacterExpression, 
  CharacterEffect,
  BackgroundFilter,
  TransitionType,
  SoundEffectType,
  FontFamilyType,
  BoxThemeType,
  FontSizeOption,
  BoxPosition,
  NameBadgeStyle,
  NarrationCharacterVisibility
} from '../types/novel';
import { PRESET_BACKGROUNDS, generateCharacterAvatar, getCharacterAvatarUrl, DEFAULT_AVATAR_IMAGES } from '../data/presetAssets';
import { 
  Layers, 
  MessageSquare, 
  Users, 
  Palette, 
  Plus, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  UserPlus, 
  Star, 
  Check,
  CheckSquare, 
  Square, 
  ArrowRight, 
  Play, 
  Camera, 
  Activity, 
  Clapperboard,
  Eye,
  EyeOff
} from 'lucide-react';

interface EditorPanelProps {
  project: NovelProject;
  currentSceneIndex: number;
  currentLineIndex: number;
  onNavigate: (sceneIndex: number, lineIndex: number) => void;
  onUpdateScene: (sceneIndex: number, updatedScene: Scene) => void;
  onAddScene: (afterIndex?: number) => void;
  onDuplicateScene: (sceneIndex: number) => void;
  onDeleteScene: (sceneIndex: number) => void;
  onMoveScene: (fromIndex: number, toIndex: number) => void;
  onUpdateCharacters: (characters: Character[]) => void;
  onUpdateStyle: (style: NovelProject['style']) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  project,
  currentSceneIndex,
  currentLineIndex,
  onNavigate,
  onUpdateScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onMoveScene,
  onUpdateCharacters,
  onUpdateStyle,
}) => {
  // Tabs: 'scene-detail' (edit current scene & lines), 'scene-list' (list of all scenes), 'characters' (character creation), 'style' (textbox design)
  const [activeTab, setActiveTab] = useState<'scene-detail' | 'scene-list' | 'characters' | 'style'>('scene-detail');

  const currentScene: Scene | undefined = project.scenes[currentSceneIndex] || project.scenes[0];
  const lines = currentScene?.lines || [];

  // Characters checked in the current scene
  const activeCastCharacters = project.characters.filter((c) =>
    currentScene?.castCharacterIds?.includes(c.id)
  );

  // Helper to mutate current scene
  const updateCurrentScene = (partial: Partial<Scene>) => {
    if (!currentScene) return;
    onUpdateScene(currentSceneIndex, { ...currentScene, ...partial });
  };

  // Toggle character checkbox in scene cast
  const handleToggleCast = (charId: string) => {
    if (!currentScene) return;
    const currentCast = currentScene.castCharacterIds || [];
    let updatedCast: string[];
    if (currentCast.includes(charId)) {
      updatedCast = currentCast.filter((id) => id !== charId);
    } else {
      updatedCast = [...currentCast, charId];
    }
    updateCurrentScene({ castCharacterIds: updatedCast });
  };

  // Add new dialog line to current scene
  const handleAddLine = (afterIndex?: number) => {
    if (!currentScene) return;
    const insertIdx = afterIndex !== undefined ? afterIndex + 1 : lines.length;
    const defaultSpeaker = currentScene.castCharacterIds[0] || null;

    const newLine: DialogLine = {
      id: `line_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      speakerId: defaultSpeaker,
      text: '새로운 대사를 입력하세요.',
      speakerExpression: 'neutral'
    };

    const newLines = [...lines];
    newLines.splice(insertIdx, 0, newLine);
    updateCurrentScene({ lines: newLines });
    onNavigate(currentSceneIndex, insertIdx);
  };

  // Update specific line in current scene
  const handleUpdateLine = (lineIdx: number, partial: Partial<DialogLine>) => {
    if (!currentScene) return;
    const newLines = [...lines];
    newLines[lineIdx] = { ...newLines[lineIdx], ...partial };
    updateCurrentScene({ lines: newLines });
  };

  // Duplicate line
  const handleDuplicateLine = (lineIdx: number) => {
    if (!currentScene) return;
    const source = lines[lineIdx];
    if (!source) return;

    const duplicated: DialogLine = {
      ...JSON.parse(JSON.stringify(source)),
      id: `line_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };

    const newLines = [...lines];
    newLines.splice(lineIdx + 1, 0, duplicated);
    updateCurrentScene({ lines: newLines });
    onNavigate(currentSceneIndex, lineIdx + 1);
  };

  // Delete line
  const handleDeleteLine = (lineIdx: number) => {
    if (!currentScene || lines.length <= 1) return;
    const newLines = lines.filter((_, idx) => idx !== lineIdx);
    updateCurrentScene({ lines: newLines });
    if (currentLineIndex >= newLines.length) {
      onNavigate(currentSceneIndex, Math.max(0, newLines.length - 1));
    }
  };

  // Move line
  const handleMoveLine = (fromIdx: number, toIdx: number) => {
    if (!currentScene || toIdx < 0 || toIdx >= lines.length) return;
    const newLines = [...lines];
    const [moved] = newLines.splice(fromIdx, 1);
    newLines.splice(toIdx, 0, moved);
    updateCurrentScene({ lines: newLines });
    onNavigate(currentSceneIndex, toIdx);
  };

  // Upload custom background
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateCurrentScene({
          background: {
            type: 'custom',
            value: reader.result,
            filter: 'none'
          }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Add new global character
  const handleAddNewCharacter = () => {
    const newId = `char_${Date.now()}`;
    const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    const assignedColor = colors[project.characters.length % colors.length];

    const newChar: Character = {
      id: newId,
      name: `새 인물 ${project.characters.length + 1}`,
      color: assignedColor,
      isProtagonist: false,
      gender: 'female',
      defaultPosition: 'right',
      avatarUrl: '',
    };

    onUpdateCharacters([...project.characters, newChar]);
  };

  // Upload character avatar image file
  const handleCharacterImageUpload = (charId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const updated = project.characters.map((c) =>
          c.id === charId ? { ...c, avatarUrl: reader.result as string } : c
        );
        onUpdateCharacters(updated);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove character image (reverts to wireframe box)
  const handleRemoveCharacterImage = (charId: string) => {
    const updated = project.characters.map((c) =>
      c.id === charId ? { ...c, avatarUrl: '' } : c
    );
    onUpdateCharacters(updated);
  };

  // Input character image URL
  const handlePromptImageUrl = (charId: string) => {
    const url = window.prompt('캐릭터 이미지 웹 URL을 입력하세요 (https://...):');
    if (url && url.trim()) {
      const updated = project.characters.map((c) =>
        c.id === charId ? { ...c, avatarUrl: url.trim() } : c
      );
      onUpdateCharacters(updated);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 select-none overflow-hidden">
      {/* Top Tab Bar */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/80 px-2 pt-2">
        <button
          onClick={() => setActiveTab('scene-detail')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === 'scene-detail'
              ? 'bg-slate-900 text-blue-400 border-blue-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>장면 &amp; 대사 편집</span>
        </button>

        <button
          onClick={() => setActiveTab('scene-list')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === 'scene-list'
              ? 'bg-slate-900 text-blue-400 border-blue-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>장면 목록 ({project.scenes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('characters')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === 'characters'
              ? 'bg-slate-900 text-blue-400 border-blue-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>등장인물 ({project.characters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === 'style'
              ? 'bg-slate-900 text-blue-400 border-blue-500 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>스타일</span>
        </button>
      </div>

      {/* Tab 1: Current Scene & Dialog Lines */}
      {activeTab === 'scene-detail' && currentScene && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Scene Header & Title */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-400 font-mono text-xs font-bold border border-blue-500/30">
                  SCENE {currentSceneIndex + 1}
                </span>
                <input
                  type="text"
                  placeholder="장면 제목 (예: 노을빛 옥상)"
                  value={currentScene.title || ''}
                  onChange={(e) => updateCurrentScene({ title: e.target.value })}
                  className="text-xs font-bold bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44 sm:w-56"
                />
              </div>

              <button
                onClick={() => setActiveTab('scene-list')}
                className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1"
                title="다른 장면 선택하기"
              >
                <span>장면 목록</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Scene Cast Checkboxes */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  이 장면에 등장할 인물 선택 (체크박스)
                </span>
                <span className="text-[11px] font-normal text-slate-500">체크된 인물이 무대에 배치됩니다</span>
              </label>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {project.characters.map((char) => {
                  const isChecked = currentScene.castCharacterIds?.includes(char.id);
                  return (
                    <button
                      key={char.id}
                      onClick={() => handleToggleCast(char.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                        isChecked
                          ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      {/* Character In-game Style Avatar Thumbnail */}
                      <div 
                        style={{ borderColor: isChecked ? char.color : '#334155' }}
                        className="w-7 h-7 rounded-lg overflow-hidden border shrink-0 bg-slate-950 relative"
                      >
                        <img 
                          src={getCharacterAvatarUrl(char)} 
                          alt={char.name} 
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = (char.gender === 'female' ? DEFAULT_AVATAR_IMAGES.female : DEFAULT_AVATAR_IMAGES.male);
                          }}
                          className="w-full h-full object-cover object-top" 
                        />
                        <div 
                          style={{ backgroundColor: `${char.color}15` }} 
                          className="absolute inset-0 pointer-events-none" 
                        />
                      </div>
                      <span className="text-xs font-semibold truncate">{char.name}</span>
                      {char.isProtagonist && (
                        <span className="text-[9px] bg-blue-500/30 text-blue-300 px-1 rounded ml-auto">주인공</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Automatic Position Rule Guidance */}
              <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 flex items-start gap-1.5 leading-relaxed">
                <span className="text-blue-400 font-bold shrink-0">💡 무대 연출 규칙:</span>
                <span>무대에는 <strong>최대 2명만 좌/우에 배치</strong>되며, 대화 중 제3의 인물이 대사를 말하면 <strong>가장 오래전에 말했던 인물의 자리</strong>에 새 발화자가 교체되어 들어옵니다.</span>
              </div>
            </div>

            {/* Scene Background Picker */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>장면 배경 (배경 전환 기준)</span>
                </label>

                <label className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer bg-slate-900 hover:bg-slate-850 px-2 py-0.5 rounded border border-slate-700/60">
                  <Upload className="w-3 h-3" />
                  <span>배경 이미지 업로드</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Custom uploaded background active status */}
              {currentScene.background.type === 'custom' && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-950/40 border border-blue-500/40 text-xs">
                  <div className="w-14 h-9 rounded overflow-hidden shrink-0 border border-blue-400/50 bg-black">
                    <img src={currentScene.background.value} alt="Custom" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-300 font-bold truncate">사용자 직접 업로드 배경 적용 중</p>
                    <p className="text-[10px] text-slate-400">아래 프리셋을 클릭하면 기본 제공 배경으로 변경됩니다.</p>
                  </div>
                </div>
              )}

              {/* Background presets grid with 16:9 visual previews */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_BACKGROUNDS.map((bg) => {
                  const isSelected = currentScene.background.type === 'preset' && currentScene.background.value === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => updateCurrentScene({ background: { type: 'preset', value: bg.id, filter: currentScene.background.filter } })}
                      className={`group relative text-left rounded-lg overflow-hidden border p-1 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600/15 ring-2 ring-blue-500 shadow-md'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-850'
                      }`}
                    >
                      {/* 16:9 Image Preview */}
                      <div className="relative aspect-video w-full rounded overflow-hidden bg-slate-950">
                        <img 
                          src={bg.image} 
                          alt={bg.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Category tag */}
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 backdrop-blur-sm text-slate-200">
                          {bg.category}
                        </span>
                        {/* Selected Check Badge */}
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg ring-1 ring-white/30">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      
                      {/* Name label */}
                      <div className="px-1 py-1">
                        <span className={`text-[11px] font-medium block truncate ${isSelected ? 'text-blue-300 font-semibold' : 'text-slate-300 group-hover:text-white'}`}>
                          {bg.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Scene Transition Directing */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Clapperboard className="w-3.5 h-3.5 text-blue-400" />
                  장면 전환 연출 (Scene Transition)
                </span>
                <select
                  value={currentScene.transition || 'none'}
                  onChange={(e) => updateCurrentScene({ transition: e.target.value as TransitionType })}
                  className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
                >
                  <option value="none">없음 (즉시 전환)</option>
                  <option value="fade">페이드 (서서히 전환)</option>
                  <option value="flash">플래시 (섬광 번쩍임)</option>
                  <option value="slide">슬라이드</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Dialog Lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>대사 목록 ({lines.length}줄)</span>
                </h3>
                <p className="text-[11px] text-slate-400">장면 내에서 순서대로 출력되는 대사들입니다.</p>
              </div>

              <button
                onClick={() => handleAddLine()}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>대사 추가</span>
              </button>
            </div>

            {/* Lines List */}
            <div className="space-y-2.5">
              {lines.map((line, lIdx) => {
                const isActive = lIdx === currentLineIndex;
                const speakerChar = project.characters.find((c) => c.id === line.speakerId);

                return (
                  <div
                    key={line.id}
                    onClick={() => onNavigate(currentSceneIndex, lIdx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                      isActive
                        ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/60'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    {/* Line Header */}
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                          #{lIdx + 1}
                        </span>

                        {/* Mini Speaker Avatar */}
                        {speakerChar && (
                          <div 
                            style={{ borderColor: speakerChar.color }}
                            className="w-5 h-5 rounded overflow-hidden border shrink-0 bg-slate-950 relative"
                            title={speakerChar.name}
                          >
                            <img 
                              src={getCharacterAvatarUrl(speakerChar)} 
                              alt={speakerChar.name} 
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = (speakerChar.gender === 'female' ? DEFAULT_AVATAR_IMAGES.female : DEFAULT_AVATAR_IMAGES.male);
                              }}
                              className="w-full h-full object-cover object-top" 
                            />
                            <div 
                              style={{ backgroundColor: `${speakerChar.color}15` }} 
                              className="absolute inset-0 pointer-events-none" 
                            />
                          </div>
                        )}

                        {/* Speaker Selector: Only characters checked in this scene */}
                        <select
                          value={line.speakerId || ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const newSpeaker = e.target.value ? e.target.value : null;
                            handleUpdateLine(lIdx, { 
                              speakerId: newSpeaker,
                              ...(newSpeaker === null ? { soundEffect: 'none' } : {})
                            });
                          }}
                          className="text-xs bg-slate-900 border border-slate-700 text-slate-200 font-semibold rounded px-2 py-1 focus:outline-none focus:border-blue-500 max-w-[125px] sm:max-w-[150px] truncate shrink min-w-0"
                        >
                          <option value="">📜 나레이션 (지문)</option>
                          {activeCastCharacters.map((c) => (
                            <option key={c.id} value={c.id}>
                              👤 {c.name} {c.isProtagonist ? '(주인공)' : ''}
                            </option>
                          ))}
                          {/* If a character was previously selected but now unchecked, show them with warning */}
                          {line.speakerId && !activeCastCharacters.some((c) => c.id === line.speakerId) && (
                            <option value={line.speakerId}>
                              ⚠️ {project.characters.find((c) => c.id === line.speakerId)?.name || '인물'} (미체크됨)
                            </option>
                          )}
                          {activeCastCharacters.length === 0 && (
                            <option value="" disabled>⚠️ 상단에서 인물을 체크하세요</option>
                          )}
                        </select>
                      </div>

                      {/* Line Actions */}
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-0.5 sm:gap-1 text-slate-400 shrink-0 ml-auto"
                      >
                        <button
                          onClick={() => handleMoveLine(lIdx, lIdx - 1)}
                          disabled={lIdx === 0}
                          className="p-1 hover:text-white disabled:opacity-20"
                          title="위로 이동"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveLine(lIdx, lIdx + 1)}
                          disabled={lIdx === lines.length - 1}
                          className="p-1 hover:text-white disabled:opacity-20"
                          title="아래로 이동"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateLine(lIdx)}
                          className="p-1 hover:text-white"
                          title="대사 복제"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLine(lIdx)}
                          disabled={lines.length <= 1}
                          className="p-1 hover:text-rose-400 disabled:opacity-20"
                          title="대사 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dialogue Text Input */}
                    <textarea
                      value={line.text}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleUpdateLine(lIdx, { text: e.target.value })}
                      placeholder="대사를 입력하세요..."
                      rows={2}
                      className="w-full p-2.5 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                    />

                    {/* Line Directing FX (Entrance motion, Emotion bubble, sound effect, shake) */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400"
                    >
                      <div className="flex flex-wrap items-center gap-2.5">
                        {!line.speakerId ? (
                          /* Narration: Motion/Bubble replaced with Stage Character Visibility selector (for refresh) */
                          <div 
                            className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-purple-500/50 text-purple-300 shadow-sm"
                            title="나레이션 시 인물 화면 표시 여부 (무대 리프레시)"
                          >
                            {line.narrationCharacterVisibility === 'hide' ? (
                              <EyeOff className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            )}
                            <span className="text-[11px] font-bold text-slate-300">무대 인물:</span>
                            <select
                              value={line.narrationCharacterVisibility || 'keep'}
                              onChange={(e) => handleUpdateLine(lIdx, { narrationCharacterVisibility: e.target.value as NarrationCharacterVisibility })}
                              className="text-[11px] bg-transparent border-0 text-purple-300 focus:ring-0 p-0 cursor-pointer font-bold"
                            >
                              <option value="keep" className="bg-slate-900 text-slate-200">👥 인물 화면에 유지</option>
                              <option value="hide" className="bg-slate-900 text-purple-300">🧹 인물 모두 지우기 (배경만 / 리프레시)</option>
                            </select>
                          </div>
                        ) : (
                          <>
                            {/* Entrance & Motion Directing */}
                            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-700/80 hover:border-slate-600 transition-colors" title="인물 등장 방식 및 움직임 연출">
                              <Activity className="w-3 h-3 text-sky-400 shrink-0" />
                              <select
                                value={(line.effect === 'slide-left' || line.effect === 'slide-right') ? 'slide-side' : (line.effect || 'none')}
                                onChange={(e) => handleUpdateLine(lIdx, { effect: e.target.value as CharacterEffect })}
                                className="text-[11px] bg-slate-900 text-slate-200 border-0 focus:ring-0 p-0 cursor-pointer font-medium"
                              >
                                <option value="none" className="bg-slate-900 text-slate-200">모션: 없음 (기본)</option>
                                <optgroup label="── 🚪 등장 연출 (Entrance) ──" className="bg-slate-950 text-slate-400 font-bold">
                                  <option value="slide-side" className="bg-slate-900 text-slate-200">↔️ 옆에서 슬라이드 등장</option>
                                  <option value="slide-up" className="bg-slate-900 text-slate-200">⬆️ 아래에서 솟아오름 등장</option>
                                  <option value="fade-in" className="bg-slate-900 text-slate-200">✨ 서서히 페이드인 등장</option>
                                </optgroup>
                                <optgroup label="── 🎭 액션/모션 연출 ──" className="bg-slate-950 text-slate-400 font-bold">
                                  <option value="exclamation" className="bg-slate-900 text-rose-300 font-semibold">❗ 머리 위 느낌표 (!)</option>
                                  <option value="question" className="bg-slate-900 text-sky-300 font-semibold">❓ 머리 위 물음표 (?)</option>
                                  <option value="shake" className="bg-slate-900 text-slate-200">⚡ 분노/당황 덜덜 떨림</option>
                                  <option value="nod" className="bg-slate-900 text-slate-200">🙆 끄덕임 (동의)</option>
                                </optgroup>
                              </select>
                            </div>

                            {/* Sound Effect (인물 대사 시에만 노출) */}
                            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-700/80 hover:border-slate-600 transition-colors" title="효과음">
                              <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                              <select
                                value={line.soundEffect || 'none'}
                                onChange={(e) => handleUpdateLine(lIdx, { soundEffect: e.target.value as SoundEffectType })}
                                className="text-[11px] bg-slate-900 text-slate-200 border-0 focus:ring-0 p-0 cursor-pointer font-medium"
                              >
                                <option value="none" className="bg-slate-900 text-slate-200">효과음 없음</option>
                                <option value="door" className="bg-slate-900 text-slate-200">🚪 문 열림</option>
                                <option value="surprise" className="bg-slate-900 text-slate-200">❗ 놀람 핑</option>
                                <option value="heartbeat" className="bg-slate-900 text-slate-200">💓 심장소리</option>
                                <option value="chime" className="bg-slate-900 text-slate-200">🔔 차임벨</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Screen shake toggle */}
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer hover:text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                        <input
                          type="checkbox"
                          checked={!!line.screenShake}
                          onChange={(e) => handleUpdateLine(lIdx, { screenShake: e.target.checked })}
                          className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 w-3 h-3"
                        />
                        <span>화면 진동</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Line Button */}
            <button
              onClick={() => handleAddLine()}
              className="w-full py-2.5 border border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-400 hover:text-blue-400 flex items-center justify-center gap-1.5 transition-colors bg-slate-950/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>이 장면에 대사 추가하기</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Scene List (Select specific scene to edit) */}
      {activeTab === 'scene-list' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-200">전체 장면 목록</span>
              <p className="text-[11px] text-slate-400">특정 장면을 클릭하여 해당 장면을 수정하세요.</p>
            </div>

            <button
              onClick={() => onAddScene(currentSceneIndex)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 장면 추가</span>
            </button>
          </div>

          <div className="space-y-2">
            {project.scenes.map((scene, sIdx) => {
              const isCurrent = sIdx === currentSceneIndex;
              const bgPreset = PRESET_BACKGROUNDS.find((b) => b.id === scene.background.value);
              const charMap = new Map(project.characters.map((c) => [c.id, c]));

              return (
                <div
                  key={scene.id}
                  onClick={() => {
                    onNavigate(sIdx, 0);
                    setActiveTab('scene-detail');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Scene Background Thumbnail */}
                    <div className="relative w-14 h-9 rounded shrink-0 overflow-hidden border border-slate-700 bg-slate-900">
                      {scene.background.type === 'custom' && scene.background.value ? (
                        <img src={scene.background.value} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <img 
                          src={bgPreset?.image || `/resources/backgrounds/${scene.background.value || 'rooftop_sunset'}.png`} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/resources/backgrounds/rooftop_sunset.png';
                          }}
                        />
                      )}
                      <span className="absolute bottom-0.5 right-0.5 font-mono text-[9px] font-bold text-white bg-black/75 px-1 rounded">
                        #{sIdx + 1}
                      </span>
                    </div>

                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-white truncate">
                          {scene.title || `장면 ${sIdx + 1}`}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 rounded">
                          대사 {scene.lines.length}개
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>등장:</span>
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
                        <span className="truncate max-w-[130px]">
                          {scene.castCharacterIds?.map((id) => charMap.get(id)?.name).filter(Boolean).join(', ') || '없음'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-slate-400"
                  >
                    <button
                      onClick={() => onMoveScene(sIdx, sIdx - 1)}
                      disabled={sIdx === 0}
                      className="p-1 hover:text-white disabled:opacity-20"
                      title="위로 이동"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveScene(sIdx, sIdx + 1)}
                      disabled={sIdx === project.scenes.length - 1}
                      className="p-1 hover:text-white disabled:opacity-20"
                      title="아래로 이동"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDuplicateScene(sIdx)}
                      className="p-1 hover:text-white"
                      title="장면 복제"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteScene(sIdx)}
                      disabled={project.scenes.length <= 1}
                      className="p-1 hover:text-rose-400 disabled:opacity-20"
                      title="장면 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Characters Management (등장인물 만드는 탭) */}
      {activeTab === 'characters' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-200">등장인물 제작 &amp; 설정</span>
              <p className="text-[11px] text-slate-400">인물을 만들고, 주인공으로 설정하면 왼쪽 자리에 자동 고정됩니다.</p>
            </div>
            <button
              onClick={handleAddNewCharacter}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>인물 추가</span>
            </button>
          </div>

          <div className="space-y-3">
            {project.characters.map((char) => (
              <div
                key={char.id}
                className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="color"
                      value={char.color}
                      onChange={(e) => {
                        const updated = project.characters.map((c) => 
                          c.id === char.id ? { ...c, color: e.target.value } : c
                        );
                        onUpdateCharacters(updated);
                      }}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={char.name}
                      onChange={(e) => {
                        const updated = project.characters.map((c) => 
                          c.id === char.id ? { ...c, name: e.target.value } : c
                        );
                        onUpdateCharacters(updated);
                      }}
                      className="text-xs font-bold bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500 w-28 sm:w-32"
                    />

                    {/* 성별 선택 (남성 / 여성) */}
                    <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700 text-[11px] shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = project.characters.map((c) => 
                            c.id === char.id ? { ...c, gender: 'male' as const } : c
                          );
                          onUpdateCharacters(updated);
                        }}
                        className={`px-2 py-0.5 rounded font-medium transition-colors ${
                          (char.gender || 'male') === 'male'
                            ? 'bg-blue-600 text-white font-bold shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="남성 (디폴트 이미지: 남자 실루엣)"
                      >
                        남 ♂
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = project.characters.map((c) => 
                            c.id === char.id ? { ...c, gender: 'female' as const } : c
                          );
                          onUpdateCharacters(updated);
                        }}
                        className={`px-2 py-0.5 rounded font-medium transition-colors ${
                          char.gender === 'female'
                            ? 'bg-pink-600 text-white font-bold shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="여성 (디폴트 이미지: 여자 실루엣)"
                      >
                        여 ♀
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const updated = project.characters.map((c) => ({
                          ...c,
                          isProtagonist: c.id === char.id ? !char.isProtagonist : false,
                          defaultPosition: c.id === char.id && !char.isProtagonist ? ('left' as const) : c.defaultPosition
                        }));
                        onUpdateCharacters(updated);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded border transition-all ${
                        char.isProtagonist
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${char.isProtagonist ? 'fill-amber-400' : ''}`} />
                      <span>{char.isProtagonist ? '주인공 (좌측고정)' : '주인공 지정'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (project.characters.length <= 1) return;
                        const updated = project.characters.filter((c) => c.id !== char.id);
                        onUpdateCharacters(updated);
                      }}
                      disabled={project.characters.length <= 1}
                      className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Character Profile & Image Uploader Area */}
                <div className="flex items-center gap-3">
                  {/* Clickable Profile Image Box (In-game style silhouette / photo) */}
                  <label 
                    title={char.avatarUrl ? '클릭하여 사진 변경' : '클릭하여 사진 등록'}
                    style={{ borderColor: char.color }}
                    className="group relative w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:scale-105 shadow-sm shrink-0 bg-slate-950"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCharacterImageUpload(char.id, e)}
                      className="hidden"
                    />

                    <img 
                      src={getCharacterAvatarUrl(char)} 
                      alt={char.name} 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = (char.gender === 'female' ? DEFAULT_AVATAR_IMAGES.female : DEFAULT_AVATAR_IMAGES.male);
                      }}
                      className={`w-full h-full object-cover object-top rounded-lg ${char.avatarUrl ? '' : 'opacity-90'}`} 
                    />
                    {/* In-game color tint overlay */}
                    <div 
                      style={{ backgroundColor: `${char.color}15` }} 
                      className="absolute inset-0 pointer-events-none rounded-lg" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[9px] font-bold z-10">
                      <Camera className="w-3.5 h-3.5 mb-0.5" />
                      <span>{char.avatarUrl ? '사진 변경' : '사진 등록'}</span>
                    </div>
                  </label>

                  {/* Character Position & Image Controls */}
                  <div className="text-xs text-slate-300 space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {char.avatarUrl 
                          ? '✅ 커스텀 사진 등록됨' 
                          : `👤 기본 실루엣 (${(char.gender || 'male') === 'female' ? '여성' : '남성'})`}
                      </span>

                      {char.avatarUrl && (
                        <button
                          onClick={() => handleRemoveCharacterImage(char.id)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline"
                        >
                          기본 실루엣으로 복원
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1 font-medium bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors">
                        <Upload className="w-3 h-3" />
                        <span>사진 파일 선택</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCharacterImageUpload(char.id, e)}
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={() => handlePromptImageUrl(char.id)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                      >
                        URL 입력
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-500">
                      기본 위치: <span className="text-slate-300 font-medium">{char.defaultPosition === 'left' ? '왼쪽 (주인공)' : '오른쪽'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Style & Text Box Theme Customizer */}
      {activeTab === 'style' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200">폰트 &amp; 텍스트 박스 커스텀</span>
            <p className="text-[11px] text-slate-400">비주얼 노벨 대사 박스 디자인과 자막 스타일을 변경합니다.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">폰트 종류 (Font Family)</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'dodum', label: '고운 돋움 (감성)', sample: 'font-["Gowun_Dodum",sans-serif]' },
                { id: 'myeongjo', label: '나눔 명조 (문학/소설)', sample: 'font-["Nanum_Myeongjo",serif]' },
                { id: 'sans', label: '노토 산스 (기본 고딕)', sample: 'font-["Noto_Sans_KR",sans-serif]' },
                { id: 'orbit', label: '얼빗 (SF/현대)', sample: 'font-["Orbit",sans-serif]' },
                { id: 'headline', label: '블랙한산스 (강렬)', sample: 'font-["Black_Han_Sans",sans-serif]' },
                { id: 'pixel', label: '레트로 픽셀 (도트 RPG)', sample: 'font-["VT323",monospace]' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdateStyle({ ...project.style, fontFamily: f.id as FontFamilyType })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    project.style.fontFamily === f.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow ring-1 ring-blue-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`text-xs font-bold ${f.sample}`}>{f.label}</div>
                  <div className={`text-[11px] opacity-75 mt-0.5 ${f.sample}`}>가나다라 ABC 123</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800">
            <label className="text-xs font-bold text-slate-300">텍스트 박스 디자인 테마</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'dark', label: '클래식 다크' },
                { id: 'glass', label: '글래스모피즘' },
                { id: 'pixel', label: '레트로 8-Bit' },
                { id: 'manga', label: '만화 말풍선' },
                { id: 'cyberpunk', label: '사이버펑크 네온' },
                { id: 'fantasy', label: '판타지 골드' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdateStyle({ ...project.style, boxTheme: t.id as BoxThemeType })}
                  className={`py-2 px-2.5 rounded-lg border text-center text-xs font-semibold transition-all ${
                    project.style.boxTheme === t.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">글자 크기</label>
              <select
                value={project.style.fontSize}
                onChange={(e) => onUpdateStyle({ ...project.style, fontSize: e.target.value as FontSizeOption })}
                className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="small">작게</option>
                <option value="medium">보통 (권장)</option>
                <option value="large">크게</option>
                <option value="xlarge">아주 크게</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">텍스트 박스 위치</label>
              <select
                value={project.style.boxPosition}
                onChange={(e) => onUpdateStyle({ ...project.style, boxPosition: e.target.value as BoxPosition })}
                className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="bottom">하단 (클래식)</option>
                <option value="center">중앙 (자막형)</option>
                <option value="top">상단</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-bold">텍스트 박스 불투명도</span>
              <span className="font-mono text-blue-400">{Math.round(project.style.boxOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={project.style.boxOpacity}
              onChange={(e) => onUpdateStyle({ ...project.style, boxOpacity: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800">
            <label className="text-xs font-bold text-slate-300">이름표 디자인</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'ribbon', label: '리본' },
                { id: 'badge', label: '뱃지' },
                { id: 'neon', label: '네온' },
                { id: 'minimal', label: '미니멀' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => onUpdateStyle({ ...project.style, nameBadgeStyle: b.id as NameBadgeStyle })}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    project.style.nameBadgeStyle === b.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
