import type { Score, Measure, Token } from './types';

// ═══════════════════════════════════════════════
// 渲染配置
// ═══════════════════════════════════════════════
const C = {
  // 字符宽度
  noteW: 28, dotW: 10, dashW: 22,
  tokenGap: 18, measurePad: 20,

  // 小节线
  barlineW: 1, endBarlineW: 4, barlineGap: 5,

  // 字号
  melodyFS: 38, rhythmFS: 30, percFS: 20,
  lyricFS: 18, titleFS: 56, subtitleFS: 24, labelFS: 22,

  // 垂直位置（相对于行顶部）
  // 行顺序从上到下：锣鼓词 → [唱词] → 节奏 → 旋律
  labelY: -6,
  barlineTop: 4,

  // 锣鼓词行（最上方）
  percY: 24,

  // 唱词行（锣鼓词与节奏之间）
  lyricY: 48,

  // 节奏行
  rhythmY: 72,

  // 旋律行（最下方）
  melodyY: 108,
  underlineY: 122, underlineGap: 5,  // 下划线紧贴数字底部

  // 连音线弧线（旋律行上方，即节奏行与旋律行之间）
  slurY: 92,
  slurHeight: 14,

  barlineBottom: 138,
  lineHeight: 160, lineGap: 30,

  // 声部标签
  voiceLabelFS: 18,
  voiceLabelX: 6,

  // 附点偏移（右上方）
  dotOffsetX: 2, dotOffsetY: -10,
  dotR: 3,

  // 颜色（白底黑字）
  melodyColor: '#000000',
  rhythmColor: '#000000',
  percColor: '#000000',
  barlineColor: '#000000',
  lyricColor: '#000000',
  bgColor: '#ffffff',
  voiceSepColor: '#dddddd',
  slurColor: '#000000',
  voiceLabelColor: '#999999',

  // 布局
  maxWidth: 1400, marginLeft: 50,
  titleY: 58, subtitleY: 96, notesY: 128, contentStartY: 180,
};

// ═══════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

interface ParsedChar { type: 'note' | 'dot' | 'dash' | 'text'; char: string }

function parseChars(text: string): ParsedChar[] {
  const result: ParsedChar[] = [];
  for (const ch of text) {
    if (/[0-7]/.test(ch)) result.push({ type: 'note', char: ch });
    else if (ch === '\u00b7' || ch === '.') result.push({ type: 'dot', char: '\u00b7' });
    else if (ch === '-' || ch === '\u2212') result.push({ type: 'dash', char: '\u2212' });
    else result.push({ type: 'text', char: ch });
  }
  return result;
}

function charW(type: string): number {
  switch (type) {
    case 'note': return C.noteW;
    case 'dot': return C.dotW;
    case 'dash': return C.dashW;
    default: return C.noteW;
  }
}

// ═══════════════════════════════════════════════
// 宽度计算
// ═══════════════════════════════════════════════

function melodyTokenWidth(token: Token): number {
  let w = 0;
  for (const c of parseChars(token.text)) w += charW(c.type);
  return w + C.tokenGap;
}

function rhythmTokenWidth(token: Token): number {
  return token.text.length * 18 + C.tokenGap;
}

function percTokenWidth(token: Token): number {
  return token.text.length * 22 + C.tokenGap;
}

function measureWidth(measure: Measure): number {
  let mw = C.measurePad * 2;
  for (const t of measure.melody) mw += melodyTokenWidth(t);

  let rw = C.measurePad * 2;
  for (const t of measure.rhythm) rw += rhythmTokenWidth(t);

  let pw = C.measurePad * 2;
  for (const t of measure.percussion) pw += percTokenWidth(t);

  return Math.max(mw, rw, pw, 50);
}

// ═══════════════════════════════════════════════
// Token 渲染
// ═══════════════════════════════════════════════

interface RenderResult { width: number; svg: string }
interface TokenPos { startX: number; centerX: number; endX: number }

