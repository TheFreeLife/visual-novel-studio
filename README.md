<div align="center">

# 🎭 NovelStudio (비주얼 노벨 연출 스튜디오)

**대본과 시나리오를 실시간으로 살아 숨쉬는 비주얼 노벨로 연출하고 감상하는 원페이지 웹 스튜디오**

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-7.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Web_Audio_API-Built--in_Synth-F59E0B?style=for-the-badge" alt="Web Audio API" />
  <img src="https://img.shields.io/badge/IndexedDB-Auto--Save-10B981?style=for-the-badge" alt="IndexedDB" />
</p>

[소개](#-프로젝트-소개) • [주요 기능](#-주요-기능) • [대본 작성 문법](#-대본-작성-문법-가이드) • [기술 스택](#-기술-스택) • [시작하기](#-시작하기) • [디렉토리 구조](#-프로젝트-구조)

---

</div>

## 📖 프로젝트 소개

**NovelStudio**는 작가, 크리에이터, 시나리오 기획자가 텍스트로 작성한 스토리와 대본을 별도의 코딩 없이 웹 브라우저에서 즉시 **몰입감 넘치는 인터랙티브 비주얼 노벨** 형태로 시각화하고 연출할 수 있는 웹 기반 연출 스튜디오 & 시뮬레이터입니다.

일반 텍스트 대본을 복사하여 붙여넣는 것만으로 장면, 인물, 대사, 감정 표정이 자동으로 분해 및 파싱되며, 실시간 무대 프리뷰를 보면서 카메라 앵글, 캐릭터 연출, 배경 전환, 타이프라이터 효과, 신디사이저 BGM까지 디테일하게 튜닝할 수 있습니다.

---

## ✨ 주요 기능

### 1. 🎬 실시간 비주얼 노벨 무대 (Novel Stage)
- **16:9 시네마틱 반응형 캔버스**: 모바일, 태블릿, 데스크톱 어디서든 완벽한 비율로 렌더링.
- **지능형 2인 무대 배칭 시스템**:
  - 화면의 복잡도를 낮추기 위해 무대 위 최대 2명 동시 배치.
  - 대사 발화 시점에 비로소 무대에 등장하며, 3번째 인물 발언 시 LRU(최소 최근 발화) 알고리즘으로 자연스럽게 교체.
- **다채로운 캐릭터 액션 & 감정**:
  - 8가지 표정 (`neutral`, `happy`, `smile`, `angry`, `surprised`, `sad`, `blush`, `thinking`)
  - 10종의 액션 이펙트 (슬라이드 인, 페이드, 끄덕임, 화면 흔들림, 깜짝 놀람 점프 등)
  - 감정 말풍선 팝업 (하트, 땀방울, 느낌표, 물음표, 반짝임 등)
- **배경 트랜지션 & 필터**:
  - 장면 전환 효과: Fade, Slide, Dissolve, Flash
  - 분위기 필터: Sepia(회상), Blur(흐림), Dark(어두움), Sunset(노을), Night(야간)

### 2. 📝 스마트 텍스트 대본 파서 (Script Importer)
- 일반 소설/시나리오 텍스트를 붙여넣기만 하면 자동으로 분석하여 프로젝트 씬과 대사로 변환.
- 등장인물 자동 등록, 대사 추출, 괄호 속 감정 키워드(`(미소)`, `(당황)`, `(화남)`) 자동 인식.
- 작성된 비주얼 노벨을 다시 텍스트 대본으로 양방향 변환/내보내기 지원.

### 3. 🎨 정교한 스튜디오 편집기 (Editor Panel)
- **장면 상세 편집 (Scene Detail)**: 현재 장면의 배경, 등장인물 체크박스 캐스팅, 대사별 화자/표정/사운드/효과/지문 세밀 편집.
- **장면 목록 관리 (Scene List)**: 전체 씬 한눈에 보기, 드래그/버튼으로 순서 이동, 씬 복제 및 삭제.
- **인물 관리 (Cast Manager)**: 캐릭터 추가/수정, 테마 색상, 성별, 주인공 지정, 고유 SVG 아바타 생성기 및 커스텀 이미지 URL 지원.
- **대사창 UI 스타일러 (Style Customizer)**:
  - **폰트 (6종)**: Noto Sans, 고운돋움, 나눔명조, Orbit, 블랙한산스, VT323 픽셀
  - **대사창 테마 (7종)**: 다크 모던, 글래스모피즘, 레트로 픽셀, 만화 말풍선, 사이버펑크, 판타지, 미니멀
  - **위치 & 디테일**: 하단/중앙/상단 배치, 투명도 조절, 네온/리본/뱃지 이름표 스타일 커스텀

### 4. 🎵 브라우저 내장 사운드 & BGM 신디사이저 (Web Audio API)
- 무거운 외부 MP3 파일 다운로드 없이 **Web Audio API 오실레이터 합성 엔진**으로 즉각 재생.
- **타이프라이터 사운드**: 글자가 타이핑될 때마다 레트로 비주얼 노벨 특유의 부드러운 블립(Blip) 타건음 출력.
- **상황별 SFX**: 버튼 클릭, 책장 넘김, 깜짝 놀람, 심장 박동(Heartbeat), 문 열림, 차임벨 등.
- **동적 BGM 생성**: 잔잔한 일상(Peaceful), 로맨틱(Romantic), 미스터리/긴장(Mystery) 무드별 실시간 아르페지오/화음 루프 재생.

### 5. 🛠️ 작업 편의 및 출력 기능
- **시네마 모드 (Cinema Mode)**: 편집 UI를 숨기고 오직 감상에 집중할 수 있는 몰입형 전체화면 모드.
- **슬라이드 내비게이터 (Slide Navigator)**: 슬라이드 덱처럼 전체 장면과 대사 흐름을 썸네일 카드로 탐색하고 원하는 위치로 즉시 점프.
- **대사 백로그 (Backlog)**: 이전 지나간 대사와 지문을 한눈에 열람.
- **안전한 데이터 보관**: IndexedDB를 통한 실시간 자동 저장(Auto-save) 및 JSON 프로젝트 파일 백업/불러오기.
- **PDF 시나리오 출력**: jsPDF 기반 한글 폰트가 적용된 인쇄용/기획서용 대본 PDF 내보내기 지원.

---

## 📑 대본 작성 문법 가이드

`대본 가져오기(Script Import)` 기능을 사용할 때 아래와 같은 간결한 문법을 사용할 수 있습니다.

```text
[장면: 방과 후 옥상]
[배경: rooftop_sunset]

나레이션: 방과 후, 노을이 붉게 물든 학교 옥상. 바람이 선선하게 불어온다.

민수: (생각) 오늘도 먼저 와서 기다리고 있는 걸까?
지우: (미소) 어? 민수야, 일찍 왔네!
민수: (부끄) 응, 네가 오라고 해서 서둘러 왔지.

[장면: 교실에서의 대화]
[배경: classroom_day]

지우: (놀람) 정말? 그렇게 서둘러 올 줄은 몰랐어!
민수: (행복) 당연하지, 너랑 약속한 거니까.
```

### 파서 인식 규칙
| 항목 | 문법 예시 | 설명 |
| :--- | :--- | :--- |
| **장면 구분** | `[장면: 옥상]` 또는 `[SCENE: 옥상]` | 새로운 장면(Scene) 생성 및 제목 지정 |
| **배경 지정** | `[배경: 노을빛]` 또는 `[BG: rooftop_sunset]` | 프리셋 배경 이름 또는 키워드로 자동 매칭 |
| **대사 입력** | `캐릭터이름: 대사내용` | 인물 자동 생성 및 해당 인물의 대사로 등록 |
| **감정 지정** | `캐릭터: (미소) 안녕!` | 괄호 안의 키워드를 분석하여 표정(`smile`) 자동 지정 |
| **나레이션** | `나레이션: 바람이 분다.` 또는 콜론 없는 일반 문장 | 화자가 없는 지문/나레이션으로 등록 |

> **지원 표정 키워드:** `미소`/`웃음`(smile), `기쁨`/`환호`(happy), `화`/`분노`(angry), `놀람`/`당황`(surprised), `슬픔`/`눈물`(sad), `부끄`/`홍조`(blush), `생각`/`고민`(thinking)

---

## 🛠 기술 스택

| 영역 | 기술 / 라이브러리 | 사용 목적 |
| :--- | :--- | :--- |
| **Core** | `React 19`, `TypeScript 7` | 최신 리액트 아키텍처 및 엄격한 타입 안정성 |
| **Build & Tooling** | `Vite 8` | 초고속 HMR 및 최적화 번들링 |
| **Styling** | `Tailwind CSS v4` | 차세대 CSS 엔진을 통한 빠른 반응형 스타일링 |
| **Animations** | `Motion (Framer Motion)`, `CSS Keyframes` | 부드러운 캐릭터 전환, 이펙트, 말풍선 팝업 |
| **Icons** | `Lucide React` | 직관적인 에디터 및 플레이어 아이콘 세트 |
| **Audio** | `Web Audio API` | 외부 리소스 의존 없는 내장 사운드/BGM 합성 |
| **Storage** | `IndexedDB` | 대용량 프로젝트 실시간 로컬 자동 저장 |
| **Export** | `jsPDF`, `canvas-confetti` | 시나리오 대본 PDF 출력 및 연출 축하 효과 |

---

## 🚀 시작하기

### 사전 요구 사항
- **Node.js** (v18 이상 권장)
- **npm** (또는 bun, pnpm, yarn)

### 설치 및 로컬 실행

1. **저장소 클론 및 이동**
   ```bash
   git clone <repository-url>
   cd visual-novel-studio
   ```

2. **패키지 설치**
   ```bash
   npm install
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   브라우저에서 `http://localhost:3000`으로 접속하여 스튜디오를 확인합니다.

4. **프로덕션 빌드**
   ```bash
   npm run build
   ```

---

## 📂 프로젝트 구조

```text
visual-novel-studio/
├── public/
│   └── resources/              # 기본 캐릭터 아바타 및 배경 이미지
│       ├── backgrounds/        # 고화질 프리셋 배경 (교실, 옥상, 방, 공원, 야경)
│       └── default_*.png       # 기본 캐릭터 스프라이트
├── src/
│   ├── components/             # React UI 컴포넌트
│   │   ├── NovelStage.tsx      # 실시간 비주얼 노벨 캔버스 & 인터랙션 무대
│   │   ├── EditorPanel.tsx     # 장면/대사/인물/스타일 통합 편집기
│   │   ├── Header.tsx          # 상단 네비게이션, 저장 상태, 내보내기/가져오기
│   │   ├── CinemaMode.tsx      # 풀스크린 몰입형 시네마 감상 모드
│   │   ├── SlideNavigatorModal.tsx # 슬라이드형 장면/대사 썸네일 탐색기
│   │   ├── BacklogModal.tsx    # 대사 히스토리(백로그) 모달
│   │   ├── ScriptImportModal.tsx   # 텍스트 대본 파싱 및 임포트 모달
│   │   ├── SettingsModal.tsx   # 재생 속도, 오디오, 타건음 설정
│   │   └── PdfExportModal.tsx  # 대본 PDF 내보내기 모달
│   ├── data/
│   │   └── presetAssets.ts     # 샘플 프로젝트, 배경 프리셋, SVG 아바타 생성기
│   ├── services/
│   │   ├── audio.ts            # Web Audio API 기반 SFX & BGM 신디사이저
│   │   ├── db.ts               # IndexedDB 로컬 저장소 서비스
│   │   ├── pdf.ts              # jsPDF 시나리오 출력 서비스
│   │   └── scriptParser.ts     # 텍스트 대본 파서 및 무대 인물 배치 알고리즘 (LRU)
│   ├── types/
│   │   └── novel.ts            # 프로젝트 데이터 모델 타입 정의
│   ├── App.tsx                 # 최상위 상태 관리 및 오토세이브 파이프라인
│   ├── main.tsx                # 진입점
│   └── index.css               # Tailwind v4 및 연출 키프레임 애니메이션
├── metadata.json               # 프로젝트 메타데이터
├── package.json
└── vite.config.ts
```

---

## 💡 주요 단축키 & 팁

- **대사 넘기기**: 무대 화면 클릭 또는 `Space` / `Enter` 키
- **슬라이드 점프**: 상단 내비게이터 버튼을 통해 원하는 씬의 대사로 바로 건너뛰기
- **자동 진행**: 하단의 `Auto` 재생 버튼을 켜두면 지정된 딜레이에 맞춰 자동으로 대사가 넘어갑니다.
- **사운드 활성화**: 브라우저의 오디오 정책에 따라 화면 첫 클릭 시 BGM과 사운드 이펙트가 활성화됩니다.

---

<div align="center">
  <sub>Made with ❤️ for storytellers and visual novel creators.</sub>
</div>
