import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NovelProject, Scene, DialogLine } from '../types/novel';
import { PRESET_BACKGROUNDS, getCharacterAvatarUrl, DEFAULT_AVATAR_IMAGES } from '../data/presetAssets';
import { resolveScenePositions } from '../services/scriptParser';
import { soundService } from '../services/audio';
import { 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ListTree, 
  BookOpen,
  MessageSquare
} from 'lucide-react';

interface NovelStageProps {
  project: NovelProject;
  currentSceneIndex: number;
  currentLineIndex: number;
  onNavigate: (sceneIndex: number, lineIndex: number) => void;
  onOpenSlideNavigator?: () => void;
  onOpenBacklog?: () => void;
  onToggleCinemaMode?: () => void;
  isCinemaMode?: boolean;
}

// Stylized anime pop icon for exclamation (!)
const PopExclamationIcon = () => (
  <svg 
    viewBox="0 0 48 64" 
    className="w-8 h-11 sm:w-10 sm:h-14 filter drop-shadow-[0_4px_12px_rgba(225,29,72,0.7)]"
  >
    <defs>
      <linearGradient id="popExclGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff4343" />
        <stop offset="50%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#be123c" />
      </linearGradient>
    </defs>
    <g transform="rotate(5, 24, 32)">
      {/* Exclamation Bar with thick crisp white border */}
      <path 
        d="M 18 6 C 17 3 31 3 30 6 L 27 38 C 27 40 21 40 21 38 Z" 
        fill="url(#popExclGrad)" 
        stroke="#ffffff" 
        strokeWidth="3.5" 
        strokeLinejoin="round" 
      />
      {/* Exclamation Dot with thick crisp white border */}
      <circle 
        cx="24" 
        cy="52" 
        r="5.5" 
        fill="url(#popExclGrad)" 
        stroke="#ffffff" 
        strokeWidth="3.5" 
      />
      {/* Glossy Anime Highlights */}
      <ellipse cx="23" cy="14" rx="2" ry="7" fill="#ffffff" opacity="0.65" />
      <circle cx="23" cy="50.5" r="1.6" fill="#ffffff" opacity="0.65" />
    </g>
  </svg>
);

