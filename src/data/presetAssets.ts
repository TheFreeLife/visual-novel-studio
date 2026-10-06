import { Character, NovelProject, StoryStyle, PlaybackSettings } from '../types/novel';

// 5 unique high-quality scenic backgrounds (no duplicates, 1:1 mapped to png assets)
export const PRESET_BACKGROUNDS = [
  {
    id: 'rooftop_sunset',
    name: '노을빛 학교 옥상',
    category: '학교',
    image: '/resources/backgrounds/rooftop_sunset.png',
    preview: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #6366f1 100%)',
  },
  {
    id: 'classroom_day',
    name: '화사한 교실',
    category: '학교',
    image: '/resources/backgrounds/classroom_day.png',
    preview: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 50%, #fed7aa 100%)',
  },
  {
    id: 'cozy_room',
    name: '아늑한 저녁 방',
    category: '실내',
    image: '/resources/backgrounds/cozy_room.png',
    preview: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #d97706 100%)',
  },
  {
    id: 'park_cherry',
    name: '화사한 벚꽃 공원',
    category: '야외',
    image: '/resources/backgrounds/park_cherry.png',
    preview: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 50%, #38bdf8 100%)',
  },
  {
    id: 'city_night',
    name: '화려한 도시 야경',
    category: '도시',
    image: '/resources/backgrounds/city_night.png',
    preview: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
  }
];

