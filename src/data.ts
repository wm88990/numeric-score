import type { Score, Token, Tie } from './types';

/** 创建 token，自动推断连音束级别 */
function t(text: string, beam?: number): Token {
  const noteCount = (text.match(/[0-7]/g) || []).length;
  return { text, beam: beam ?? (noteCount >= 2 ? 1 : 0) };
}

/** 创建连音线 */
function tie(from: number, to: number): Tie {
  return { from, to, type: 'slur' };
}

/** 空小节行 */
const e: Token[] = [];

export const score: Score = {
  title: '小赞',
  subtitle: '佛教梵呗 · 简谱',
  notes: '報 乾三 坤 丁亥 戒千',
  lines: [
    // ── 一、引子 ──
    {
      label: '一、引子',
      measures: [
        {
          melody: [t('5·6'), t('7672')], rhythm: [t('0X'), t('XXX')], percussion: [t('当当'), t('当当')],
          ties: [tie(0, 1)], melodyLyrics: ['诵', '经'],
        },
        {
          melody: [t('676'), t('5')], rhythm: [t('X'), t('-')], percussion: [t('当当')],
          ties: [tie(0, 1)], melodyLyrics: ['功', '德'],
        },
        { melody: [t('2·7'), t('6')], rhythm: e, percussion: [t('当当')], ties: [tie(0, 1)], melodyLyrics: ['无', '量'] },
        { melody: [t('672'), t('276')], rhythm: e, percussion: [t('当当'), t('当当')], ties: [tie(0, 1)], melodyLyrics: ['海', '中'] },
        { melody: [t('5·6'), t('5')], rhythm: e, percussion: [t('当当')], ties: [tie(0, 1)], melodyLyrics: ['一', '音'] },
        { melody: [t('561'), t('165')], rhythm: e, percussion: [t('当当当当')], ties: [tie(0, 1)], melodyLyrics: ['演', '说'] },
        { melody: [t('1'), t('2321')], rhythm: e, percussion: [t('当当'), t('当当')], ties: [tie(0, 1)], melodyLyrics: ['百', '千万'] },
        { melody: [t('216')], rhythm: e, percussion: [t('当当')], barline: 'end', melodyLyrics: ['亿'] },
      ],
    },
    // ── 二 ──
    {
      label: '二',
      measures: [
        { melody: [t('3'), t('2·3')], rhythm: [t('X2'), t('XX')], percussion: [t('当当')], ties: [tie(0, 1)] },
        { melody: [t('1·2'), t('3·1')], rhythm: [t('XX')], percussion: [t('当当')], ties: [tie(0, 1)] },
        { melody: [t('2'), t('2321')], rhythm: [t('XX')], percussion: [t('当当'), t('当当')], ties: [tie(0, 1)] },
        { melody: [t('6'), t('6165')], rhythm: [t('XX')], percussion: [t('当当')], ties: [tie(0, 1)] },
        { melody: [t('6·2'), t('1216')], rhythm: [t('XX')], percussion: [t('当当当当')], ties: [tie(0, 1)] },
        { melody: [t('5·6')], rhythm: e, percussion: [t('当当')] },
        { melody: [t('1')], rhythm: e, percussion: [t('当当')] },
        { melody: [t('2'), t('3532')], rhythm: e, percussion: [t('当当'), t('当当')], ties: [tie(0, 1)] },
        { melody: [t('321'), t('16')], rhythm: e, percussion: [t('当当')], ties: [tie(0, 1)], barline: 'end' },
      ],
    },
    // ── 三 ──
    {
      label: '三',
      measures: [
        { melody: [t('2'), t('3532')], rhythm: [t('0X'), t('0X')], percussion: [t('当当')], ties: [tie(0, 1)] },
        { melody: [t('1·3'), t('22')], rhythm: [t('0X'), t('0X0')], percussion: [t('当当')], ties: [tie(0, 1)] },
        { melody: [t('2·6'), t('5')], rhythm: [t('X0'), t('X0')], percussion: [t('请'), t('当'), t('当'), t('请')], ties: [tie(0, 1)] },
        { melody: [t('6·1'), t('2123')], rhythm: [t('X0')], percussion: [t('当当')], ties: [tie(0, 1)] },
        { melody: [t('5·6'), t('5')], rhythm: [t('X0'), t('XX')], percussion: [t('当当当当')], ties: [tie(0, 1)] },
        { melody: [t('561'), t('165')], rhythm: [t('0X')], percussion: [t('当当')], ties: [tie(0, 1)] },
        { melody: [t('6·5'), t('66')], rhythm: [t('0X0')], percussion: [t('当当')], ties: [tie(0, 1)] },
        { melody: [t('61'), t('1651')], rhythm: [t('X'), t('-')], percussion: [t('请'), t('-')], ties: [tie(0, 1)], barline: 'end' },
      ],
    },
    // ── 四（上方唱词：子 拜 天 方 大 道 感 恩）──
    {
      label: '四',
      lyric: '子 拜 天 方 大 道 感 恩',
      measures: [
        { melody: [t('6·5'), t('6')], rhythm: [t('23'), t('0X')], percussion: [t('请'), t('当'), t('当')], ties: [tie(0, 1)] },
        { melody: [t('33'), t('321')], rhythm: [t('0X'), t('0X0')], percussion: [t('请'), t('当'), t('当当')], ties: [tie(0, 1)] },
        { melody: [t('2'), t('3532')], rhythm: [t('X0'), t('X0')], percussion: [t('请当当')], ties: [tie(0, 1)] },
        { melody: [t('1·3'), t('24'), t('3'), t('5·6')], rhythm: [t('X0'), t('X0')], percussion: [t('当当')], ties: [tie(0, 1), tie(2, 3)] },
        { melody: [t('5')], rhythm: [t('X0'), t('X0')], percussion: [t('当当')] },
        { melody: [t('561'), t('165')], rhythm: [t('0X'), t('0X')], percussion: [t('请'), t('请')], ties: [tie(0, 1)] },
        { melody: [t('1'), t('2321')], rhythm: [t('0X9')], percussion: [t('请'), t('-')], ties: [tie(0, 1)] },
        { melody: [t('2'), t('16'), t('1')], rhythm: [t('X'), t('-')], percussion: [t('当当')], ties: [tie(0, 2)] },
        { melody: [t('3'), t('2·3')], rhythm: e, percussion: [t('请'), t('-')], ties: [tie(0, 1)], barline: 'end' },
      ],
    },
  ],
  appendix: [],
};