function renderMelodyToken(token: Token, x: number, y: number): RenderResult & { pos: TokenPos } {
  const chars = parseChars(token.text);
  let cx = x;
  let svg = '';
  let firstNoteX = -1;
  let lastNoteX = -1;
  let prevNoteRightX = -1;  // 用于附点定位

  for (const c of chars) {
    const w = charW(c.type);
    if (c.type === 'note') {
      const centerX = cx + w / 2;
      if (firstNoteX < 0) firstNoteX = centerX;
      lastNoteX = centerX;
      prevNoteRightX = cx + w;
      svg += `<text x="${centerX}" y="${y}" font-size="${C.melodyFS}" fill="${C.melodyColor}" text-anchor="middle" font-family="SimSun, Songti SC, serif" font-weight="bold">${c.char}</text>`;
    } else if (c.type === 'dot') {
      // 附点在数字的右上方
      const dotX = prevNoteRightX + C.dotOffsetX;
      const dotY = y + C.dotOffsetY;
      svg += `<circle cx="${dotX}" cy="${dotY}" r="${C.dotR}" fill="${C.melodyColor}"/>`;
    } else if (c.type === 'dash') {
      svg += `<text x="${cx + w / 2}" y="${y}" font-size="${C.melodyFS}" fill="${C.melodyColor}" text-anchor="middle" font-family="SimSun, serif">\u2212</text>`;
    } else {
      svg += `<text x="${cx + w / 2}" y="${y}" font-size="${C.melodyFS}" fill="${C.melodyColor}" text-anchor="middle" font-family="SimSun, serif">${esc(c.char)}</text>`;
    }
    cx += w;
  }

  // 连音束下划线 - 紧贴数字底部
  const beam = token.beam ?? 0;
  if (beam > 0 && firstNoteX >= 0) {
    const x1 = firstNoteX - 10;
    const x2 = lastNoteX + 10;
    for (let i = 0; i < beam; i++) {
      const by = C.underlineY + i * C.underlineGap;
      svg += `<line x1="${x1}" y1="${by}" x2="${x2}" y2="${by}" stroke="${C.melodyColor}" stroke-width="2"/>`;
    }
  }

  const totalW = cx - x + C.tokenGap;
  return {
    width: totalW,
    svg,
    pos: { startX: x, centerX: x + totalW / 2, endX: x + totalW },
  };
}

function renderRhythmToken(token: Token, x: number, y: number): RenderResult {
  const w = token.text.length * 18;
  const svg = `<text x="${x}" y="${y}" font-size="${C.rhythmFS}" fill="${C.rhythmColor}" font-family="SimSun, monospace" letter-spacing="1">${esc(token.text)}</text>`;
  return { width: w + C.tokenGap, svg };
}

function renderPercToken(token: Token, x: number, y: number): RenderResult {
  const w = token.text.length * 22;
  const svg = `<text x="${x}" y="${y}" font-size="${C.percFS}" fill="${C.percColor}" font-family="KaiTi, STKaiti, serif">${esc(token.text)}</text>`;
  return { width: w + C.tokenGap, svg };
}

// ═══════════════════════════════════════════════
// 连音线渲染
// ═══════════════════════════════════════════════

function renderSlur(fromX: number, toX: number, baseY: number, arcUp: boolean): string {
  const midX = (fromX + toX) / 2;
  const arcH = C.slurHeight;
  const cy = arcUp ? baseY - arcH : baseY + arcH;
  return `<path d="M ${fromX} ${baseY} Q ${midX} ${cy} ${toX} ${baseY}" stroke="${C.slurColor}" stroke-width="1.5" fill="none"/>`;
}

// ═══════════════════════════════════════════════
// 小节线渲染
// ═══════════════════════════════════════════════