// Helper to generate expressive anime avatar SVGs
export function generateCharacterAvatar(gender: 'male' | 'female', hairColor: string, styleSeed: number, expression: string = 'neutral'): string {
  let eyeLeft = `<ellipse cx="160" cy="205" rx="14" ry="18" fill="#1e293b" /><ellipse cx="163" cy="199" rx="5" ry="6" fill="#ffffff" />`;
  let eyeRight = `<ellipse cx="240" cy="205" rx="14" ry="18" fill="#1e293b" /><ellipse cx="243" cy="199" rx="5" ry="6" fill="#ffffff" />`;
  let mouth = `<path d="M 190 265 Q 200 272 210 265" stroke="#be123c" stroke-width="3" fill="none" stroke-linecap="round" />`;
  let eyebrows = `<path d="M 145 180 Q 160 176 175 180" stroke="${hairColor}" stroke-width="4" fill="none" /><path d="M 225 180 Q 240 176 255 180" stroke="${hairColor}" stroke-width="4" fill="none" />`;
  let blush = '';

  if (expression === 'smile' || expression === 'happy') {
    eyeLeft = `<path d="M 146 208 Q 160 192 174 208" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round" />`;
    eyeRight = `<path d="M 226 208 Q 240 192 254 208" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round" />`;
    mouth = `<path d="M 188 260 Q 200 282 212 260 Z" fill="#f43f5e" stroke="#be123c" stroke-width="2" />`;
    blush = `<ellipse cx="140" cy="235" rx="18" ry="10" fill="#fb7185" opacity="0.6" /><ellipse cx="260" cy="235" rx="18" ry="10" fill="#fb7185" opacity="0.6" />`;
  } else if (expression === 'angry') {
    eyebrows = `<path d="M 145 174 L 175 186" stroke="${hairColor}" stroke-width="5" fill="none" /><path d="M 225 186 L 255 174" stroke="${hairColor}" stroke-width="5" fill="none" />`;
    mouth = `<path d="M 188 272 Q 200 262 212 272" stroke="#be123c" stroke-width="4" fill="none" stroke-linecap="round" />`;
  } else if (expression === 'surprised') {
    eyeLeft = `<ellipse cx="160" cy="205" rx="18" ry="22" fill="#1e293b" /><ellipse cx="164" cy="198" rx="7" ry="8" fill="#ffffff" />`;
    eyeRight = `<ellipse cx="240" cy="205" rx="18" ry="22" fill="#1e293b" /><ellipse cx="244" cy="198" rx="7" ry="8" fill="#ffffff" />`;
    mouth = `<ellipse cx="200" cy="270" rx="12" ry="16" fill="#e11d48" />`;
    eyebrows = `<path d="M 145 168 Q 160 160 175 168" stroke="${hairColor}" stroke-width="4" fill="none" /><path d="M 225 168 Q 240 160 255 168" stroke="${hairColor}" stroke-width="4" fill="none" />`;
  } else if (expression === 'sad') {
    eyebrows = `<path d="M 145 186 Q 160 174 175 186" stroke="${hairColor}" stroke-width="4" fill="none" /><path d="M 225 186 Q 240 174 255 186" stroke="${hairColor}" stroke-width="4" fill="none" />`;
    mouth = `<path d="M 190 272 Q 200 264 210 272" stroke="#be123c" stroke-width="3" fill="none" stroke-linecap="round" />`;
    blush = `<path d="M 155 220 Q 155 240 152 248" stroke="#38bdf8" stroke-width="3" fill="none" opacity="0.8" />`;
  } else if (expression === 'blush') {
    eyeLeft = `<path d="M 148 206 Q 160 196 172 206" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round" />`;
    eyeRight = `<path d="M 228 206 Q 240 196 252 206" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round" />`;
    mouth = `<ellipse cx="200" cy="266" rx="8" ry="8" fill="#fda4af" stroke="#f43f5e" stroke-width="2" />`;
    blush = `<ellipse cx="140" cy="235" rx="22" ry="14" fill="#f43f5e" opacity="0.75" filter="blur(2px)" /><ellipse cx="260" cy="235" rx="22" ry="14" fill="#f43f5e" opacity="0.75" filter="blur(2px)" />`;
  } else if (expression === 'thinking') {
    eyebrows = `<path d="M 145 178 L 175 180" stroke="${hairColor}" stroke-width="4" fill="none" /><path d="M 225 172 Q 240 166 255 176" stroke="${hairColor}" stroke-width="4" fill="none" />`;
    eyeRight = `<path d="M 228 206 Q 240 196 252 206" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round" />`;
    mouth = `<line x1="192" y1="268" x2="208" y2="268" stroke="#be123c" stroke-width="3" stroke-linecap="round" />`;
  }

  const hairSvg = gender === 'female' 
    ? `<!-- Long hair -->
       <path d="M 100 160 C 80 260 70 380 90 480 C 120 480 140 380 140 280 Z" fill="${hairColor}" />
       <path d="M 300 160 C 320 260 330 380 310 480 C 280 480 260 380 260 280 Z" fill="${hairColor}" />
       <path d="M 110 170 C 130 90 270 90 290 170 C 270 140 250 160 230 140 C 210 160 190 140 170 160 C 150 140 130 160 110 170 Z" fill="${hairColor}" />
       <path d="M 110 170 Q 130 220 130 250 Q 120 220 100 180 Z" fill="${hairColor}" />
       <path d="M 290 170 Q 270 220 270 250 Q 280 220 300 180 Z" fill="${hairColor}" />`
    : `<!-- Neat Male hair -->
       <path d="M 110 170 C 120 80 280 80 290 170 C 270 130 250 150 230 130 C 210 150 190 130 170 150 C 150 130 130 160 110 170 Z" fill="${hairColor}" />
       <path d="M 115 160 L 125 220 L 135 180 Z" fill="${hairColor}" />
       <path d="M 285 160 L 275 220 L 265 180 Z" fill="${hairColor}" />`;

  const clothes = gender === 'female'
    ? `<polygon points="120,380 280,380 310,500 90,500" fill="#f8fafc" />
       <polygon points="140,380 260,380 290,440 200,470 110,440" fill="#1e3a8a" />
       <polygon points="180,450 220,450 200,490" fill="#e11d48" />`
    : `<polygon points="110,370 290,370 320,500 80,500" fill="#1e293b" />
       <polygon points="160,370 240,370 200,450" fill="#f8fafc" />
       <polygon points="194,400 206,400 200,470" fill="#2563eb" />`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
      <rect x="175" y="270" width="50" height="90" fill="#fed7aa" />
      <polygon points="175,320 225,320 200,340" fill="#fbcfe8" opacity="0.3" />
      ${clothes}
      <path d="M 130 180 C 130 130 270 130 270 180 C 270 240 240 290 200 300 C 160 290 130 240 130 180 Z" fill="#ffedd5" />
      ${eyebrows}
      ${eyeLeft}
      ${eyeRight}
      <circle cx="200" cy="242" r="2.5" fill="#f97316" opacity="0.5" />
      ${mouth}
      ${blush}
      ${hairSvg}
    </svg>
  `)}`;
}

