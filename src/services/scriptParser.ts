import { Character, CharacterExpression, DialogLine, Scene } from '../types/novel';
import { PRESET_BACKGROUNDS, generateCharacterAvatar } from '../data/presetAssets';

function getRecentExpression(
  charId: string,
  targetIdx: number,
  lines?: DialogLine[],
  activeLine?: DialogLine,
  fallback: string = 'neutral'
): string {
  if (activeLine?.speakerId === charId && activeLine.speakerExpression) {
    return activeLine.speakerExpression;
  }
  if (!lines || lines.length === 0) return fallback;
  for (let i = targetIdx; i >= 0; i--) {
    const l = lines[i];
    if (l && l.speakerId === charId && l.speakerExpression) {
      return l.speakerExpression;
    }
  }
  return fallback;
}

// Resolves actual position ('left' | 'right') for characters on stage in the current scene/line
// Rule: At most 2 characters are displayed simultaneously on stage ("세명 이상 배치하지 않음").
// When a 3rd character speaks, they replace whichever character spoke least recently (LRU).
export function resolveScenePositions(
  castCharacterIds: string[],
  allCharacters: Character[],
  activeSpeakerId: string | null,
  activeLine?: DialogLine,
  sceneLines?: DialogLine[],
  currentLineIndex: number = 0
): Array<{
  characterId: string;
  character: Character;
  resolvedPosition: 'left' | 'center' | 'right';
  expression: string;
  isSpeaker: boolean;
  effect?: string;
  emotionBubble?: string;
}> {
  if (!castCharacterIds || castCharacterIds.length === 0) return [];

  const charMap = new Map(allCharacters.map((c) => [c.id, c]));
  const cast = castCharacterIds
    .map((id) => charMap.get(id))
    .filter((c): c is Character => !!c);

  if (cast.length === 0) return [];

  // Determine target line index
  const targetIdx = typeof currentLineIndex === 'number' && currentLineIndex >= 0
    ? currentLineIndex
    : (activeLine && sceneLines ? Math.max(0, sceneLines.findIndex((l) => l.id === activeLine.id)) : 0);

  // Check how many unique speakers appear in the scene in total
  const allSceneSpeakers = new Set<string>();
  if (sceneLines) {
    for (const l of sceneLines) {
      if (l.speakerId && castCharacterIds.includes(l.speakerId)) {
        allSceneSpeakers.add(l.speakerId);
      }
    }
  }
  const isSoloScene = allSceneSpeakers.size <= 1;

  interface SlotState {
    characterId: string;
    lastSpokenIndex: number;
  }

  // Slots on screen: null initially (미리 등장하지 않음)
  let leftSlot: SlotState | null = null;
  let rightSlot: SlotState | null = null;

  // Simulate dialogue up to targetIdx:
  // "자기 대사 나올 때 비로소 등장, 미리 등장시키지 말 것"
  if (sceneLines && sceneLines.length > 0) {
    const maxIdx = Math.min(targetIdx, sceneLines.length - 1);
    for (let i = 0; i <= maxIdx; i++) {
      const line = sceneLines[i];
      if (!line) continue;

      // 나레이션이고 무대 리프레시(hide)인 경우 화면의 인물 초기화
      if (!line.speakerId && line.narrationCharacterVisibility === 'hide') {
        leftSlot = null;
        rightSlot = null;
        continue;
      }

      const speakerId = line.speakerId;
      if (!speakerId) continue; // 일반 나레이션은 기존 등장한 인물 유지

      // 캐스트에 포함된 인물인지 확인
      const speakerChar = charMap.get(speakerId);
      if (!speakerChar || !castCharacterIds.includes(speakerId)) continue;

      // 이미 화면 슬롯에 있는가?
      if (leftSlot && leftSlot.characterId === speakerId) {
        leftSlot.lastSpokenIndex = i;
      } else if (rightSlot && rightSlot.characterId === speakerId) {
        rightSlot.lastSpokenIndex = i;
      } else {
        // 새로운 화자가 처음으로 대사를 하여 무대에 등장!
        if (!leftSlot && !rightSlot) {
          // [사용자 규칙] 무대에 아무런 인물이 없는 상태에서 첫 발언자는 무조건 왼쪽으로 배치
          leftSlot = { characterId: speakerId, lastSpokenIndex: i };
        } else if (!leftSlot) {
          leftSlot = { characterId: speakerId, lastSpokenIndex: i };
        } else if (!rightSlot) {
          if (speakerChar.isProtagonist) {
            // 주인공이 뒤늦게 등장할 때, 주인공은 항상 좌측에 위치해야 하므로 기존 좌측 인물을 우측으로 밀고 주인공이 좌측 차지
            rightSlot = leftSlot;
            leftSlot = { characterId: speakerId, lastSpokenIndex: i };
          } else {
            rightSlot = { characterId: speakerId, lastSpokenIndex: i };
          }
        } else {
          // 둘 다 이미 차 있는 경우:
          // [사용자 규칙] 주인공이 뒤늦게 끼어드는 주체면 오래된 발언자와 상관없이 무조건 좌측 인물과 교체
          if (speakerChar.isProtagonist) {
            leftSlot = { characterId: speakerId, lastSpokenIndex: i };
          } else {
            const leftChar = charMap.get(leftSlot.characterId);
            // 좌측에 주인공이 이미 있는 경우, 일반 제3자는 주인공을 밀어내지 않고 우측 인물과 교체
            if (leftChar?.isProtagonist) {
              rightSlot = { characterId: speakerId, lastSpokenIndex: i };
            } else if (leftSlot.lastSpokenIndex <= rightSlot.lastSpokenIndex) {
              leftSlot = { characterId: speakerId, lastSpokenIndex: i };
            } else {
              rightSlot = { characterId: speakerId, lastSpokenIndex: i };
            }
          }
        }
      }
    }
  }

  const result: Array<{
    characterId: string;
    character: Character;
    resolvedPosition: 'left' | 'center' | 'right';
    expression: string;
    isSpeaker: boolean;
    effect?: string;
    emotionBubble?: string;
  }> = [];

  const charLeft = leftSlot ? charMap.get(leftSlot.characterId) : null;
  const charRight = rightSlot ? charMap.get(rightSlot.characterId) : null;

  // 화면에 등장한 인물이 1명뿐이고, 해당 장면에 등장하는 전체 화자도 1명뿐인 독백 씬인 경우 중앙 배치
  if (isSoloScene && (charLeft || charRight) && !(charLeft && charRight)) {
    const singleChar = charLeft || charRight!;
    const isSpeaker = activeSpeakerId === singleChar.id;
    const pos: 'left' | 'center' | 'right' = singleChar.isProtagonist ? 'left' : (singleChar.defaultPosition || 'center');
    result.push({
      characterId: singleChar.id,
      character: singleChar,
      resolvedPosition: pos,
      expression: getRecentExpression(singleChar.id, targetIdx, sceneLines, activeLine, 'neutral'),
      isSpeaker,
      effect: isSpeaker ? activeLine?.effect : undefined,
      emotionBubble: isSpeaker ? activeLine?.emotionBubble : undefined
    });
    return result;
  }

  if (charLeft) {
    const isSpeaker = activeSpeakerId === charLeft.id;
    result.push({
      characterId: charLeft.id,
      character: charLeft,
      resolvedPosition: 'left',
      expression: getRecentExpression(charLeft.id, targetIdx, sceneLines, activeLine, 'neutral'),
      isSpeaker,
      effect: isSpeaker ? activeLine?.effect : undefined,
      emotionBubble: isSpeaker ? activeLine?.emotionBubble : undefined
    });
  }

  if (charRight && charRight.id !== charLeft?.id) {
    const isSpeaker = activeSpeakerId === charRight.id;
    result.push({
      characterId: charRight.id,
      character: charRight,
      resolvedPosition: 'right',
      expression: getRecentExpression(charRight.id, targetIdx, sceneLines, activeLine, 'neutral'),
      isSpeaker,
      effect: isSpeaker ? activeLine?.effect : undefined,
      emotionBubble: isSpeaker ? activeLine?.emotionBubble : undefined
    });
  }

  return result;
}

