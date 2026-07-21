import type { Score, Token } from './types';

/** 创建 token，自动推断连音束级别 */
function t(text: string, beam?: number): Token {
  const noteCount = (text.match(/[0-7]/g) || []).length;
  return { text, beam: beam ?? (noteCount >= 2 ? 1 : 0) };
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
        { melody: [t('5·6'), t('7672')], rhythm: [t('0X'), t('XXX')], percussion: [t('当当'), t('当当')] },
        { melody: [t('676'), t('5')], rhythm: [t('X'), t('-')], percussion: [t('当当')] },
        { melody: [t('2·7'), t('6')], rhythm: e, percussion: [t('当当')] },
        { melody: [t('672'), t('276')], rhythm: e, percussion: [t('当当'), t('当当')] },
        { melody: [t('5·6'), t('5')], rhythm: e, percussion: [t('当当')] },
        { melody: [t('561'), t('165')], rhythm: e, percussion: [t('当当当当')] },
        { melody: [t('1'), t('2321')], rhythm: e, percussion: [t('当当'), t('当当')] },
        { melody: [t('216')], rhythm: e, percussion: [t('当当')], barline: 'end' },
      ],
    },
    // ── 二 ──
    {
      label: '二',
      measures: [
        { melody: [t('3'), t('2·3')], rhythm: [t('X2'), t('XX')], percussion: [t('当当')] },
        { melody: [t('1·2'), t('3·1')], rhythm: [t('XX')], percussion: [t('当当')] },
        { melody: [t('2'), t('2321')], rhythm: [t('XX')], percussion: [t('当当'), t('当当')] },
        { melody: [t('6'), t('6165')], rhythm: [t('XX')], percussion: [t('当当')] },
        { melody: [t('6·2'), t('1216')], rhythm: [t('XX')], percussion: [t('当当当当')] },
        { melody: [t('5·6')], rhythm: e, percussion: [t('当当')] },
        { melody: [t('1')], rhythm: e, percussion: [t('当当')] },
        { melody: [t('2'), t('3532')], rhythm: e, percussion: [t('当当'), t('当当')] },
        { melody: [t('321'), t('16')], rhythm: e, percussion: [t('当当')], barline: 'end' },
      ],
    },
    // ── 三 ──
    {
      label: '三',
      measures: [
        { melody: [t('2'), t('3532')], rhythm: [t('0X'), t('0X')], percussion: [t('当当')] },
        { melody: [t('1·3'), t('22')], rhythm: [t('0X'), t('0X0')], percussion: [t('当当')] },
        { melody: [t('2·6'), t('5')], rhythm: [t('X0'), t('X0')], percussion: [t('请'), t('当'), t('当'), t('请')] },
        { melody: [t('6·1'), t('2123')], rhythm: [t('X0')], percussion: [t('当当')] },
        { melody: [t('5·6'), t('5')], rhythm: [t('X0'), t('XX')], percussion: [t('当当当当')] },
        { melody: [t('561'), t('165')], rhythm: [t('0X')], percussion: [t('当当')] },
        { melody: [t('6·5'), t('66')], rhythm: [t('0X0')], percussion: [t('当当')] },
        { melody: [t('61'), t('1651')], rhythm: [t('X'), t('-')], percussion: [t('请'), t('-')], barline: 'end' },
      ],
    },
    // ── 四（上方唱词：子 拜 天 方 大 道 感 恩）──
    {
      label: '四',
      lyric: '子 拜 天 方 大 道 感 恩',
      measures: [
        { melody: [t('6·5'), t('6')], rhythm: [t('23'), t('0X')], percussion: [t('请'), t('当'), t('当')] },
        { melody: [t('33'), t('321')], rhythm: [t('0X'), t('0X0')], percussion: [t('请'), t('当'), t('当当')] },
        { melody: [t('2'), t('3532')], rhythm: [t('X0'), t('X0')], percussion: [t('请当当')] },
        { melody: [t('1·3'), t('24'), t('3'), t('5·6')], rhythm: [t('X0'), t('X0')], percussion: [t('当当')] },
        { melody: [t('5')], rhythm: [t('X0'), t('X0')], percussion: [t('当当')] },
        { melody: [t('561'), t('165')], rhythm: [t('0X'), t('0X')], percussion: [t('请'), t('请')] },
        { melody: [t('1'), t('2321')], rhythm: [t('0X9')], percussion: [t('请'), t('-')] },
        { melody: [t('2'), t('16'), t('1')], rhythm: [t('X'), t('-')], percussion: [t('当当')] },
        { melody: [t('3'), t('2·3')], rhythm: e, percussion: [t('请'), t('-')], barline: 'end' },
      ],
    },
  ],
  appendix: [
    '戒定真香，焚起金炉中，',
    '两岸通十方，全无碍，',
    '诸佛会遥闻，愿此香云，',
    '遍满十方世界，一切佛尊会。',
    '十方法轮，地狱饿鬼畜生，',
    '八难三途，同沾香味。',
    '彼岸彼岸，何来何去，',
    '禅和尚，护法众等，',
    '闻经听法，同生极乐世界。',
    '唵斡资啰怛纥哪吽。',
    '南无香云盖菩萨摩诃萨。',
    '南无阿弥陀佛。',
  ],
};