// Default silhouette avatar assets for unassigned character photos
export const DEFAULT_AVATAR_IMAGES = {
  male: '/resources/default_male.png',
  female: '/resources/default_female.png',
} as const;

export function getCharacterAvatarUrl(char?: Partial<Character> | null): string {
  if (char?.avatarUrl && char.avatarUrl.trim().length > 0) {
    return char.avatarUrl;
  }
  return char?.gender === 'female' ? DEFAULT_AVATAR_IMAGES.female : DEFAULT_AVATAR_IMAGES.male;
}

// Preset Characters (Default silhouette images until user uploads character images)
export const PRESET_CHARACTERS: Character[] = [
  {
    id: 'char_minsoo',
    name: '민수 (주인공)',
    color: '#3b82f6',
    isProtagonist: true,
    gender: 'male',
    defaultPosition: 'left',
    avatarUrl: '',
  },
  {
    id: 'char_suah',
    name: '수아',
    color: '#ec4899',
    isProtagonist: false,
    gender: 'female',
    defaultPosition: 'right',
    avatarUrl: '',
  },
  {
    id: 'char_siwoo',
    name: '시우',
    color: '#8b5cf6',
    isProtagonist: false,
    gender: 'male',
    defaultPosition: 'right',
    avatarUrl: '',
  },
  {
    id: 'char_haeun',
    name: '하은 선배',
    color: '#10b981',
    isProtagonist: false,
    gender: 'female',
    defaultPosition: 'right',
    avatarUrl: '',
  }
];

export const DEFAULT_STYLE: StoryStyle = {
  fontFamily: 'dodum',
  boxTheme: 'dark',
  fontSize: 'medium',
  boxOpacity: 0.88,
  boxPosition: 'bottom',
  nameBadgeStyle: 'ribbon',
  accentColor: '#3b82f6',
  textColor: '#ffffff'
};

export const DEFAULT_SETTINGS: PlaybackSettings = {
  textSpeed: 30,
  autoAdvance: false,
  autoDelay: 3,
  sfxEnabled: true,
  typewriterSound: true,
  bgmEnabled: true,
  bgmMood: 'peaceful',
  volume: 0.7
};

