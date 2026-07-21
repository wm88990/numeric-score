import type { Score, Measure, Token } from './types';

// ═══════════════════════════════════════════════
// 渲染配置
// ═══════════════════════════════════════════════
const C = {
  // 字符宽度
  noteW: 32, dotW: 12, dashW: 28,
  tokenGap: 24, measurePad: 28,

  // 小节线
  barlineW: 2, endBarlineW: 6, barlineGap: 7,

  // 字号
  melodyFS: 42, rhythmFS: 34, percFS: 30,
  lyricFS: 24, titleFS: 64, subtitleFS: 28, labelFS: 26,

  // 垂直位置（相对于行顶部）
  labelY: -8, lyricY: -34,
  barlineTop: 8,
  melodyY: 52, underlineY: 72, underlineGap: 7,
  voiceSepY: 92,          // 声部分隔线位置
  rhythmY: 120, percY: 162,
  barlineBottom: 185,
  lineHeight: 220, lineGap: 46,

  // 连音线
  slurY: 18,              // 圆滑线弧顶位置（旋律行上方）
  slurHeight: 16,         // 圆滑线弧高

  // 声部标签
  voiceLabelFS: 22,
  voiceLabelX: 8,         // 声部标签 X 偏移

  // 颜色
  melodyColor: '#1a1a1a',
  rhythmColor: '#555555',
  percColor: '#8B4513',
  barlineColor: '#333333',
  lyricColor: '#666666',
  bgColor: '#fdfbf7',
  voiceSepColor: '#d0c8b8',
  slurColor: '#444444',
  voiceLabelColor: '#bbb0a0',

  // 布局
  maxWidth: 1600, marginLeft: 60,
  titleY: 68, subtitleY: 112, notesY: 150, contentStartY: 210,
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
  return token.text.length * 20 + C.tokenGap;
}

function percTokenWidth(token: Token): number {
  return token.text.length * 30 + C.tokenGap;
}

