import React, { useState } from 'react';
import { NovelProject, Scene, Character } from '../types/novel';
import { parseScriptTextToScenes, convertScenesToScriptText } from '../services/scriptParser';
import { X, FileText, Check, Copy, ArrowRight, Wand2 } from 'lucide-react';

interface ScriptImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
  onApplyScript: (newScenes: Scene[], updatedCharacters: Character[]) => void;
}

export const ScriptImportModal: React.FC<ScriptImportModalProps> = ({
  isOpen,
  onClose,
  project,
  onApplyScript,
}) => {
  const [scriptText, setScriptText] = useState(() => 
    convertScenesToScriptText(project.scenes, project.characters)
  );
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'append' | 'replace'>('replace');

  if (!isOpen) return null;

  const handleApply = () => {
    if (!scriptText.trim()) return;
    const { scenes: parsedScenes, updatedCharacters } = parseScriptTextToScenes(
      scriptText,
      project.characters,
      project.scenes[0]?.background.value || 'rooftop_sunset'
    );

    if (mode === 'replace') {
      onApplyScript(parsedScenes, updatedCharacters);
    } else {
      onApplyScript([...project.scenes, ...parsedScenes], updatedCharacters);
    }
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertSample = () => {
    const sample = `[배경: 노을빛 학교 옥상]
민수: 이제 곧 축제가 시작되는구나.
수아: (미소) 응, 민수 너랑 같이 준비할 수 있어서 정말 즐거웠어!
민수: (부끄) 나도... 정말 잊지 못할 추억이 될 것 같아.
시우: (놀람) 어이, 둘이서 여기서 뭐 하는 거야?
나레이션: 노을빛 아래 세 사람의 웃음소리가 은은하게 퍼져나갔다.`;
    setScriptText(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">대본 텍스트 일괄 작성 &amp; 변환</h2>
              <p className="text-xs text-slate-400">
                대본을 텍스트로 자유롭게 작성하면 화자, 감정(괄호), 배경을 자동 인식하여 장면을 생성합니다.
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

        {/* Action helper bar */}
        <div className="px-6 py-2.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-300">작성 규칙:</span>
            <span><code>화자: 대사</code></span>
            <span>•</span>
            <span><code>화자: (미소) 대사</code></span>
            <span>•</span>
            <span><code>[배경: 교실]</code></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInsertSample}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>예시 대본 불러오기</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사됨' : '대본 복사'}</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 p-6 flex flex-col">
          <textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            placeholder="여기에 대본을 입력하세요...&#10;&#10;[배경: 노을빛 학교 옥상]&#10;민수: 오늘 날씨 정말 좋네.&#10;수아: (미소) 응, 내일 축제도 기대된다!&#10;나레이션: 바람이 살랑살랑 불어왔다."
            className="w-full flex-1 p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono text-sm leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={mode === 'replace'}
                onChange={() => setMode('replace')}
                className="text-blue-500 focus:ring-0"
              />
              <span>전체 스토리 덮어쓰기</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={mode === 'append'}
                onChange={() => setMode('append')}
                className="text-blue-500 focus:ring-0"
              />
              <span>기존 스토리 뒤에 추가하기</span>
            </label>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg"
            >
              <span>스토리에 적용하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
