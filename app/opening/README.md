# Opening Sequence
<!-- vibeshare-module-fingerprint: sha256:c9deb3422be4b1b9f90fb86e047949d21c43c602f1ddc5df742b4e2ae17b0941 -->

`app/opening` 实现演示开始前的 60 秒 Remotion 开幕序列，并负责从需要用户手势解锁媒体的状态平滑交接到常规幻灯片。

## 职责

- `OpeningSequence.tsx` 承载 Remotion Player、播放错误反馈、退出淡出和完成回调。
- `remotion/OpeningSequenceComposition.tsx` 定义 60 FPS 的正式时间线、场景、旁白与背景音乐。
- `remotion/OpeningSequencePrototype.tsx` 提供正式序列复用的页面马赛克原型。
- `assets/` 保存时间线直接导入的图片与音频；资源路径必须由构建器转换为浏览器可访问 URL。
- `opening-shortcuts.ts` 集中判断隐藏的快速跳过快捷键。
- `DecryptedText.tsx` 与 `RotatingText.tsx` 提供开幕场景使用的局部文字效果。

## 播放流程

1. 外层演示将媒体解锁状态传入 `OpeningSequence`。
2. 未解锁时显示启动按钮；获得用户手势后 Player 从头播放。
3. Remotion 组合按固定帧号渲染各场景和音频，保证画面与旁白可重复对齐。
4. 播放结束或触发 `Shift + End` / `Shift + →` 时停止 Player，开始退出淡出。
5. 淡出完成后调用 `onComplete`，由演示运行时进入下一页并卸载开幕层。

## 不变量

- 正式组合为 `1920 × 1080`、`60 FPS`、`60s`；节奏调整应使用帧常量而不是运行时随机值。
- 浏览器拒绝播放、Remotion 报错和组件卸载都必须有明确状态或清理路径。
- 快速跳过事件在捕获阶段拦截，且只在开幕组件挂载期间生效。
- `prefers-reduced-motion` 下应直接呈现可理解的最终状态，避免依赖连续运动表达关键信息。
