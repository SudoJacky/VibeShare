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

## GitHub Pages

```bash
npm run build:pages
```

静态网站会生成到 `dist/client`。合并到 `main` 后，
`.github/workflows/pages.yml` 只会发布这个目录，不会发布仓库里的其他文件。
其他托管环境可以通过 `NEXT_PUBLIC_SITE_URL` 设置分享元数据中的站点地址。

正式演示前，请用真实的 Token 统计、失控任务数据、Diff、模块文档和
Before / After 案例替换页面中的占位内容。

## 模块文档

`app/`、`worker/` 下的模块使用就近 `README.md` 记录职责、边界和不变量。
每份模块 README 都带有其直接负责文件的指纹；代码变化后，检查会要求开发者重新阅读并按需更新文档。

```bash
npm run readme:check
npm run readme:review -- app/opening
npm run hooks:install
```

提交已有暂存改动时，优先运行
`npm run readme:review -- --staged <module>`，再暂存更新后的 README。CI 和可选的
pre-commit hook 都会拒绝未审阅或已过期的模块文档。
