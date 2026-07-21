import { renderScore } from './renderer';
import { score } from './data';

const container = document.getElementById('score-container')!;
const svgString = renderScore(score);
container.innerHTML = svgString;

// 缩放控制
let zoom = 1.5;
const zoomLevel = document.getElementById('zoom-level')!;

function updateZoom(): void {
  container.style.transform = `scale(${zoom})`;
  zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
}

document.getElementById('zoom-in')!.addEventListener('click', () => {
  zoom = Math.min(zoom + 0.1, 3);
  updateZoom();
});

document.getElementById('zoom-out')!.addEventListener('click', () => {
  zoom = Math.max(zoom - 0.1, 0.3);
  updateZoom();
});

document.getElementById('zoom-reset')!.addEventListener('click', () => {
  zoom = 1;
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
