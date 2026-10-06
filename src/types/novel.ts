export type CharacterExpression = 
  | 'neutral' 
  | 'happy' 
  | 'smile' 
  | 'angry' 
  | 'surprised' 
  | 'sad' 
  | 'blush' 
  | 'thinking';

export interface Character {
  id: string;
  name: string;
  color: string;
  isProtagonist: boolean;
  defaultPosition: 'left' | 'center' | 'right';
  gender?: 'male' | 'female';
  avatarUrl: string;
  expressions?: Partial<Record<CharacterExpression, string>>;
}

export type SceneCharacterPosition = 'auto' | 'left' | 'center' | 'right' | 'hidden';
export type CharacterEffect = 
  | 'none' 
  | 'fade-in' 
  | 'slide-side' 
  | 'slide-left' 
  | 'slide-right' 
  | 'slide-up' 
  | 'shake' 
  | 'nod' 
  | 'exclamation' 
  | 'question';
export type EmotionBubble = 'none' | 'heart' | 'sweat' | 'question' | 'exclamation' | 'dots' | 'sparkle';

export type BackgroundType = 'preset' | 'custom' | 'gradient';
export type BackgroundFilter = 'none' | 'sepia' | 'blur' | 'dark' | 'sunset' | 'night';

export interface SceneBackground {
  type: BackgroundType;
  value: string;
  filter?: BackgroundFilter;
}

export type TransitionType = 'fade' | 'slide' | 'dissolve' | 'flash' | 'none';
export type SoundEffectType = 'none' | 'click' | 'page' | 'surprise' | 'heartbeat' | 'door' | 'chime';

export type NarrationCharacterVisibility = 'keep' | 'hide';

// Individual dialogue line inside a scene
export interface DialogLine {
  id: string;
  speakerId: string | null; // null for narration / monologue
  speakerCustomName?: string;
  text: string;
  speakerExpression?: CharacterExpression | string;
  emotionBubble?: EmotionBubble;
  effect?: CharacterEffect;
  narrationCharacterVisibility?: NarrationCharacterVisibility; // 'keep' (default) or 'hide' (refresh stage / hide all characters)
  soundEffect?: SoundEffectType;
  screenShake?: boolean;
  note?: string;
}

// Scene: groups multiple dialogues, defines background, and selected cast characters via checkboxes
export interface Scene {
  id: string;
  title: string;
  background: SceneBackground;
  castCharacterIds: string[]; // Characters participating in this scene (checkbox selection)
  lines: DialogLine[]; // Multiple dialogues in this scene
  transition: TransitionType;
  note?: string;
}

export type FontFamilyType = 'sans' | 'dodum' | 'myeongjo' | 'orbit' | 'headline' | 'pixel';
export type BoxThemeType = 'dark' | 'glass' | 'pixel' | 'manga' | 'cyberpunk' | 'fantasy' | 'minimal';
export type FontSizeOption = 'small' | 'medium' | 'large' | 'xlarge';
export type BoxPosition = 'bottom' | 'center' | 'top';
export type NameBadgeStyle = 'ribbon' | 'badge' | 'minimal' | 'neon';

export interface StoryStyle {
  fontFamily: FontFamilyType;
  boxTheme: BoxThemeType;
  fontSize: FontSizeOption;
  boxOpacity: number; // 0.3 - 1.0
  boxPosition: BoxPosition;
  nameBadgeStyle: NameBadgeStyle;
  accentColor: string;
  textColor: string;
}

export type BgmMood = 'peaceful' | 'romantic' | 'mystery' | 'none';

export interface PlaybackSettings {
  textSpeed: number; // ms per char (0: instant, 15: fast, 35: normal, 70: slow)
  autoAdvance: boolean;
  autoDelay: number; // seconds
  sfxEnabled: boolean;
  typewriterSound: boolean;
  bgmEnabled: boolean;
  bgmMood: BgmMood;
  volume: number; // 0 to 1
}

export interface NovelProject {
  id: string;
  title: string;
  author: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  scenes: Scene[];
  characters: Character[];
  style: StoryStyle;
  settings: PlaybackSettings;
}
