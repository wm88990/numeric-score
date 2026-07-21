// 简谱渲染器类型定义

/** 单个音符 token，如 "5·6"、"7672"、"0"、"X" */
export interface Token {
  text: string;
  /** 连音束级别：0=无下划线, 1=单线(八分音符), 2=双线(十六分音符) */
  beam?: number;
}

/** 连音线/圆滑线，连接同一小节内的两个 token */
export interface Tie {
  /** 起始 token 索引（melody 数组中的下标） */
  from: number;
  /** 结束 token 索引 */
  to: number;
  /** 弧线类型 */
  type?: 'slur' | 'tie';
}

/** 一个小节，包含上下两个声部 */
export interface Measure {
  melody: Token[];       // 上声部：旋律行（数字简谱）
  rhythm: Token[];       // 下声部：节奏行（打击乐符号 X/0X 等）
  percussion: Token[];   // 下声部：锣鼓词行（当当/请 等）
  lyric?: string;        // 小节上方唱词
  barline?: 'single' | 'end' | 'repeat-start' | 'repeat-end';
  ties?: Tie[];          // 上声部连音线/圆滑线
}

/** 一行乐谱（可跨多个视觉行） */
export interface ScoreLine {
  label?: string;        // 段落标签，如 "一、引子"
  lyric?: string;        // 整行上方唱词
  measures: Measure[];
}

/** 完整乐谱 */
export interface Score {
  title: string;
  subtitle?: string;
  notes?: string;        // 手写标注等
  lines: ScoreLine[];
  appendix?: string[];   // 附录文本（唱诵文等）
}
