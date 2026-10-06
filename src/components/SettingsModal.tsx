import React from 'react';
import { PlaybackSettings, BgmMood } from '../types/novel';
import { soundService } from '../services/audio';
import { X, Sliders, Volume2, Music, Zap, Clock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlaybackSettings;
  onUpdateSettings: (newSettings: PlaybackSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleChange = <K extends keyof PlaybackSettings>(key: K, value: PlaybackSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);

    // Apply immediate audio effects
    if (key === 'volume') {
      soundService.setVolume(value as number);
    }
    if (key === 'bgmEnabled' || key === 'bgmMood') {
      const willEnable = key === 'bgmEnabled' ? (value as boolean) : settings.bgmEnabled;
      const mood = key === 'bgmMood' ? (value as BgmMood) : settings.bgmMood;
      if (willEnable) {
        soundService.startBgm(mood);
      } else {
        soundService.stopBgm();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">스토리 실행 및 연출 환경설정</h2>
              <p className="text-xs text-slate-400">대사 출력 속도, 자동 넘김, 오디오 사운드를 설정합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Section: Text Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                대사 텍스트 출력 속도 (타자기 효과)
              </label>
              <span className="text-xs font-mono text-amber-400 font-semibold">
                {settings.textSpeed === 0 ? '즉시 표시' : `${settings.textSpeed} ms / 글자`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '즉시', value: 0 },
                { label: '빠름', value: 15 },
                { label: '보통', value: 30 },
                { label: '느림', value: 65 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('textSpeed', opt.value)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    settings.textSpeed === opt.value
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Auto Advance */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  자동 재생 (Auto Play)
                </span>
                <p className="text-[11px] text-slate-400">대사가 모두 출력된 후 일정 시간 뒤 다음 장면으로 이동</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAdvance}
                onChange={(e) => handleChange('autoAdvance', e.target.checked)}
                className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {settings.autoAdvance && (
              <div className="space-y-1.5 pl-6 pt-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>다음 장면 대기 시간:</span>
                  <span className="font-mono text-blue-400 font-bold">{settings.autoDelay}초</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={settings.autoDelay}
                  onChange={(e) => handleChange('autoDelay', parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Section: Audio & Sound Effects */}
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  효과음 (SFX) 활성화
                </span>
                <p className="text-[11px] text-slate-400">클릭음, 문 여는 소리, 충격음, 딩동 등 사운드 연출</p>
              </div>
              <input
                type="checkbox"
                checked={settings.sfxEnabled}
                onChange={(e) => handleChange('sfxEnabled', e.target.checked)}
                className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Typewriter sound */}
            <div className="flex items-center justify-between pl-6">
              <div>
                <span className="text-xs text-slate-300">타자기 글자 출력음</span>
                <p className="text-[11px] text-slate-500">글자가 떠오를 때 가벼운 틱틱 효과음 재생</p>
              </div>
              <input
                type="checkbox"
                disabled={!settings.sfxEnabled}
                checked={settings.typewriterSound}
                onChange={(e) => handleChange('typewriterSound', e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* BGM Toggle */}
            <div className="flex items-center justify-between pl-6 pt-1">
              <div>
                <span className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-purple-400" />
                  배경음악 (BGM) 자동 생성 루프
                </span>
                <p className="text-[11px] text-slate-500">웹 오디오 신디사이저로 분위기 있는 피아노/패드 루프 재생</p>
              </div>
              <input
                type="checkbox"
                checked={settings.bgmEnabled}
                onChange={(e) => handleChange('bgmEnabled', e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* BGM Mood */}
            {settings.bgmEnabled && (
              <div className="pl-6 space-y-1.5">
                <span className="text-xs text-slate-400">BGM 분위기:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'peaceful', label: '평화로운 일상' },
                    { id: 'romantic', label: '풋풋한 로맨스' },
                    { id: 'mystery', label: '신비 & 미스터리' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleChange('bgmMood', m.id as BgmMood)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        settings.bgmMood === m.id
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Master Volume */}
            <div className="pl-6 space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>마스터 볼륨:</span>
                <span className="font-mono text-emerald-400 font-bold">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
