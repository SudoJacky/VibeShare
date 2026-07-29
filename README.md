# Vibe Coding Presentation

一套用于部门技术分享的网页演示。观众视图固定为 `1920 × 1080`，
演讲者视图提供逐帧提词和计时。

## Controls

- `← / →`：切换页面。
- `↑ / ↓`：回退或推进当前页面的叙事帧。
- `/`：观众视图。
- `/presenter`：演讲者视图。

两个视图通过浏览器 `BroadcastChannel` 同步。

## Development

```bash
npm install
npm run dev
npm run build
```

正式演示前，请用真实的 Token 统计、失控任务数据、Diff、模块文档和
Before / After 案例替换页面中的占位内容。
