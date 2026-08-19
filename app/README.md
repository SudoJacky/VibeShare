# Presentation Application
<!-- vibeshare-module-fingerprint: sha256:0d29c7c8e3455425d96b1673919e4441e208c0f3d43c82cd05e032d031187763 -->

`app` 是 VibeShare 的 Next.js / Vinext App Router 应用层，负责观众视图、演讲者视图以及二者共享的演示运行时。

## 职责

- 在 `layout.tsx` 中定义全局元数据与静态渲染策略。
- 由 `page.tsx` 和 `presenter/page.tsx` 提供观众、演讲者两个入口。
- 在 `presentation.tsx` 中维护页面定义、逐帧揭示、键盘导航、计时与演讲者备注。
- 通过 `BroadcastChannel` 同步两个视图，并将当前位置写入 URL hash 和 `sessionStorage`。
- 在 `presentation-location.ts` 中集中生成并静默替换演示位置 hash。

开幕动画由子模块 [`opening`](opening/README.md) 独立负责；按最近祖先 README 规则，其文件不计入本模块指纹。

## 内部结构

- `presentation.tsx`：幻灯片内容、动画时间线、导航状态和双窗口同步。
- `globals.css`：固定 `1920 × 1080` 舞台及观众/演讲者界面的全局样式。
- `page.tsx`：观众路由。
- `presenter/page.tsx`：演讲者路由。
- `presentation-location.ts`：`#/page/<index>/frame/<index>` 地址协议。

## 不变量

- 左右方向键切换页面，上下方向键只改变当前页面的叙事帧。
- URL 同步使用 `history.replaceState`，不得触发额外的 `hashchange` 导航。
- 两个窗口交换完整的页码和逐页帧数组，接收端必须按当前页面定义裁剪越界值。
- 观众视图与演讲者视图复用同一份 `Presentation` 状态机和幻灯片定义。