// Convert Korean expression words in brackets into standard keys
export function parseExpressionKeyword(expStr: string): CharacterExpression {
  const clean = expStr.trim().toLowerCase();
  if (clean.includes('미소') || clean.includes('웃음') || clean.includes('smile')) return 'smile';
  if (clean.includes('기쁨') || clean.includes('환호') || clean.includes('happy')) return 'happy';
  if (clean.includes('화') || clean.includes('분노') || clean.includes('짜증') || clean.includes('angry')) return 'angry';
  if (clean.includes('놀람') || clean.includes('당황') || clean.includes('surprised')) return 'surprised';
  if (clean.includes('슬픔') || clean.includes('눈물') || clean.includes('sad')) return 'sad';
  if (clean.includes('부끄') || clean.includes('홍조') || clean.includes('수줍') || clean.includes('blush')) return 'blush';
  if (clean.includes('생각') || clean.includes('고민') || clean.includes('thinking')) return 'thinking';
  return 'neutral';
}

// Batch script parser: converts plain script text into Scenes with multiple DialogLines!
export function parseScriptTextToScenes(
  text: string,
  existingCharacters: Character[],
  initialBgId: string = 'rooftop_sunset'
): { scenes: Scene[]; updatedCharacters: Character[] } {
  const lines = text.split('\n');
  const scenes: Scene[] = [];
  const characters = [...existingCharacters];

  let currentScene: Scene | null = null;
  let activeBgId = initialBgId;

  // Helper to find or create character
  const getOrCreateChar = (rawName: string): Character => {
    const cleanName = rawName.trim();
    const existing = characters.find((c) => c.name.toLowerCase() === cleanName.toLowerCase() || c.name.startsWith(cleanName));
    if (existing) return existing;

    const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    const assignedColor = colors[characters.length % colors.length];
    const isProtagonist = characters.length === 0 || cleanName.includes('주인공') || cleanName.includes('나');
    const gender = cleanName.includes('녀') || cleanName.includes('소녀') || cleanName.includes('그녀') ? 'female' : 'male';

    const newChar: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      color: assignedColor,
      isProtagonist,
      defaultPosition: isProtagonist ? 'left' : 'right',
      avatarUrl: generateCharacterAvatar(gender, '#334155', characters.length + 1, 'neutral'),
      expressions: {
        neutral: generateCharacterAvatar(gender, '#334155', characters.length + 1, 'neutral'),
        smile: generateCharacterAvatar(gender, '#334155', characters.length + 1, 'smile'),
        happy: generateCharacterAvatar(gender, '#334155', characters.length + 1, 'happy'),
        angry: generateCharacterAvatar(gender, '#334155', characters.length + 1, 'angry'),
        surprised: generateCharacterAvatar(gender, '#334155', characters.length + 1, 'surprised'),
        sad: generateCharacterAvatar(gender, '#334155', characters.length + 1, 'sad'),
        blush: generateCharacterAvatar(gender, '#334155', characters.length + 1, 'blush'),
        thinking: generateCharacterAvatar(gender, '#334155', characters.length + 1, 'thinking'),
      }
    };

    characters.push(newChar);
    return newChar;
  };

  const startNewScene = (title: string, bgId: string) => {
    currentScene = {
      id: `sc_${Date.now()}_${scenes.length}`,
      title: title || `장면 ${scenes.length + 1}`,
      background: { type: 'preset', value: bgId, filter: 'none' },
      castCharacterIds: [],
      lines: [],
      transition: 'fade'
    };
    scenes.push(currentScene);
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) return;

    // Check [장면: ...] or [SCENE: ...] or [배경: ...] or *** (씬 구분선)
    const sceneMatch = line.match(/^\[(?:장면|SCENE)\s*:\s*(.+?)\]/i);
    const bgMatch = line.match(/^\[(?:배경|BG)\s*:\s*(.+?)\]/i);
    const dividerMatch = line === '***' || line === '* * *' || line === '---';

    if (sceneMatch || bgMatch || dividerMatch) {
      if (bgMatch) {
        const query = bgMatch[1].trim();
        const matched = PRESET_BACKGROUNDS.find((b) => b.name.includes(query) || b.id.includes(query));
        if (matched) activeBgId = matched.id;
      }
      const sceneTitle = sceneMatch ? sceneMatch[1].trim() : `장면 ${scenes.length + 1}`;
      startNewScene(sceneTitle, activeBgId);
      return;
    }

    // Ensure we have an active scene
    if (!currentScene) {
      startNewScene('시작 장면', activeBgId);
    }

    // Check dialogue line: "민수: (미소) 안녕!"
    const dialogMatch = line.match(/^([^\s:：]+)\s*[:：]\s*(.*)$/);
    if (dialogMatch) {
      const speakerRaw = dialogMatch[1].trim();
      let dialogContent = dialogMatch[2].trim();

      if (
        speakerRaw === '나레이션' || 
        speakerRaw === '해설' || 
        speakerRaw === '지문' || 
        speakerRaw === 'Narration' ||
        speakerRaw === '[상황]' ||
        speakerRaw === '상황'
      ) {
        currentScene!.lines.push({
          id: `line_${Date.now()}_${idx}`,
          speakerId: null,
          text: dialogContent
        });
        return;
      }

      // 작은따옴표 '...' 생각 표현이면 (생각내용)으로 대사 텍스트 보존
      const singleQuoteMatch = dialogContent.match(/^['‘](.+?)['’]$/s);
      let isThought = false;
      if (singleQuoteMatch) {
        dialogContent = `(${singleQuoteMatch[1].trim()})`;
        isThought = true;
      } else {
        // 큰따옴표 "..." 일반 대사면 따옴표 벗겨서 보존
        const doubleQuoteMatch = dialogContent.match(/^["“](.+?)["”]$/s);
        if (doubleQuoteMatch) {
          dialogContent = doubleQuoteMatch[1].trim();
        }
      }

      let expression: CharacterExpression = isThought ? 'thinking' : 'neutral';

      // 생각 표현이 아닌 경우에만 "(미소) 안녕!" 형태의 표정 분리 검사
      if (!isThought) {
        const expMatch = dialogContent.match(/^\(([^)]+)\)\s*(.+)$/s);
        if (expMatch) {
          const keyword = expMatch[1].trim();
          const restText = expMatch[2].trim();
          const parsedExp = parseExpressionKeyword(keyword);
          if (parsedExp !== 'neutral' || restText) {
            expression = parsedExp;
            dialogContent = restText;
          }
        }
      }

      const speakerChar = getOrCreateChar(speakerRaw);

      // Add to scene's cast checkboxes automatically
      if (!currentScene!.castCharacterIds.includes(speakerChar.id)) {
        currentScene!.castCharacterIds.push(speakerChar.id);
      }

      currentScene!.lines.push({
        id: `line_${Date.now()}_${idx}`,
        speakerId: speakerChar.id,
        text: dialogContent,
        speakerExpression: expression,
        soundEffect: expression === 'surprised' ? 'surprise' : undefined
      });
    } else {
      // Narration without colon
      currentScene!.lines.push({
        id: `line_${Date.now()}_${idx}`,
        speakerId: null,
        text: line
      });
    }
  });

  // Fallback if no scenes created
  if (scenes.length === 0) {
    scenes.push({
      id: `sc_${Date.now()}`,
      title: '새 장면 1',
      background: { type: 'preset', value: initialBgId, filter: 'none' },
      castCharacterIds: [],
      lines: [{ id: 'line_1', speakerId: null, text: '' }],
      transition: 'none'
    });
  }

  return { scenes, updatedCharacters: characters };
}