export const NovelStage: React.FC<NovelStageProps> = ({
  project,
  currentSceneIndex,
  currentLineIndex,
  onNavigate,
  onOpenSlideNavigator,
  onOpenBacklog,
  onToggleCinemaMode,
  isCinemaMode = false,
}) => {
  const currentScene: Scene | undefined = project.scenes[currentSceneIndex] || project.scenes[0];
  const lines = currentScene?.lines || [];
  const currentLine: DialogLine | undefined = lines[currentLineIndex] || lines[0];

  const { style, settings } = project;

  // Typewriter state
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(settings.autoAdvance);
  const [isMuted, setIsMuted] = useState(!settings.sfxEnabled);
  const [screenShaking, setScreenShaking] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  const typingTimerRef = useRef<number | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const fullDialog = currentLine?.text || '';

  // Scene Background
  const bgData = useMemo(() => {
    if (!currentScene) return null;
    const bg = currentScene.background;
    if (bg.type === 'preset') {
      return PRESET_BACKGROUNDS.find((b) => b.id === bg.value) || PRESET_BACKGROUNDS[0];
    }
    return null;
  }, [currentScene]);

  // Resolve characters on stage based on scene cast checkboxes and active line
  const resolvedCharacters = useMemo(() => {
    if (!currentScene) return [];
    // If current line is narration and configured to hide characters for stage refresh
    if (!currentLine?.speakerId && currentLine?.narrationCharacterVisibility === 'hide') {
      return [];
    }
    return resolveScenePositions(
      currentScene.castCharacterIds || [],
      project.characters,
      currentLine?.speakerId || null,
      currentLine,
      currentScene.lines,
      currentLineIndex
    );
  }, [currentScene, project.characters, currentLine, currentLineIndex]);

  // Current speaker info
  const speakerInfo = useMemo(() => {
    if (!currentLine || !currentLine.speakerId) return null;
    const char = project.characters.find((c) => c.id === currentLine.speakerId);
    if (char) return char;
    if (currentLine.speakerCustomName) {
      return {
        id: 'custom',
        name: currentLine.speakerCustomName,
        color: project.style.accentColor,
        isProtagonist: false,
        defaultPosition: 'left' as const,
        avatarUrl: ''
      };
    }
    return null;
  }, [currentLine, project.characters, project.style.accentColor]);

  // Sound effects and visual fx on line/scene change
  useEffect(() => {
    if (!currentLine) return;

    // Transition sound (Only for character speech lines)
    if (settings.sfxEnabled && !isMuted && currentLine.speakerId && currentLine.soundEffect && currentLine.soundEffect !== 'none') {
      soundService.playEffect(currentLine.soundEffect);
    }

    // Screen shake
    if (currentLine.screenShake) {
      setScreenShaking(true);
      const timer = window.setTimeout(() => setScreenShaking(false), 450);
      return () => clearTimeout(timer);
    }

    // Flash transition if at first line of scene and scene has flash transition
    if (currentLineIndex === 0 && currentScene?.transition === 'flash') {
      setFlashActive(true);
      const timer = window.setTimeout(() => setFlashActive(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentSceneIndex, currentLineIndex, currentLine?.soundEffect, currentLine?.screenShake, currentScene?.transition, settings.sfxEnabled, isMuted]);

  // Typewriter effect logic
  useEffect(() => {
    if (!fullDialog) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    if (settings.textSpeed <= 0) {
      setDisplayedText(fullDialog);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);

    let charIdx = 0;
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = window.setInterval(() => {
      charIdx++;
      setDisplayedText(fullDialog.slice(0, charIdx));

      if (settings.typewriterSound && !isMuted && charIdx % 2 === 1) {
        soundService.playTypewriterBlip(speakerInfo ? 680 : 540);
      }

      if (charIdx >= fullDialog.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
      }
    }, settings.textSpeed);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [currentSceneIndex, currentLineIndex, fullDialog, settings.textSpeed, settings.typewriterSound, isMuted, speakerInfo]);

  // Advance to next line (or next scene)
  const handleAdvance = useCallback(() => {
    // If still typing, first click immediately finishes the line
    if (isTyping) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      setDisplayedText(fullDialog);
      setIsTyping(false);
      return;
    }

    // Advance line in current scene
    if (currentLineIndex < lines.length - 1) {
      if (settings.sfxEnabled && !isMuted) soundService.playAdvanceClick();
      onNavigate(currentSceneIndex, currentLineIndex + 1);
      return;
    }

    // End of lines in current scene: advance to next scene
    if (currentSceneIndex < project.scenes.length - 1) {
      if (settings.sfxEnabled && !isMuted) soundService.playAdvanceClick();
      onNavigate(currentSceneIndex + 1, 0);
    } else {
      if (isAutoPlaying) setIsAutoPlaying(false);
    }
  }, [isTyping, fullDialog, currentLineIndex, lines.length, currentSceneIndex, project.scenes.length, settings.sfxEnabled, isMuted, onNavigate, isAutoPlaying]);

  // Previous line (or previous scene's last line)
  const handlePrevious = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentLineIndex > 0) {
      if (settings.sfxEnabled && !isMuted) soundService.playAdvanceClick();
      onNavigate(currentSceneIndex, currentLineIndex - 1);
      return;
    }

    if (currentSceneIndex > 0) {
      const prevScene = project.scenes[currentSceneIndex - 1];
      const prevLastLine = Math.max(0, (prevScene?.lines?.length || 1) - 1);
      if (settings.sfxEnabled && !isMuted) soundService.playAdvanceClick();
      onNavigate(currentSceneIndex - 1, prevLastLine);
    }
  }, [currentLineIndex, currentSceneIndex, project.scenes, settings.sfxEnabled, isMuted, onNavigate]);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      return;
    }

    if (!isTyping) {
      const delayMs = (settings.autoDelay || 3) * 1000;
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        const isLastInStory = currentSceneIndex >= project.scenes.length - 1 && currentLineIndex >= lines.length - 1;
        if (!isLastInStory) {
          handleAdvance();
        } else {
          setIsAutoPlaying(false);
        }
      }, delayMs);
    }

    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [isAutoPlaying, isTyping, currentSceneIndex, currentLineIndex, lines.length, project.scenes.length, settings.autoDelay, handleAdvance]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight' || e.code === 'PageDown') {
        e.preventDefault();
        handleAdvance();
      } else if (e.code === 'ArrowLeft' || e.code === 'PageUp') {
        e.preventDefault();
        handlePrevious();
      } else if (e.code === 'KeyA') {
        setIsAutoPlaying((prev) => !prev);
      } else if (e.code === 'KeyM') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance, handlePrevious]);

  // Font family class
  const fontClass = useMemo(() => {
    switch (style.fontFamily) {
      case 'dodum': return 'font-["Gowun_Dodum",sans-serif]';
      case 'myeongjo': return 'font-["Nanum_Myeongjo",serif]';
      case 'orbit': return 'font-["Orbit",sans-serif]';
      case 'headline': return 'font-["Black_Han_Sans",sans-serif]';
      case 'pixel': return 'font-["VT323",monospace] tracking-wider';
      default: return 'font-["Noto_Sans_KR",sans-serif]';
    }
  }, [style.fontFamily]);

  // Font size class
  const fontSizeClass = useMemo(() => {
    switch (style.fontSize) {
      case 'small': return 'text-sm md:text-base leading-relaxed';
      case 'large': return 'text-lg md:text-xl leading-relaxed';
      case 'xlarge': return 'text-xl md:text-2xl leading-relaxed font-medium';
      default: return 'text-base md:text-lg leading-relaxed';
    }
  }, [style.fontSize]);

  // Text box theme styling
  const boxThemeStyle = useMemo(() => {
    switch (style.boxTheme) {
      case 'glass':
        return 'backdrop-blur-xl bg-slate-900/75 border border-white/20 shadow-2xl rounded-2xl';
      case 'pixel':
        return 'bg-black border-4 border-amber-400 shadow-[4px_4px_0px_#d97706] rounded-none';
      case 'manga':
        return 'bg-white text-slate-900 border-4 border-black shadow-[6px_6px_0px_#000] rounded-xl';
      case 'cyberpunk':
        return 'bg-slate-950/90 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] rounded-none clip-cyber';
      case 'fantasy':
        return 'bg-stone-900/90 border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.3)] rounded-lg';
      case 'minimal':
        return 'bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl';
      default:
        return 'bg-slate-950/85 backdrop-blur-lg border border-slate-800 shadow-2xl rounded-xl';
    }
  }, [style.boxTheme]);

  const isAtFirst = currentSceneIndex === 0 && currentLineIndex === 0;

  return (
    <div className={`relative w-full h-full select-none overflow-hidden bg-black ${isCinemaMode ? 'fixed inset-0 z-50' : ''}`}>
      {/* Studio Screen Stage - Fills 100% of available space */}
      <div 
        onClick={handleAdvance}
        className={`relative w-full h-full overflow-hidden cursor-pointer transition-all duration-300 ${screenShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
      >
        {/* Background Layer: Real scenic background image without boxes */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950">
          {currentScene?.background.type === 'custom' && currentScene.background.value ? (
            <img 
              src={currentScene.background.value} 
              alt="Scene background" 
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                currentScene.background.filter === 'sepia' ? 'sepia-[0.6] contrast-[1.1]' :
                currentScene.background.filter === 'blur' ? 'blur-sm scale-105' :
                currentScene.background.filter === 'dark' ? 'brightness-50' :
                currentScene.background.filter === 'sunset' ? 'sepia-[0.35] hue-rotate-[-20deg] saturate-150' :
                currentScene.background.filter === 'night' ? 'brightness-60 hue-rotate-[190deg]' : ''
              }`}
            />
          ) : (
            <img 
              src={bgData?.image || `/resources/backgrounds/${currentScene?.background.value || 'rooftop_sunset'}.png`} 
              alt={bgData?.name || 'Scene background'} 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/resources/backgrounds/rooftop_sunset.png';
              }}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                currentScene?.background.filter === 'sepia' ? 'sepia-[0.6] contrast-[1.1]' :
                currentScene?.background.filter === 'blur' ? 'blur-sm scale-105' :
                currentScene?.background.filter === 'dark' ? 'brightness-50' :
                currentScene?.background.filter === 'sunset' ? 'sepia-[0.35] hue-rotate-[-20deg] saturate-150' :
                currentScene?.background.filter === 'night' ? 'brightness-60 hue-rotate-[190deg]' : ''
              }`}
            />
          )}

          {/* Vignette Shadow */}
          <div className="absolute inset-0 pointer-events-none bg-radial-[circle_at_center,transparent_55%,rgba(0,0,0,0.5)_100%]" />
        </div>

        {/* Screen Flash Transition */}
        {flashActive && (
          <div className="absolute inset-0 bg-white z-40 pointer-events-none animate-out fade-out duration-300" />
        )}

        {/* Character Sprites Layer - Stands right above the bottom dialogue box */}
        <div className="absolute inset-x-0 top-0 bottom-40 sm:bottom-44 md:bottom-48 pointer-events-none flex items-end justify-between px-8 md:px-16 z-10">
          {resolvedCharacters.map((item) => {
            const char = item.character;
            const isSpeaker = item.isSpeaker;

            let positionClass = 'left-1/2 -translate-x-1/2';
            if (item.resolvedPosition === 'left') {
              positionClass = 'left-[8%] sm:left-[12%] md:left-[16%] translate-x-0';
            } else if (item.resolvedPosition === 'right') {
              positionClass = 'right-[8%] sm:right-[12%] md:right-[16%] translate-x-0';
            }

            const speakerFocusClass = isSpeaker
              ? 'opacity-100 scale-100 drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] z-20 transition-all duration-300'
              : 'opacity-75 scale-[0.96] brightness-70 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-10 transition-all duration-300';

            let effectClass = '';
            const isSideSlide = item.effect === 'slide-side' || item.effect === 'slide-left' || item.effect === 'slide-right';

            if (isSideSlide) {
              // 위치에 따라 자동으로 외곽에서 슬라이드 등장
              if (item.resolvedPosition === 'right') {
                effectClass = 'animate-slide-right';
              } else if (item.resolvedPosition === 'left') {
                effectClass = 'animate-slide-left';
              } else {
                effectClass = char.defaultPosition === 'right' ? 'animate-slide-right' : 'animate-slide-left';
              }
            } else if (item.effect === 'slide-up') {
              effectClass = 'animate-slide-up';
            } else if (item.effect === 'fade-in') {
              effectClass = 'animate-fade-in';
            } else if (item.effect === 'shake') {
              effectClass = 'animate-[shake_0.4s_ease-in-out]';
            } else if (item.effect === 'nod') {
              effectClass = 'animate-nod';
            } else if (item.effect === 'exclamation') {
              effectClass = 'animate-jump-surprise';
            } else if (item.effect === 'question') {
              effectClass = 'animate-tilt';
            }

            const avatarSrc = getCharacterAvatarUrl(char);
            const customScale = typeof char.scale === 'number' ? char.scale : 1.0;
            const customOffsetY = typeof char.offsetY === 'number' ? char.offsetY : 0;

            return (
              <div
                key={char.id}
                className={`absolute bottom-0 h-[52%] sm:h-[60%] md:h-[66%] max-w-[42%] sm:max-w-[34%] md:max-w-[30%] flex flex-col items-center justify-end origin-bottom pointer-events-none select-none ${positionClass} ${speakerFocusClass}`}
              >
                {/* 1. Base Scale & Vertical Offset Isolated Layer (보호 계층: 애니메이션 키프레임 간섭 방지) */}
                <div 
                  className="relative h-full w-full flex flex-col items-center justify-end"
                  style={{
                    transform: `scale(${customScale}) translateY(${customOffsetY}%)`,
                    transformOrigin: 'bottom center',
                    transition: 'transform 0.2s ease-out'
                  }}
                >
                  {/* 2. Action Effect Animation Layer (커스텀 스케일 내부에서 상대적으로 실행) */}
                  <div 
                    key={`${char.id}_${currentLineIndex}_${item.effect || 'none'}`}
                    className={`relative h-full w-full flex flex-col items-center justify-end ${effectClass}`}
                  >
                    {/* 캐릭터 이미지 앵커 컨테이너 (정수리 바로 위에 이펙트를 안착시키는 기준점) */}
                    <div className="relative h-full max-w-full flex flex-col items-center justify-end">
                      {/* 머리 위 예쁜 애니메이션 느낌표 (!) - 캐릭터 정수리 바로 위에 완벽 밀착 */}
                      {item.effect === 'exclamation' && (
                        <div className="absolute bottom-[calc(100%+0.5rem)] sm:bottom-[calc(100%+0.75rem)] left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-pop-bubble select-none flex items-center justify-center">
                          <PopExclamationIcon />
                        </div>
                      )}

                      {/* 머리 위 물음표 (?) 이펙트 - 캐릭터 정수리 바로 위에 완벽 밀착 */}
                      {item.effect === 'question' && (
                        <div className="absolute bottom-[calc(100%+0.5rem)] sm:bottom-[calc(100%+0.75rem)] left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-pop-bubble select-none flex items-center justify-center">
                          <span className="text-3xl sm:text-4xl md:text-5xl select-none leading-none filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]">
                            ❓
                          </span>
                        </div>
                      )}

                      <img 
                        src={avatarSrc} 
                        alt={char.name} 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = (char.gender === 'female' ? DEFAULT_AVATAR_IMAGES.female : DEFAULT_AVATAR_IMAGES.male);
                        }}
                        className="h-full w-auto max-w-full object-contain object-bottom pointer-events-none select-none filter transition-transform duration-300 drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Novel Text Box Layer - Full-width opaque rectangle attached to bottom */}
        <div className="absolute inset-x-0 bottom-0 w-full z-30 select-none">
          {/* Opaque Full-Width Rectangle Dialogue Box Body (직사각형, 여백 없이 전체 차지, 완전 불투명) */}
          <div 
            className={`w-full h-40 sm:h-44 md:h-48 bg-slate-950 border-t-2 border-slate-700/80 shadow-[0_-12px_35px_rgba(0,0,0,0.9)] relative ${fontClass}`}
          >
            <div className="w-full max-w-6xl mx-auto h-full px-6 sm:px-12 md:px-16 pt-2.5 sm:pt-3 md:pt-3.5 pb-3 sm:pb-3.5 md:pb-4 flex flex-col justify-between relative">
              <div className="space-y-2 overflow-hidden flex-1">
                {/* Minimal Speaker Name Header (예시 이미지 블루아카이브 스타일) */}
                {speakerInfo && (
                  <div className="inline-flex flex-col items-start select-none -mt-0.5 mb-0.5">
                    <div className="flex items-center gap-2">
                      {/* Speech Bubble Icon (말풍선 아이콘) */}
                      <MessageSquare 
                        style={{ color: speakerInfo.color || '#60a5fa' }}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 fill-current/20 stroke-[2.2]" 
                      />

                      {/* Speaker Name */}
                      <span 
                        style={{ color: speakerInfo.color || '#ffffff' }}
                        className="text-sm sm:text-base md:text-lg font-bold tracking-wide drop-shadow-sm"
                      >
                        {speakerInfo.name}
                      </span>
                    </div>

                    {/* Underline bar matching character color or neutral line */}
                    <div 
                      style={{ backgroundColor: `${speakerInfo.color || '#94a3b8'}70` }}
                      className="w-full min-w-[50px] h-[1.5px] mt-1 bg-slate-600/70" 
                    />
                  </div>
                )}

                {/* Dialogue Text Content */}
                <div 
                  style={{ color: style.textColor || '#ffffff' }}
                  className={`whitespace-pre-wrap leading-relaxed overflow-y-auto pr-6 ${fontSizeClass}`}
                >
                  {displayedText || (
                    <span className="text-slate-500 italic opacity-60 select-none">대사를 입력하세요...</span>
                  )}
                  {isTyping && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
                  )}
                </div>
              </div>

              {/* Bottom Row inside Dialogue Box: Click to continue Prompt */}
              {!isTyping && (
                <div className="flex items-center justify-end pt-1.5 border-t border-slate-800/60">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-amber-400/90 select-none">
                    <span className="text-[11px] opacity-80">클릭하여 계속</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top-Right Quick Controls Bar */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="absolute top-3 right-3 md:top-4 md:right-4 z-40 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-full px-2.5 py-1 text-xs text-slate-300 shadow-xl"
        >
          {/* Navigation Buttons (이전 / 다음) */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              disabled={isAtFirst}
              title="이전 대사 (←)"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:pointer-events-none rounded-full border border-slate-700 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>이전</span>
            </button>

            <button
              onClick={handleAdvance}
              title="다음 대사 (Space / Enter / 무대 클릭)"
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-full border border-blue-400/40 shadow-sm transition-colors"
            >
              <span>다음</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-3.5 bg-slate-700/80 mx-0.5" />

          {/* Scene and Line Counter */}
          <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-800 rounded-full text-slate-200">
            씬 {currentSceneIndex + 1}/{project.scenes.length} • 대사 {currentLineIndex + 1}/{lines.length || 1}
          </span>

          {onOpenSlideNavigator && (
            <button
              onClick={onOpenSlideNavigator}
              title="장면 슬라이더 / 특정 장면으로 이동 (PPT 모드)"
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <ListTree className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenBacklog && (
            <button
              onClick={onOpenBacklog}
              title="대사 기록 (Backlog)"
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            title={isAutoPlaying ? '자동 재생 중지 (A)' : '자동 재생 시작 (A)'}
            className={`p-1.5 rounded-full transition-colors flex items-center gap-1 text-[11px] font-semibold ${
              isAutoPlaying ? 'bg-amber-500 text-slate-950 px-2' : 'hover:text-white hover:bg-slate-800'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isAutoPlaying && <span>AUTO</span>}
          </button>

          <button
            onClick={() => setIsMuted((prev) => !prev)}
            title={isMuted ? '소리 켜기 (M)' : '소리 끄기 (M)'}
            className={`p-1.5 rounded-full transition-colors ${isMuted ? 'text-rose-400 hover:bg-slate-800' : 'hover:text-white hover:bg-slate-800'}`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {onToggleCinemaMode && (
            <button
              onClick={onToggleCinemaMode}
              title={isCinemaMode ? '창 모드로 복귀 (ESC)' : '전체화면 스토리 실행'}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
