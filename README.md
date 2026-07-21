# 简谱渲染器 (Jianpu Renderer)

基于 TypeScript + SVG 的数字简谱排版引擎，无需 VexFlow 等第三方乐谱库。

## 功能

- 数字简谱音符渲染 (1-7, 0 休止符)
- 附点 (·) 与连音束下划线 (八分/十六分音符)
- 三行对齐布局：旋律 + 节奏符号 + 锣鼓词
- 小节线、终止线、反复记号
- 唱词标注、段落标签
- 自动换行
- 缩放控制
- SVG 导出

## 快速开始

```bash
npm install
npm run dev      # 本地开发
npm run build    # 打包到 dist/
npm run preview  # 预览构建结果
```

## 部署到 GitHub Pages

1. 推送代码到 GitHub 仓库
2. 仓库 Settings → Pages → Source 选 GitHub Actions
3. 自动构建并部署到 `https://用户名.github.io/仓库名/`

## 项目结构

```
src/
├── types.ts       # 类型定义
├── data.ts        # 乐谱数据（小赞）
├── renderer.ts    # SVG 渲染引擎
└── main.ts        # 入口文件
```

## 扩展

在 `data.ts` 中按照 `Score` 类型定义添加新的乐谱数据即可。