// Convert project scenes and lines back to script text
export function convertScenesToScriptText(scenes: Scene[], characters: Character[]): string {
  const charMap = new Map(characters.map((c) => [c.id, c.name]));
  const output: string[] = [];

  scenes.forEach((scene) => {
    output.push(`[장면: ${scene.title || '장면'}] [배경: ${scene.background.value}]`);
    scene.lines.forEach((line) => {
      let prefix = '';
      if (line.speakerId) {
        const name = charMap.get(line.speakerId) || line.speakerCustomName || '캐릭터';
        const exp = line.speakerExpression && line.speakerExpression !== 'neutral' ? `(${line.speakerExpression}) ` : '';
        prefix = `${name}: ${exp}`;
      } else {
        prefix = '나레이션: ';
      }
      output.push(`${prefix}${line.text.replace(/\n/g, ' ')}`);
    });
    output.push(''); // blank line between scenes
  });

  return output.join('\n');
}

export interface DialogSegment {
  type: 'thought' | 'dialogue';
  text: string;
}

/**
 * 대사 문자열을 분석하여 생각과 발화 조각들로 분리 (혼합 대사 지원)
 * - 괄호 (...) 내부: 생각 ('...')
 * - 괄호 외부: 일반 발화 ("...")
 */
export function splitDialogSegments(rawText: string): DialogSegment[] {
  let text = rawText.trim();
  if (!text) return [];

  // 전체가 큰따옴표로만 감싸져 있고 내부에 다른 큰따옴표가 없다면 바깥 따옴표 정리
  if (text.startsWith('"') && text.endsWith('"') && !text.slice(1, -1).includes('"')) {
    text = text.slice(1, -1).trim();
  } else if (text.startsWith('“') && text.endsWith('”') && !text.slice(1, -1).includes('“')) {
    text = text.slice(1, -1).trim();
  }

  // 1. 전체가 순수 생각인 경우: (생각) or '생각'
  const fullParen = text.match(/^[(（]\s*(.+?)\s*[)）][.]?$/s);
  if (fullParen) {
    return [{ type: 'thought', text: fullParen[1].trim() }];
  }
  const fullSingle = text.match(/^['‘]\s*(.+?)\s*['’][.]?$/s);
  if (fullSingle) {
    return [{ type: 'thought', text: fullSingle[1].trim() }];
  }

  // 2. 괄호가 전혀 없는 순수 일반 대사인 경우
  if (!text.includes('(') && !text.includes('（')) {
    const clean = text.replace(/^["“](.*)["”]$/s, '$1').trim();
    return [{ type: 'dialogue', text: clean }];
  }

  // 3. 생각과 일반 대사가 섞여 있는 경우: 순서대로 분리
  const regex = /[(（](.+?)[)）]/g;
  const segments: DialogSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // 괄호 앞의 일반 대사
    const beforeText = text.slice(lastIndex, match.index).trim();
    if (beforeText) {
      const cleanBefore = beforeText.replace(/^["“](.*)["”]$/s, '$1').trim();
      if (cleanBefore) {
        segments.push({ type: 'dialogue', text: cleanBefore });
      }
    }

    // 괄호 안의 생각
    const thoughtText = match[1].trim();
    if (thoughtText) {
      segments.push({ type: 'thought', text: thoughtText });
    }

    lastIndex = regex.lastIndex;
  }

  // 마지막 괄호 뒤의 일반 대사
  const afterText = text.slice(lastIndex).trim();
  if (afterText) {
    const cleanAfter = afterText.replace(/^["“](.*)["”]$/s, '$1').trim();
    if (cleanAfter) {
      segments.push({ type: 'dialogue', text: cleanAfter });
    }
  }

  return segments.length > 0 ? segments : [{ type: 'dialogue', text }];
}

