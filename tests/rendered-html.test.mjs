import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Vibe Coding presentation", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Vibe Coding — Field Notes<\/title>/i);
  assert.match(html, /从 Loop 到 Graph/);
  assert.match(html, /单个执行单元越能干，瓶颈越容易跑到它们之间/);
  assert.match(html, /失败 \/ 局部重试/);
  assert.match(html, /人工决策/);
  assert.match(html, /工程范围在一层层往外扩/);
  assert.match(html, /Loop 负责收敛，Graph 负责协作/);
  assert.match(html, /GRAPH OF LOOPS/);
  assert.match(html, /Graph 管协作，Loop 管收敛/);
  assert.match(html, /一张执行图，至少要答清四个问题/);
  assert.match(html, /节点负责做任务/);
  assert.match(html, /图负责管住整个系统/);
  assert.match(html, /Agent 节点：进程成功，不等于任务完成/);
  assert.match(html, /运行成功/);
  assert.match(html, /任务完成/);
  assert.match(html, /系统和人守住硬约束/);
  assert.match(html, /生成编排，不等于获得可靠性/);
  assert.match(html, /同一套系统 \/ 各管一层/);
  assert.match(html, /自动生成编排/);
  assert.match(html, /自动获得可靠性/);
  assert.match(html, /够用就停，不要默认上 Graph/);
  assert.match(html, /路径无法/);
  assert.match(html, /复杂度溢出/);
  assert.match(html, /任务里真的有这条约束吗？/);
  assert.match(html, /Agent Plugins：把包装统一起来/);
  assert.match(html, /N 份客户端适配/);
  assert.match(html, /1 个标准包/);
  assert.match(html, /规范统一的部分/);
  assert.match(html, /仍由客户端决定/);
  assert.match(html, /它们处理两个不同问题/);
  assert.match(html, /第二部分 \/ 我的实践/);
  assert.match(html, /先交代一下样本量/);
  assert.match(html, /22\.9B/);
  assert.match(html, /接近 230 亿/);
  assert.match(html, /\/images\/token-usage\.webp/);
  assert.match(html, /说完需求，然后“开始实现吧”/);
  assert.match(html, /执行权交给 Agent/);
  assert.match(html, /中间状态不可见/);
  assert.match(html, /执行者 → 状态检查员/);
  assert.match(html, /让 Agent Loop 一直跑到目标完成/);
  assert.match(html, /或 brainstorming/);
  assert.match(html, /按 Spec 实现/);
  assert.match(html, /直到目标完成/);
  assert.match(html, /边界 · 验证 · 停止条件/);
  assert.match(html, /一个周末：两个 Goal，跑了约 20 小时/);
  assert.match(html, /约 20H/);
  assert.match(html, /近千/);
  assert.match(html, /功能完成 ≠ 工程完成/);
  assert.match(html, /Code%20frequency\.png/);
  assert.match(html, /WRITE \/ FAST/);
  assert.match(html, /CONTROL \/ LOST/);
  assert.match(html, /历史路径/);
  assert.match(html, /我用了整整一个星期，重构整个项目/);
  assert.match(html, /主路径不清/);
  assert.match(html, /执行能力上去以后，控制关系也要一起补上/);
  assert.match(html, /测试 · Hook · 人工 Review/);
  assert.match(html, /开发者正在变成技术产品经理/);
  assert.match(html, /描述产品目标/);
  assert.match(html, /AI 先拆出：功能点 · 模块 · 分期 · 风险/);
  assert.match(html, /哪些内容明确不做？/);
  assert.match(html, /自然语言 \/ 隐含关系/);
  assert.match(html, /依赖汇合/);
  assert.match(html, /验证关卡/);
  assert.match(html, /关系画出来以后/);
  assert.match(html, /并行 · 依赖 · 循环 · 人工关卡，都能检查/);
  assert.match(html, /测试驱动比 Spec 驱动更重要/);
  assert.match(html, /用 Hook 把边界写成规则/);
  assert.match(html, /先找到权威文档，再读取实现/);
  assert.match(html, /DOCUMENT FRESHNESS \/ TWO LAYERS/);
  assert.match(html, /module-fingerprint/);
  assert.match(html, /doc-watch/);
  assert.match(html, /Fingerprint 只证明重新 Review 过/);
  assert.match(html, /把吃过的亏写进 AGENTS\.md/);
  assert.match(html, /我现在怎么 Vibe Coding/);
  assert.match(html, /VIBE CODING \/ FIELD NOTES/);
  assert.match(html, /Talk is cheap\. Show me the code\./);
  assert.match(html, /我自己封的/);
  assert.match(html, /AI 倒是有三个/);
  assert.match(html, /01 \/ CODE/);
  assert.match(html, /03 \/ AUDIO/);
  assert.match(html, /产品动画演示/);
  assert.match(html, /能生成、能运行，还不等于值得留下/);
  assert.match(html, /同样通过测试 \/ 工程代价不同/);
  assert.match(html, /先讲清什么算正确，再放大执行/);
  assert.match(html, /把踩过的坑写进 AGENTS\.md/);
  assert.match(html, /系统 \+ 人 \/ 目标 · 约束 · 证据 · 判断/);
  assert.match(html, /执行越便宜，判断越重要/);
  assert.match(html, /00(?:(?:<!-- -->)|\s)*\/(?:(?:<!-- -->)|\s)*26/);
  assert.match(html, /aria-label="上一页"/);
  assert.match(html, /aria-label="下一页"/);
  assert.match(html, /class="presentation-stage"/);
  assert.doesNotMatch(html, /Click or press any key to begin/);
  assert.doesNotMatch(html, /aria-label="Presentation opening"/);
  assert.match(html, /把执行交给 AI，把工程判断留在人手里/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders the presenter route", async () => {
  const response = await render("/presenter");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /演讲者视图/);
  assert.match(html, /ELAPSED/);
  assert.match(html, /OPEN AUDIENCE VIEW/);
});

