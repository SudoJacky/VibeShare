# Opening Sequence
<!-- vibeshare-module-fingerprint: sha256:2d352d8d9ecdde259cbd922de978d96325facb3b563837b76bb389dfc4fcf5e4 -->

`app/opening` 实现演示开始前的 60 秒 Remotion 开幕序列，并负责从需要用户手势解锁媒体的状态平滑交接到常规幻灯片。

## 职责

- `OpeningSequence.tsx` 承载 Remotion Player、播放错误反馈、退出淡出和完成回调。
- `opening-preload.ts` 在观众视图挂载后静默预取全部开幕资源，并报告能否安全播放。
- `remotion/OpeningSequenceComposition.tsx` 定义 60 FPS 的正式时间线、场景、旁白与背景音乐。
- `remotion/OpeningSequencePrototype.tsx` 提供正式序列复用的页面马赛克原型。
- `assets/` 保存时间线直接导入的图片与音频；资源路径必须由构建器转换为浏览器可访问 URL。
- `opening-shortcuts.ts` 集中判断隐藏的快速跳过快捷键。
- `DecryptedText.tsx` 与 `RotatingText.tsx` 提供开幕场景使用的局部文字效果。

## 播放流程

1. 观众视图挂载后立即在后台预取资源清单中的全部图片和音频。
2. 抵达开幕页时，资源已就绪则挂载 Player；仍在加载或加载失败则由 `OpeningSequence` 保持纯黑屏，等待资源就绪或演讲者手动跳过。
3. 外层演示将媒体解锁状态传入 `OpeningSequence`；未解锁时显示启动按钮，获得用户手势后 Player 从头播放。
4. Remotion 组合按固定帧号渲染各场景和音频，保证画面与旁白可重复对齐。
5. 播放结束或触发 `Shift + End` / `Shift + →` 时停止 Player，开始退出淡出。
6. 淡出完成后调用 `onComplete`，由演示运行时进入下一页并卸载开幕层。

## 不变量

- 正式组合为 `1920 × 1080`、`60 FPS`、`60s`；节奏调整应使用帧常量而不是运行时随机值。
- 资源清单必须覆盖时间线直接使用的全部图片和音频；背景音乐只保留实际播放的 60 秒。
- 浏览器拒绝播放、Remotion 报错和组件卸载都必须有明确状态或清理路径。
- 快速跳过事件在捕获阶段拦截，且只在开幕组件挂载期间生效。
- `prefers-reduced-motion` 下应直接呈现可理解的最终状态，避免依赖连续运动表达关键信息。