/**
 * 인물 대사를 서식화된 문장 배열로 변환 (방식 B: 생각과 대사를 각각 별도의 문장으로 자동 분할)
 */
export function formatDialogLinesForTxtExport(speakerName: string, rawText: string): string[] {
  const segments = splitDialogSegments(rawText);
  if (segments.length === 0) return [`${speakerName}: ""`];

  return segments.map((seg) => {
    if (seg.type === 'thought') {
      return `${speakerName}: '${seg.text}'`;
    }
    return `${speakerName}: "${seg.text}"`;
  });
}

/**
 * 단일 대사 서식화 헬퍼 (기존 호환성 유지)
 */
export function formatDialogForTxtExport(rawText: string): { type: 'thought' | 'dialogue'; formatted: string } {
  const segments = splitDialogSegments(rawText);
  if (segments.length === 0) return { type: 'dialogue', formatted: '""' };
  const first = segments[0];
  if (first.type === 'thought') {
    return { type: 'thought', formatted: `'${first.text}'` };
  }
  return { type: 'dialogue', formatted: `"${first.text}"` };
}

/**
 * 나레이션/지문 텍스트를 [상황]: 포맷으로 변환
 */
export function formatNarrationForTxtExport(rawText: string): string {
  let text = rawText.trim();
  text = text
    .replace(/^\[(?:상황|나레이션|지문|해설)\]\s*[:：]?\s*/i, '')
    .replace(/^(?:상황|나레이션|지문|해설)\s*[:：]\s*/i, '')
    .trim();
  return `[상황]: ${text}`;
}