function renderBarline(type: string, x: number, y: number): string {
  const top = y + C.barlineTop;
  const bot = y + C.barlineBottom;

  if (type === 'end') {
    return `<line x1="${x - C.barlineGap}" y1="${top}" x2="${x - C.barlineGap}" y2="${bot}" stroke="${C.barlineColor}" stroke-width="${C.barlineW}"/>` +
           `<line x1="${x}" y1="${top}" x2="${x}" y2="${bot}" stroke="${C.barlineColor}" stroke-width="${C.endBarlineW}"/>`;
  } else if (type === 'repeat-start') {
    return `<line x1="${x - C.barlineGap}" y1="${top}" x2="${x - C.barlineGap}" y2="${bot}" stroke="${C.barlineColor}" stroke-width="${C.endBarlineW}"/>` +
           `<line x1="${x}" y1="${top}" x2="${x}" y2="${bot}" stroke="${C.barlineColor}" stroke-width="${C.barlineW}"/>` +
           `<circle cx="${x - 14}" cy="${y + 45}" r="3.5" fill="${C.barlineColor}"/>` +
           `<circle cx="${x - 14}" cy="${y + 60}" r="3.5" fill="${C.barlineColor}"/>`;
  } else if (type === 'repeat-end') {
    return `<circle cx="${x - 18}" cy="${y + 45}" r="3.5" fill="${C.barlineColor}"/>` +
           `<circle cx="${x - 18}" cy="${y + 60}" r="3.5" fill="${C.barlineColor}"/>` +
           `<line x1="${x - C.barlineGap}" y1="${top}" x2="${x - C.barlineGap}" y2="${bot}" stroke="${C.barlineColor}" stroke-width="${C.barlineW}"/>` +
           `<line x1="${x}" y1="${top}" x2="${x}" y2="${bot}" stroke="${C.barlineColor}" stroke-width="${C.endBarlineW}"/>`;
  }
  return `<line x1="${x}" y1="${top}" x2="${x}" y2="${bot}" stroke="${C.barlineColor}" stroke-width="${C.barlineW}"/>`;
}

// ═══════════════════════════════════════════════
// 小节渲染（行顺序：锣鼓词 → 唱词 → 节奏 → 旋律）
// ═══════════════════════════════════════════════

function renderMeasure(measure: Measure, x: number, y: number, showVoiceLabel: boolean, lyric?: string): RenderResult {
  const mw = measureWidth(measure);
  let svg = '';

  // ── 声部标签 ──
  if (showVoiceLabel) {
    svg += `<text x="${C.voiceLabelX}" y="${y + C.percY - 14}" font-size="${C.voiceLabelFS}" fill="${C.voiceLabelColor}" font-family="SimSun, serif">上</text>`;
    svg += `<text x="${C.voiceLabelX}" y="${y + C.rhythmY}" font-size="${C.voiceLabelFS}" fill="${C.voiceLabelColor}" font-family="SimSun, serif">下</text>`;
  }

  // ── 第1行：锣鼓词行（最上方）──
  let cx = x + C.measurePad;
  for (const token of measure.percussion) {
    const r = renderPercToken(token, cx, y + C.percY);
    svg += r.svg;
    cx += r.width;
  }

  // ── 唱词标注（锣鼓词与节奏之间）──
  if (lyric) {
    svg += `<text x="${x + C.measurePad}" y="${y + C.lyricY}" font-size="${C.lyricFS}" fill="${C.lyricColor}" font-family="KaiTi, serif">${esc(lyric)}</text>`;
  }

  // ── 第2行：节奏行 ──
  cx = x + C.measurePad;
  for (const token of measure.rhythm) {
    const r = renderRhythmToken(token, cx, y + C.rhythmY);
    svg += r.svg;
    cx += r.width;
  }

  // ── 第3行：旋律行（最下方）──
  const melodyPositions: TokenPos[] = [];
  cx = x + C.measurePad;
  for (const token of measure.melody) {
    const r = renderMelodyToken(token, cx, y + C.melodyY);
    svg += r.svg;
    melodyPositions.push(r.pos);
    cx += r.width;
  }

  // ── 连音线（旋律行上方，节奏与旋律之间）──
  if (measure.ties) {
    for (const tie of measure.ties) {
      const from = melodyPositions[tie.from];
      const to = melodyPositions[tie.to];
      if (from && to) {
        svg += renderSlur(from.centerX, to.centerX, y + C.slurY, true);
      }
    }
  }

  // ── 小节线 ──
  svg += renderBarline(measure.barline ?? 'single', x + mw, y);

  return { width: mw, svg };
}

// ═══════════════════════════════════════════════
// 自动换行
// ═══════════════════════════════════════════════