test("uses the first 60 seconds of Neon Horizon for the opening BGM", async () => {
  const source = await readFile(
    new URL(
      "../app/opening/remotion/OpeningSequenceComposition.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /assets\/audio\/Neon Horizon\.mp3/);
  assert.doesNotMatch(source, /assets\/audio\/opening-bgm\.wav/);
  assert.match(source, /OPENING_SEQUENCE_DURATION = 60 \* OPENING_SEQUENCE_FPS/);
  assert.match(source, /frame < frameAt\(52\)/);
  assert.match(source, /mix\(0\.2, 0, between\(frame, frameAt\(52\), frameAt\(60\)\)\)/);
  assert.match(source, /\? 0\.07\s+: 0\.2/);
  assert.match(source, /Math\.min\(fadedVolume, duckedVolume\)/);
});

test("preloads opening assets and waits on black when they are not ready", async () => {
  const [presentation, preloader, composition, opening] = await Promise.all([
    readFile(new URL("../app/presentation.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../app/opening/opening-preload.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../app/opening/remotion/OpeningSequenceComposition.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL("../app/opening/OpeningSequence.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(preloader, /OPENING_SEQUENCE_ASSET_SOURCES\.map/);
  assert.match(preloader, /cache: "force-cache"/);
  assert.match(preloader, /await response\.arrayBuffer\(\)/);
  assert.match(presentation, /void preloadOpeningAssets\(\)\.then/);
  assert.match(
    presentation,
    /mode === "audience" && \(isOpeningDemoSlide \|\| openingExiting\)/,
  );
  assert.match(presentation, /ready=\{openingReady\}/);
  assert.doesNotMatch(presentation, /!isOpeningDemoSlide \|\| openingReady/);
  assert.match(opening, /ready\?: boolean;/);
  assert.match(opening, /\{ready \? \(\s*<Player/s);
  assert.match(opening, /\{ready && !canPlay \? \(/);
  assert.match(
    composition,
    /export const OPENING_SEQUENCE_ASSET_SOURCES = Array\.from\(\s*new Set\(/s,
  );
});

test("keeps the opening BGM payload below one MiB", async () => {
  const { size } = await stat(
    new URL(
      "../app/opening/assets/audio/Neon Horizon.mp3",
      import.meta.url,
    ),
  );

  assert.ok(size < 1024 * 1024, `opening BGM is ${size} bytes`);
});

test("syncs the automation narration and keeps the Plan statement visible", async () => {
  const source = await readFile(
    new URL(
      "../app/opening/remotion/OpeningSequenceComposition.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /const AUTOMATION_QUESTION_TYPING_START = 105;/,
  );
  assert.match(
    source,
    /between\(\s*frame,\s*AUTOMATION_QUESTION_TYPING_START,\s*AUTOMATION_QUESTION_TYPING_END,?\s*\)/s,
  );
  assert.match(
    source,
    /<Sequence\s+from=\{frameAt\(14\) \+ AUTOMATION_QUESTION_TYPING_START\}[^>]*>\s*<Audio src=\{audioSources\.whatIfAll\}/s,
  );

  assert.match(source, /const PLAN_ANYTHING_REVEAL_END = 132;/);
  assert.doesNotMatch(source, /PLAN_STATEMENT_(?:HOLD|FADE)_/);
  assert.match(
    source,
    /className=\{styles\.planLead\} style=\{\{ opacity: leadIn,/,
  );
  assert.match(
    source,
    /className=\{styles\.planAnything\} style=\{\{ opacity: anythingIn,/,
  );
});

test("keeps the Orbit closing statement readable through the scene ending", async () => {
  const source = await readFile(
    new URL(
      "../app/opening/remotion/OpeningSequenceComposition.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /const ORBIT_CLOSING_REVEAL_START = 284;/);
  assert.match(source, /const ORBIT_CLOSING_REVEAL_END = 306;/);
  assert.match(
    source,
    /between\(\s*frame,\s*ORBIT_CLOSING_REVEAL_START,\s*ORBIT_CLOSING_REVEAL_END,/s,
  );
});

test("keeps presentation typography legible at a distance", async () => {
  const source = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  assert.match(source, /color-scheme:\s*light;/);
  assert.match(source, /--bg:\s*#f5f5f7;/);
  assert.match(source, /--text:\s*#1d1d1f;/);
  assert.match(source, /--accent:\s*#0066cc;/);
  assert.doesNotMatch(source, /--bg:\s*#000000;/);
  assert.match(
    source,
    /\.graph-cover-network\s*\{[^}]*var\(--surface\);/s,
  );
  assert.doesNotMatch(source, /#c5ff3d|rgba\(197, 255, 61,/i);

  const audienceStyles = source.split("/* Presenter */", 1)[0];
  const fontSizes = [...audienceStyles.matchAll(/font-size:\s*(\d+)px/g)].map(
    ([, size]) => Number(size),
  );

  assert.ok(fontSizes.length > 0);
  assert.ok(
    Math.min(...fontSizes) >= 22,
    "projection-facing presentation text should not render below 22px on the 1920×1080 canvas",
  );
  assert.match(source, /\.slide-heading h2\s*\{[^}]*font-size:\s*60px;/s);
  assert.match(source, /\.presentation-slide p\s*\{[^}]*line-height:\s*1\.5;/s);
  assert.match(source, /\.deck-footer p\s*\{[^}]*width:\s*680px;/s);
  assert.match(source, /\.deck-header\s*\{[^}]*top:\s*28px;/s);
  assert.match(source, /\.deck-footer\s*\{[^}]*bottom:\s*20px;/s);

  const openingSource = await readFile(
    new URL("../app/opening/opening-sequence.module.css", import.meta.url),
    "utf8",
  );
  const openingFontSizes = [
    ...openingSource.matchAll(/font-size:\s*(\d+)px/g),
  ].map(([, size]) => Number(size));

  assert.ok(openingFontSizes.length > 0);
  assert.ok(
    Math.min(...openingFontSizes) >= 10,
    "dense Remotion product mockups should not render text below 10px",
  );
});

test("keeps Page 11 evidence and verdict in separate columns", async () => {
  const source = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /\.incident-evidence\s*\{[^}]*grid-template-columns:\s*minmax\(0, 900px\) minmax\(0, 1fr\);/s,
  );
  assert.match(
    source,
    /\.incident-control-loss strong\s*\{[^}]*white-space:\s*nowrap;/s,
  );
});