export interface NovelScriptTxtOptions {
  includeSceneHeaders?: boolean;
}

/**
 * 프로젝트의 모든 장면과 대사를 소설/대본 TXT 파일 양식으로 변환
 * 템플릿:
 * 정우진: "물러서! 전원 사각으로 후퇴해! 시계탑 기둥 뒤로 숨어!"
 * [상황]: 살아남은 대원들이 부서진 석재 기둥과 차폐벽 뒤로 몸을 던짐...
 * 박현우: '단순한 파괴 광선이 아니야. 닿은 대상의 시간을 강제로 역류시키고 있어.'
 */
export function exportProjectToNovelScriptTxt(
  scenes: Scene[],
  characters: Character[],
  options: NovelScriptTxtOptions = {}
): string {
  const charMap = new Map(characters.map((c) => [c.id, c.name]));
  const sceneSections: string[] = [];

  scenes.forEach((scene, sIdx) => {
    const sceneParagraphs: string[] = [];

    if (options.includeSceneHeaders && scenes.length > 1) {
      const headerTitle = scene.title || `장면 ${sIdx + 1}`;
      sceneParagraphs.push(`[장면 ${sIdx + 1}: ${headerTitle}]`);
    }

    scene.lines.forEach((line) => {
      const rawText = (line.text || '').trim();
      if (!rawText) return;

      if (!line.speakerId) {
        // 화자가 없는 나레이션
        sceneParagraphs.push(formatNarrationForTxtExport(rawText));
      } else {
        // 등장인물 대사 / 생각 (방식 B: 생각과 대사가 섞여 있으면 각각 별도의 문장으로 자동 분할)
        const speakerName = charMap.get(line.speakerId) || line.speakerCustomName || '등장인물';
        const formattedLines = formatDialogLinesForTxtExport(speakerName, rawText);
        sceneParagraphs.push(...formattedLines);
      }
    });

    if (sceneParagraphs.length > 0) {
      sceneSections.push(sceneParagraphs.join('\n\n'));
    }
  });

  // 씬 전환 구분자: *** 앞뒤로 세 줄 띄기 (\n\n\n\n***\n\n\n\n)
  return sceneSections.join('\n\n\n\n***\n\n\n\n');
}

/**
 * 프로젝트 대본을 .txt 파일로 다운로드 실행
 */
export function downloadNovelScriptTxt(
  projectTitle: string,
  scenes: Scene[],
  characters: Character[],
  options: NovelScriptTxtOptions = {}
): void {
  const content = exportProjectToNovelScriptTxt(scenes, characters, options);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = (projectTitle || '대본').trim().replace(/[/\\?%*:|"<>]/g, '_');
  a.download = `${fileName}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
