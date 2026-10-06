import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NovelProject, Scene, Character, StoryStyle, PlaybackSettings } from './types/novel';
import { SAMPLE_PROJECT } from './data/presetAssets';
import { loadActiveProject, saveActiveProject } from './services/db';
import { Header } from './components/Header';
import { EditorPanel } from './components/EditorPanel';
import { NovelStage } from './components/NovelStage';
import { CinemaMode } from './components/CinemaMode';
import { SlideNavigatorModal } from './components/SlideNavigatorModal';
import { BacklogModal } from './components/BacklogModal';
import { ScriptImportModal } from './components/ScriptImportModal';
import { SettingsModal } from './components/SettingsModal';
import { PdfExportModal } from './components/PdfExportModal';
import { Eye, Edit3, Sparkles } from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<NovelProject>(SAMPLE_PROJECT);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAutoSaved, setIsAutoSaved] = useState(true);

  // Modal states
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);
  const [isSlideNavOpen, setIsSlideNavOpen] = useState(false);
  const [isBacklogOpen, setIsBacklogOpen] = useState(false);
  const [isScriptImportOpen, setIsScriptImportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);

  // Mobile layout switch
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('preview');

  // Load from IndexedDB
  useEffect(() => {
    let mounted = true;
    loadActiveProject()
      .then((loaded) => {
        if (mounted && loaded) {
          // Validate structure has lines array
          if (loaded.scenes && loaded.scenes[0] && Array.isArray(loaded.scenes[0].lines)) {
            setProject(loaded);
          } else {
            setProject(SAMPLE_PROJECT);
          }
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) setIsLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Debounced auto-save
  const saveTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isLoaded) return;
    setIsAutoSaved(false);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      saveActiveProject(project)
        .then(() => setIsAutoSaved(true))
        .catch(() => {});
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [project, isLoaded]);

  // Safe navigation between scenes and lines
  const handleNavigate = useCallback((sceneIndex: number, lineIndex: number) => {
    const clampedScene = Math.max(0, Math.min(project.scenes.length - 1, sceneIndex));
    const targetScene = project.scenes[clampedScene];
    const maxLine = Math.max(0, (targetScene?.lines?.length || 1) - 1);
    const clampedLine = Math.max(0, Math.min(maxLine, lineIndex));

    setCurrentSceneIndex(clampedScene);
    setCurrentLineIndex(clampedLine);
  }, [project.scenes]);

  // Update a scene
  const handleUpdateScene = (sceneIndex: number, updatedScene: Scene) => {
    setProject((prev) => {
      const newScenes = [...prev.scenes];
      newScenes[sceneIndex] = updatedScene;
      return { ...prev, scenes: newScenes };
    });
  };

  // Add new scene
  const handleAddScene = (afterIndex?: number) => {
    const targetIdx = afterIndex !== undefined ? afterIndex : currentSceneIndex;
    const current = project.scenes[targetIdx];
    const protagonist = project.characters.find((c) => c.isProtagonist) || project.characters[0];

    const newScene: Scene = {
      id: `sc_${Date.now()}`,
      title: `장면 ${project.scenes.length + 1}`,
      background: current ? { ...current.background } : { type: 'preset', value: 'rooftop_sunset', filter: 'none' },
      castCharacterIds: protagonist ? [protagonist.id] : [],
      lines: [
        {
          id: `line_${Date.now()}`,
          speakerId: protagonist ? protagonist.id : null,
          text: '새로운 장면의 첫 번째 대사를 입력하세요.',
          speakerExpression: 'neutral'
        }
      ],
      transition: 'fade'
    };

    setProject((prev) => {
      const newScenes = [...prev.scenes];
      newScenes.splice(targetIdx + 1, 0, newScene);
      return { ...prev, scenes: newScenes };
    });

    handleNavigate(targetIdx + 1, 0);
  };

  // Duplicate scene
  const handleDuplicateScene = (sceneIndex: number) => {
    const source = project.scenes[sceneIndex];
    if (!source) return;

    const duplicated: Scene = {
      ...JSON.parse(JSON.stringify(source)),
      id: `sc_${Date.now()}`,
      title: `${source.title || '장면'} (복사본)`
    };

    setProject((prev) => {
      const newScenes = [...prev.scenes];
      newScenes.splice(sceneIndex + 1, 0, duplicated);
      return { ...prev, scenes: newScenes };
    });

    handleNavigate(sceneIndex + 1, 0);
  };

  // Delete scene
  const handleDeleteScene = (sceneIndex: number) => {
    if (project.scenes.length <= 1) return;

    setProject((prev) => {
      const newScenes = prev.scenes.filter((_, idx) => idx !== sceneIndex);
      return { ...prev, scenes: newScenes };
    });

    if (currentSceneIndex >= project.scenes.length - 1) {
      handleNavigate(Math.max(0, project.scenes.length - 2), 0);
    } else {
      handleNavigate(currentSceneIndex, 0);
    }
  };

  // Move scene
  const handleMoveScene = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= project.scenes.length) return;

    setProject((prev) => {
      const newScenes = [...prev.scenes];
      const [moved] = newScenes.splice(fromIndex, 1);
      newScenes.splice(toIndex, 0, moved);
      return { ...prev, scenes: newScenes };
    });

    handleNavigate(toIndex, 0);
  };

  // Update Characters
  const handleUpdateCharacters = (characters: Character[]) => {
    setProject((prev) => ({ ...prev, characters }));
  };

  // Update Style
  const handleUpdateStyle = (style: StoryStyle) => {
    setProject((prev) => ({ ...prev, style }));
  };

  // Update Settings
  const handleUpdateSettings = (settings: PlaybackSettings) => {
    setProject((prev) => ({ ...prev, settings }));
  };

  // Export JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title || 'story'}.novelstudio.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleImportJson = (imported: NovelProject) => {
    setProject(imported);
    handleNavigate(0, 0);
    saveActiveProject(imported);
  };

  // Reset to sample
  const handleResetSample = () => {
    if (window.confirm('기본 샘플 스토리로 초기화하시겠습니까? 현재 변경사항은 덮어쓰여집니다.')) {
      setProject(SAMPLE_PROJECT);
      handleNavigate(0, 0);
      saveActiveProject(SAMPLE_PROJECT);
    }
  };

  // Batch script apply
  const handleApplyScript = (newScenes: Scene[], updatedCharacters: Character[]) => {
    setProject((prev) => ({
      ...prev,
      scenes: newScenes,
      characters: updatedCharacters
    }));
    handleNavigate(0, 0);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        project={project}
        onUpdateTitle={(title) => setProject((prev) => ({ ...prev, title }))}
        onPlayCinema={() => setIsCinemaOpen(true)}
        onOpenSlideNavigator={() => setIsSlideNavOpen(true)}
        onOpenBacklog={() => setIsBacklogOpen(true)}
        onOpenScriptImport={() => setIsScriptImportOpen(true)}
        onOpenPdfExport={() => setIsPdfExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetSample={handleResetSample}
        isAutoSaved={isAutoSaved}
      />

      {/* Mobile view toggle */}
      <div className="flex lg:hidden bg-slate-900 border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            mobileTab === 'editor'
              ? 'border-blue-500 text-blue-400 bg-slate-850'
              : 'border-transparent text-slate-400'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>에디터 패널</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
            mobileTab === 'preview'
              ? 'border-blue-500 text-blue-400 bg-slate-850'
              : 'border-transparent text-slate-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>실시간 미리보기</span>
        </button>
      </div>

      {/* Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor Panel */}
        <div className={`w-full lg:w-[460px] xl:w-[520px] shrink-0 h-full overflow-hidden ${
          mobileTab === 'editor' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
        }`}>
          <EditorPanel
            project={project}
            currentSceneIndex={currentSceneIndex}
            currentLineIndex={currentLineIndex}
            onNavigate={handleNavigate}
            onUpdateScene={handleUpdateScene}
            onAddScene={handleAddScene}
            onDuplicateScene={handleDuplicateScene}
            onDeleteScene={handleDeleteScene}
            onMoveScene={handleMoveScene}
            onUpdateCharacters={handleUpdateCharacters}
            onUpdateStyle={handleUpdateStyle}
          />
        </div>

        {/* Right: Live Visual Novel Preview Stage - Fills entire remaining space */}
        <div className={`flex-1 h-full bg-black overflow-hidden relative ${
          mobileTab === 'preview' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
        }`}>
          <NovelStage
            project={project}
            currentSceneIndex={currentSceneIndex}
            currentLineIndex={currentLineIndex}
            onNavigate={handleNavigate}
            onOpenSlideNavigator={() => setIsSlideNavOpen(true)}
            onOpenBacklog={() => setIsBacklogOpen(true)}
            onToggleCinemaMode={() => setIsCinemaOpen(true)}
            isCinemaMode={false}
          />
        </div>
      </div>

      {/* Fullscreen Theater / Cinema Mode */}
      <CinemaMode
        isOpen={isCinemaOpen}
        onClose={() => setIsCinemaOpen(false)}
        project={project}
        currentSceneIndex={currentSceneIndex}
        currentLineIndex={currentLineIndex}
        onNavigate={handleNavigate}
        onOpenSlideNavigator={() => setIsSlideNavOpen(true)}
        onOpenBacklog={() => setIsBacklogOpen(true)}
      />

      {/* Slide Navigator Modal (PPT thumbnail overview) */}
      <SlideNavigatorModal
        isOpen={isSlideNavOpen}
        onClose={() => setIsSlideNavOpen(false)}
        project={project}
        currentSceneIndex={currentSceneIndex}
        onSelectScene={handleNavigate}
        onAddScene={handleAddScene}
        onDuplicateScene={handleDuplicateScene}
        onDeleteScene={handleDeleteScene}
        onMoveScene={handleMoveScene}
      />

      {/* Backlog Modal */}
      <BacklogModal
        isOpen={isBacklogOpen}
        onClose={() => setIsBacklogOpen(false)}
        project={project}
        currentSceneIndex={currentSceneIndex}
        currentLineIndex={currentLineIndex}
        onJumpToLine={handleNavigate}
      />

      {/* Script Batch Importer Modal */}
      <ScriptImportModal
        isOpen={isScriptImportOpen}
        onClose={() => setIsScriptImportOpen(false)}
        project={project}
        onApplyScript={handleApplyScript}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={project.settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfExportOpen}
        onClose={() => setIsPdfExportOpen(false)}
        project={project}
      />
    </div>
  );
}