function wrapMeasures(measures: Measure[], maxWidth: number): Measure[][] {
  const result: Measure[][] = [];
  let current: Measure[] = [];
  let currentW = 0;

  for (const m of measures) {
    const mw = measureWidth(m);
    if (currentW + mw > maxWidth && current.length > 0) {
      result.push(current);
      current = [];
      currentW = 0;
    }
    current.push(m);
    currentW += mw;
  }
  if (current.length > 0) result.push(current);
  return result;
}

// ═══════════════════════════════════════════════
// 主渲染函数
// ═══════════════════════════════════════════════

export function renderScore(score: Score): string {
  const totalW = C.maxWidth + C.marginLeft * 2;

  // 计算行布局
  const layouts: { measures: Measure[]; y: number; label?: string; lyric?: string }[] = [];
  let currentY = C.contentStartY;

  for (const line of score.lines) {
    const wrapped = wrapMeasures(line.measures, C.maxWidth);
    for (let i = 0; i < wrapped.length; i++) {
      layouts.push({
        measures: wrapped[i],
        y: currentY,
        label: i === 0 ? line.label : undefined,
        lyric: i === 0 ? line.lyric : undefined,
      });
      currentY += C.lineHeight + C.lineGap;
    }
  }

  // 计算总高度
  let totalH = currentY + 20;
  if (score.appendix && score.appendix.length > 0) {
    totalH += 60 + score.appendix.length * 32;
  }

  // 生成 SVG
  let svg = `<svg viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;" font-family="SimSun, Songti SC, serif">`;
  svg += `<rect width="${totalW}" height="${totalH}" fill="${C.bgColor}"/>`;

  // 标题
  svg += `<text x="${totalW / 2}" y="${C.titleY}" font-size="${C.titleFS}" fill="${C.melodyColor}" text-anchor="middle" font-family="SimHei, sans-serif" font-weight="bold">${esc(score.title)}</text>`;

  if (score.subtitle) {
    svg += `<text x="${totalW / 2}" y="${C.subtitleY}" font-size="${C.subtitleFS}" fill="#666" text-anchor="middle" font-family="KaiTi, serif">${esc(score.subtitle)}</text>`;
  }
  if (score.notes) {
    svg += `<text x="${totalW / 2}" y="${C.notesY}" font-size="${C.lyricFS}" fill="#888" text-anchor="middle" font-family="KaiTi, serif" font-style="italic">${esc(score.notes)}</text>`;
  }

  // 分隔线
  svg += `<line x1="${C.marginLeft}" y1="${C.contentStartY - 8}" x2="${totalW - C.marginLeft}" y2="${C.contentStartY - 8}" stroke="#ccc" stroke-width="1"/>`;

  // 渲染每行
  for (const layout of layouts) {
    let x = C.marginLeft;

    if (layout.label) {
      svg += `<text x="${x}" y="${layout.y + C.labelY}" font-size="${C.labelFS}" fill="${C.lyricColor}" font-family="SimHei, sans-serif" font-weight="bold">${esc(layout.label)}</text>`;
    }

    // 将行级唱词传给第一个小节
    for (let mi = 0; mi < layout.measures.length; mi++) {
      const measureLyric = (mi === 0 && layout.lyric) ? layout.lyric : undefined;
      const r = renderMeasure(layout.measures[mi], x, layout.y, mi === 0, measureLyric);
      svg += r.svg;
      x += r.width;
    }
  }

  // 附录（唱诵文）
  if (score.appendix && score.appendix.length > 0) {
    let ay = currentY + 16;
    svg += `<line x1="${C.marginLeft}" y1="${ay}" x2="${totalW - C.marginLeft}" y2="${ay}" stroke="#ccc" stroke-width="1"/>`;
    ay += 28;
    svg += `<text x="${totalW / 2}" y="${ay}" font-size="${C.labelFS}" fill="${C.lyricColor}" text-anchor="middle" font-family="SimHei, sans-serif" font-weight="bold">唱诵文</text>`;
    ay += 28;
    for (const line of score.appendix) {
      svg += `<text x="${C.marginLeft + 16}" y="${ay}" font-size="${C.percFS + 4}" fill="${C.percColor}" font-family="KaiTi, STKaiti, serif">${esc(line)}</text>`;
      ay += 32;
    }
  }

  svg += '</svg>';
  return svg;
}