export const SAMPLE_PROJECT: NovelProject = {
  id: 'project_after_school_secret',
  title: '방과 후의 옥상 비밀',
  author: '노벨 감독관',
  description: '노을 지는 학교 옥상에서 우연히 마주친 두 사람의 풋풋한 이야기',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  characters: PRESET_CHARACTERS,
  style: DEFAULT_STYLE,
  settings: DEFAULT_SETTINGS,
  scenes: [
    {
      id: 'sc_1',
      title: '장면 1: 노을빛 옥상의 조우',
      background: {
        type: 'preset',
        value: 'rooftop_sunset',
        filter: 'none'
      },
      castCharacterIds: ['char_minsoo', 'char_suah'],
      transition: 'fade',
      note: '오프닝 씬. 조용한 바람과 석양 속에서 시작.',
      lines: [
        {
          id: 'line_1_1',
          speakerId: null,
          text: '수업이 모두 끝난 조용한 방과 후.\n나는 가끔 바람을 쐬러 옥상 철창 앞에 서곤 한다.',
          note: '도입부 독백 (무대 리프레시 배경 뷰)',
          narrationCharacterVisibility: 'hide'
        },
        {
          id: 'line_1_2',
          speakerId: 'char_minsoo',
          text: '하아... 벌써 해가 지고 있네.\n오늘 문화제 준비는 도대체 언제 끝나는 걸까?',
          speakerExpression: 'thinking',
          emotionBubble: 'dots'
        },
        {
          id: 'line_1_3',
          speakerId: null,
          text: '— 끼이익...\n등 뒤에서 낡은 옥상 철문이 열리는 소리가 들려왔다.',
          soundEffect: 'door',
          screenShake: true
        },
        {
          id: 'line_1_4',
          speakerId: 'char_suah',
          text: '어? 민수 너... 여기서 뭐 하고 있어?\n다들 밑에서 찾고 있었는데!',
          speakerExpression: 'surprised',
          emotionBubble: 'question',
          soundEffect: 'surprise'
        },
        {
          id: 'line_1_5',
          speakerId: 'char_minsoo',
          text: '수, 수아야?! 아니, 잠깐 바람 좀 쐬려고...\n그보다 네 손에 든 건 뭐야?',
          speakerExpression: 'blush',
          emotionBubble: 'sweat',
          effect: 'shake'
        },
        {
          id: 'line_1_6',
          speakerId: 'char_suah',
          text: '이, 이거?! 아, 아무것도 아니야!\n그냥... 우리 반 포스터 스케치 연습하던 것뿐인데...',
          speakerExpression: 'blush',
          emotionBubble: 'heart',
          effect: 'shake',
          soundEffect: 'heartbeat'
        }
      ]
    },
    {
      id: 'sc_2',
      title: '장면 2: 시우의 기습 참전',
      background: {
        type: 'preset',
        value: 'rooftop_sunset',
        filter: 'sunset'
      },
      castCharacterIds: ['char_minsoo', 'char_suah', 'char_siwoo'],
      transition: 'none',
      note: '시우 등장으로 활기찬 분위기 전환.',
      lines: [
        {
          id: 'line_2_1',
          speakerId: 'char_siwoo',
          text: '호오, 아무것도 아니라기엔 표정이 너무 솔직한데, 수아야?',
          speakerExpression: 'smile',
          emotionBubble: 'sparkle',
          soundEffect: 'chime'
        },
        {
          id: 'line_2_2',
          speakerId: 'char_minsoo',
          text: '시우 너까지 언제 올라온 거야?!',
          speakerExpression: 'surprised',
          emotionBubble: 'exclamation'
        },
        {
          id: 'line_2_3',
          speakerId: 'char_suah',
          text: '정말... 둘 다 날 놀리는 게 재미있나 봐!',
          speakerExpression: 'angry',
          emotionBubble: 'sweat'
        },
        {
          id: 'line_2_4',
          speakerId: null,
          text: '시우의 능청스러운 말에 옥상 가득 웃음소리가 번졌다.\n붉게 물든 하늘 아래, 우리의 문화제는 이렇게 시작되고 있었다.',
          soundEffect: 'chime'
        }
      ]
    },
    {
      id: 'sc_3',
      title: '장면 3: 다음 날의 교실',
      background: {
        type: 'preset',
        value: 'classroom_day',
        filter: 'none'
      },
      castCharacterIds: ['char_minsoo', 'char_suah', 'char_haeun'],
      transition: 'fade',
      note: '배경이 교실로 전환됨. 하은 선배 합류.',
      lines: [
        {
          id: 'line_3_1',
          speakerId: null,
          text: '다음 날 아침, 축제 준비로 북적이는 교실 안.'
        },
        {
          id: 'line_3_2',
          speakerId: 'char_haeun',
          text: '민수 군, 수아 양. 옥상에서 기획한 포스터 시안 정말 훌륭했어.',
          speakerExpression: 'smile',
          emotionBubble: 'sparkle',
          soundEffect: 'chime'
        },
        {
          id: 'line_3_3',
          speakerId: 'char_minsoo',
          text: '감사합니다, 선배! 수아가 밤늦게까지 열심히 그려준 덕분이에요.',
          speakerExpression: 'happy',
          emotionBubble: 'sparkle'
        },
        {
          id: 'line_3_4',
          speakerId: 'char_suah',
          text: '에헤헤, 다 같이 힘을 합친 결과지!\n오늘 문화제 부스 운영도 힘내자!',
          speakerExpression: 'happy',
          emotionBubble: 'heart'
        }
      ]
    }
  ]
};
