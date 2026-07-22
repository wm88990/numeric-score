import { renderScore } from './renderer';
import { score as defaultScore } from './data';
import type { Score } from './types';

const container = document.getElementById('score-container')!;
let currentScore: Score = defaultScore;
let svgString = renderScore(currentScore);
container.innerHTML = svgString;

// 缩放控制
let zoom = 7.5;
const zoomLevel = document.getElementById('zoom-level')!;

function updateZoom(): void {
  container.style.transform = `scale(${zoom})`;
  zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
}
updateZoom();

document.getElementById('zoom-in')!.addEventListener('click', () => {
  zoom = Math.min(zoom + 0.5, 15);
  updateZoom();
});

document.getElementById('zoom-out')!.addEventListener('click', () => {
  zoom = Math.max(zoom - 0.5, 0.5);
  updateZoom();
});

document.getElementById('zoom-reset')!.addEventListener('click', () => {
  zoom = 7.5;
  updateZoom();
});

// 下载 SVG
document.getElementById('download')!.addEventListener('click', () => {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '小赞-简谱.svg';
  a.click();
  URL.revokeObjectURL(url);
});

// ═══════════════════════════════════════════════
// 可编辑面板
// ═══════════════════════════════════════════════

// 创建编辑面板 UI
const editorHTML = `
  <div id="editor-panel" style="display:none; position:fixed; top:0; right:0; width:480px; height:100vh; background:#fff; border-left:1px solid #ddd; box-shadow:-4px 0 16px rgba(0,0,0,0.1); z-index:100; display:flex; flex-direction:column;">
    <div style="padding:12px 16px; border-bottom:1px solid #eee; display:flex; align-items:center; justify-content:space-between;">
      <span style="font-size:15px; font-weight:bold; color:#333;">乐谱编辑器</span>
      <div style="display:flex; gap:6px;">
        <button id="editor-apply" style="padding:4px 12px; background:#4CAF50; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:13px;">应用</button>
        <button id="editor-close" style="padding:4px 10px; background:#eee; color:#666; border:none; border-radius:4px; cursor:pointer; font-size:13px;">关闭</button>
      </div>
    </div>
    <div style="padding:8px 12px; font-size:12px; color:#999; border-bottom:1px solid #f5f5f5;">
      编辑 JSON 数据后点「应用」实时预览。格式说明见 README。
    </div>
    <textarea id="editor-textarea" style="flex:1; width:100%; border:none; padding:12px; font-family:'Consolas','Monaco',monospace; font-size:13px; line-height:1.5; resize:none; outline:none; background:#fafafa;" spellcheck="false"></textarea>
    <div style="padding:8px 12px; border-top:1px solid #eee; font-size:12px; color:#aaa;">
      <span id="editor-status">就绪</span>
    </div>
  </div>
`;

document.body.insertAdjacentHTML('beforeend', editorHTML);

const editorPanel = document.getElementById('editor-panel')!;
const editorTextarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
const editorStatus = document.getElementById('editor-status')!;

// 在 header 中添加编辑按钮
const controls = document.querySelector('.controls')!;
const editBtn = document.createElement('button');
editBtn.id = 'toggle-editor';
editBtn.title = '编辑乐谱';
editBtn.textContent = '✎';
editBtn.style.cssText = 'width:34px; height:34px; border:1px solid #ddd; background:#fff; border-radius:6px; cursor:pointer; font-size:16px; color:#555; display:flex; align-items:center; justify-content:center;';
controls.insertBefore(editBtn, document.getElementById('zoom-out')!);

// 切换编辑面板
let editorVisible = false;
editBtn.addEventListener('click', () => {
  editorVisible = !editorVisible;
  if (editorVisible) {
    // 将当前乐谱数据填入编辑器
    editorTextarea.value = JSON.stringify(currentScore, null, 2);
    editorPanel.style.display = 'flex';
    editBtn.style.background = '#e8f5e9';
    editBtn.style.borderColor = '#4CAF50';
    document.querySelector('.score-wrap')!.classList.add('with-editor');
  } else {
    editorPanel.style.display = 'none';
    editBtn.style.background = '#fff';
    editBtn.style.borderColor = '#ddd';
    document.querySelector('.score-wrap')!.classList.remove('with-editor');
  }
});

// 关闭编辑面板
document.getElementById('editor-close')!.addEventListener('click', () => {
  editorVisible = false;
  editorPanel.style.display = 'none';
  editBtn.style.background = '#fff';
  editBtn.style.borderColor = '#ddd';
});

// 应用编辑
document.getElementById('editor-apply')!.addEventListener('click', () => {
  try {
    const newScore = JSON.parse(editorTextarea.value) as Score;
    currentScore = newScore;
    svgString = renderScore(currentScore);
    container.innerHTML = svgString;
    updateZoom();
    editorStatus.textContent = '已应用 ✓';
    editorStatus.style.color = '#4CAF50';
    setTimeout(() => {
      editorStatus.textContent = '就绪';
      editorStatus.style.color = '#aaa';
    }, 2000);
  } catch (e) {
    editorStatus.textContent = `错误: ${(e as Error).message}`;
    editorStatus.style.color = '#f44336';
  }
});

// 快捷键 Ctrl+S 应用
editorTextarea.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    document.getElementById('editor-apply')!.click();
  }
});