function measureWidth(measure: Measure): number {
  let mw = C.measurePad * 2;
  for (const t of measure.melody) mw += melodyTokenWidth(t);

  let rw = C.measurePad * 2;
  for (const t of measure.rhythm) rw += rhythmTokenWidth(t);

  let pw = C.measurePad * 2;
  for (const t of measure.percussion) pw += percTokenWidth(t);

  return Math.max(mw, rw, pw, 60);
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

  for (const c of chars) {
    const w = charW(c.type);
    if (c.type === 'note') {
      const centerX = cx + w / 2;
      if (firstNoteX < 0) firstNoteX = centerX;
      lastNoteX = centerX;
      svg += `<text x="${centerX}" y="${y}" font-size="${C.melodyFS}" fill="${C.melodyColor}" text-anchor="middle" font-family="SimSun, Songti SC, serif" font-weight="bold">${c.char}</text>`;
    } else if (c.type === 'dot') {
      svg += `<circle cx="${cx + w / 2}" cy="${y - 8}" r="4" fill="${C.melodyColor}"/>`;
    } else if (c.type === 'dash') {
      svg += `<text x="${cx + w / 2}" y="${y}" font-size="${C.melodyFS}" fill="${C.melodyColor}" text-anchor="middle" font-family="SimSun, serif">\u2212</text>`;
    } else {
      svg += `<text x="${cx + w / 2}" y="${y}" font-size="${C.melodyFS}" fill="${C.melodyColor}" text-anchor="middle" font-family="SimSun, serif">${esc(c.char)}</text>`;
    }
    cx += w;
  }

  // 连音束下划线
  const beam = token.beam ?? 0;
  if (beam > 0 && firstNoteX >= 0) {
    const x1 = firstNoteX - 12;
    const x2 = lastNoteX + 12;
    for (let i = 0; i < beam; i++) {
      const by = C.underlineY + i * C.underlineGap;
      svg += `<line x1="${x1}" y1="${by}" x2="${x2}" y2="${by}" stroke="${C.melodyColor}" stroke-width="2.5"/>`;
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
  const w = token.text.length * 20;
  const svg = `<text x="${x}" y="${y}" font-size="${C.rhythmFS}" fill="${C.rhythmColor}" font-family="SimSun, monospace" letter-spacing="2">${esc(token.text)}</text>`;
  return { width: w + C.tokenGap, svg };
}

function renderPercToken(token: Token, x: number, y: number): RenderResult {
  const w = token.text.length * 30;
  const svg = `<text x="${x}" y="${y}" font-size="${C.percFS}" fill="${C.percColor}" font-family="KaiTi, STKaiti, serif">${esc(token.text)}</text>`;
  return { width: w + C.tokenGap, svg };
}

// ═══════════════════════════════════════════════
// 连音线渲染
// ═══════════════════════════════════════════════

function renderSlur(fromX: number, toX: number, baseY: number, arcUp: boolean): string {
  const midX = (fromX + toX) / 2;
  const arcH = C.slurHeight;
  const y1 = baseY;
  const y2 = baseY;
  const cy = arcUp ? baseY - arcH : baseY + arcH;

  // 主弧线
  let svg = `<path d="M ${fromX} ${y1} Q ${midX} ${cy} ${toX} ${y2}" stroke="${C.slurColor}" stroke-width="2" fill="none"/>`;

  // 如果是 tie（延音线），画双弧
  // 如果是 slur（圆滑线），画单弧
  return svg;
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
           `<circle cx="${x - 16}" cy="${y + 55}" r="4" fill="${C.barlineColor}"/>` +
           `<circle cx="${x - 16}" cy="${y + 75}" r="4" fill="${C.barlineColor}"/>`;
  } else if (type === 'repeat-end') {
    return `<circle cx="${x - 20}" cy="${y + 55}" r="4" fill="${C.barlineColor}"/>` +
           `<circle cx="${x - 20}" cy="${y + 75}" r="4" fill="${C.barlineColor}"/>` +
           `<line x1="${x - C.barlineGap}" y1="${top}" x2="${x - C.barlineGap}" y2="${bot}" stroke="${C.barlineColor}" stroke-width="${C.barlineW}"/>` +
           `<line x1="${x}" y1="${top}" x2="${x}" y2="${bot}" stroke="${C.barlineColor}" stroke-width="${C.endBarlineW}"/>`;
  }
  return `<line x1="${x}" y1="${top}" x2="${x}" y2="${bot}" stroke="${C.barlineColor}" stroke-width="${C.barlineW}"/>`;
}

// ═══════════════════════════════════════════════
// 小节渲染
// ═══════════════════════════════════════════════

function renderMeasure(measure: Measure, x: number, y: number, showVoiceLabel: boolean): RenderResult {
  const mw = measureWidth(measure);
  let svg = '';

  // ── 声部分隔虚线 ──
  svg += `<line x1="${x}" y1="${y + C.voiceSepY}" x2="${x + mw}" y2="${y + C.voiceSepY}" stroke="${C.voiceSepColor}" stroke-width="1" stroke-dasharray="4,4"/>`;

  // ── 声部标签（仅每行第一个小节显示）──
  if (showVoiceLabel) {
    svg += `<text x="${C.voiceLabelX}" y="${y + C.melodyY}" font-size="${C.voiceLabelFS}" fill="${C.voiceLabelColor}" font-family="SimSun, serif">上</text>`;
    svg += `<text x="${C.voiceLabelX}" y="${y + C.rhythmY}" font-size="${C.voiceLabelFS}" fill="${C.voiceLabelColor}" font-family="SimSun, serif">下</text>`;
  }

  // ── 上声部：旋律行 ──
  const melodyPositions: TokenPos[] = [];
  let cx = x + C.measurePad;
  for (const token of measure.melody) {
    const r = renderMelodyToken(token, cx, y + C.melodyY);
    svg += r.svg;
    melodyPositions.push(r.pos);
    cx += r.width;
  }

  // ── 连音线/圆滑线 ──
  if (measure.ties) {
    for (const tie of measure.ties) {
      const from = melodyPositions[tie.from];
      const to = melodyPositions[tie.to];
      if (from && to) {
        const slurBaseY = y + C.slurY;
        svg += renderSlur(from.centerX, to.centerX, slurBaseY, true);
      }
    }
  }

  // ── 下声部：节奏行 ──
  cx = x + C.measurePad;
  for (const token of measure.rhythm) {
    const r = renderRhythmToken(token, cx, y + C.rhythmY);
    svg += r.svg;
    cx += r.width;
  }

  // ── 下声部：锣鼓词行 ──
  cx = x + C.measurePad;
  for (const token of measure.percussion) {
    const r = renderPercToken(token, cx, y + C.percY);
    svg += r.svg;
    cx += r.width;
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
  const layouts: { measures: Measure[]; y: number; label?: string; lyric?: string; isFirstInLine: boolean }[] = [];
  let currentY = C.contentStartY;

  for (const line of score.lines) {
    const wrapped = wrapMeasures(line.measures, C.maxWidth);
    for (let i = 0; i < wrapped.length; i++) {
      layouts.push({
        measures: wrapped[i],
        y: currentY,
        label: i === 0 ? line.label : undefined,
        lyric: i === 0 ? line.lyric : undefined,
        isFirstInLine: true,
      });
      currentY += C.lineHeight + C.lineGap;
    }
  }

  // 计算总高度
  let totalH = currentY + 20;
  if (score.appendix && score.appendix.length > 0) {
    totalH += 60 + score.appendix.length * 28;
  }

  // 生成 SVG
  let svg = `<svg viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${totalW}px;" font-family="SimSun, Songti SC, serif">`;
  svg += `<rect width="${totalW}" height="${totalH}" fill="${C.bg}"/>`;

  // 标题
  svg += `<text x="${totalW / 2}" y="${C.titleY}" font-size="${C.titleFS}" fill="${C.melodyColor}" text-anchor="middle" font-family="SimHei, sans-serif" font-weight="bold">${esc(score.title)}</text>`;

  if (score.subtitle) {
    svg += `<text x="${totalW / 2}" y="${C.subtitleY}" font-size="${C.subtitleFS}" fill="#888" text-anchor="middle" font-family="KaiTi, serif">${esc(score.subtitle)}</text>`;
  }
  if (score.notes) {
    svg += `<text x="${totalW / 2}" y="${C.notesY}" font-size="${C.lyricFS}" fill="#999" text-anchor="middle" font-family="KaiTi, serif" font-style="italic">${esc(score.notes)}</text>`;
  }

  // 分隔线
  svg += `<line x1="${C.marginLeft}" y1="${C.contentStartY - 10}" x2="${totalW - C.marginLeft}" y2="${C.contentStartY - 10}" stroke="#ddd" stroke-width="1"/>`;

  // 渲染每行
  for (const layout of layouts) {
    let x = C.marginLeft;

    if (layout.label) {
      svg += `<text x="${x}" y="${layout.y + C.labelY}" font-size="${C.labelFS}" fill="${C.lyricColor}" font-family="SimHei, sans-serif" font-weight="bold">${esc(layout.label)}</text>`;
    }
    if (layout.lyric) {
      svg += `<text x="${x + 60}" y="${layout.y + C.lyricY}" font-size="${C.lyricFS}" fill="${C.lyricColor}" font-family="KaiTi, serif">${esc(layout.lyric)}</text>`;
    }

    for (let mi = 0; mi < layout.measures.length; mi++) {
      const r = renderMeasure(layout.measures[mi], x, layout.y, mi === 0);
      svg += r.svg;
      x += r.width;
    }
  }

  // 附录（唱诵文）
  if (score.appendix && score.appendix.length > 0) {
    let ay = currentY + 20;
    svg += `<line x1="${C.marginLeft}" y1="${ay}" x2="${totalW - C.marginLeft}" y2="${ay}" stroke="#ddd" stroke-width="1"/>`;
    ay += 30;
    svg += `<text x="${totalW / 2}" y="${ay}" font-size="${C.labelFS}" fill="${C.lyricColor}" text-anchor="middle" font-family="SimHei, sans-serif" font-weight="bold">唱诵文</text>`;
    ay += 30;
    for (const line of score.appendix) {
      svg += `<text x="${C.marginLeft + 20}" y="${ay}" font-size="${C.percFS}" fill="${C.percColor}" font-family="KaiTi, STKaiti, serif">${esc(line)}</text>`;
      ay += 36;
    }
  }

  svg += '</svg>';
  return svg;
}
