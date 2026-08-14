import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.match(html, /从单个执行循环迁移到多执行单元协作/);
  assert.match(html, /失败 \/ 局部重试/);
  assert.match(html, /人工决策/);
  assert.match(html, /工程对象正在不断向外扩展/);
  assert.match(html, /Loop 负责收敛，Graph 负责协作/);
  assert.match(html, /GRAPH OF LOOPS/);
  assert.match(html, /Graph 组织协作，Loop 负责收敛/);
  assert.match(html, /一张执行图，要让四件事显式/);
  assert.match(html, /节点负责完成任务/);
  assert.match(html, /图负责让整个系统值得信任/);
  assert.match(html, /Agent 节点：进程成功，不等于任务完成/);
  assert.match(html, /运行成功/);
  assert.match(html, /任务完成/);
  assert.match(html, /系统和人负责硬约束/);
  assert.match(html, /生成编排，不等于获得可靠性/);
  assert.match(html, /同一套系统 \/ 两个层次/);
  assert.match(html, /自动生成编排/);
  assert.match(html, /自动获得可靠性/);
  assert.match(html, /满足需求就停，不要默认升级到 Graph/);
  assert.match(html, /路径无法/);
  assert.match(html, /复杂度溢出/);
  assert.match(html, /每次升级，都要有任务约束作为证据/);
  assert.match(html, /Agent Plugins：统一的是包装/);
  assert.match(html, /统一包格式/);
  assert.match(html, /统一安装、权限与 UX/);
  assert.match(html, /第二部分 \/ 我的实践/);
  assert.match(html, /最初：慢，但是还在控制下/);
  assert.match(html, /说完需求，然后“开始实现吧”/);
  assert.match(html, /一个周末：两个 Goal，执行了 20 个小时/);
  assert.match(html, /开发者正在变成技术产品经理/);
  assert.match(html, /测试驱动比 Spec 驱动更重要/);
  assert.match(html, /用 Hook 把边界变成硬约束/);
  assert.match(html, /把吃过的亏，整理成自己的 AGENTS\.md/);
  assert.match(html, /我现在怎么 Vibe Coding/);
  assert.match(html, /VIBE CODING \/ FIELD NOTES/);
  assert.match(html, /Talk is cheap\. Show me the code\./);
  assert.match(html, /产品动画演示/);
  assert.match(html, /00(?:(?:<!-- -->)|\s)*\/(?:(?:<!-- -->)|\s)*26/);
  assert.match(html, /aria-label="上一页"/);
  assert.match(html, /aria-label="下一页"/);
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
    new URL("../app/opening/OpeningSequence.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /assets\/audio\/Neon Horizon\.mp3\?url/);
  assert.doesNotMatch(source, /assets\/audio\/opening-bgm\.wav\?url/);
  assert.match(source, /const BGM_VOLUME = 0\.2;/);
  assert.match(source, /const BGM_DUCK_VOLUME = 0\.07;/);
  assert.match(source, /const BGM_CLIP_SECONDS = 60;/);
  assert.match(source, /const BGM_FADE_SECONDS = 8;/);
  assert.match(source, /BGM_CLIP_SECONDS - BGM_FADE_SECONDS/);
  assert.match(source, /if \(bgmFadingOut\) return;/);
});

test("keeps presentation typography legible at a distance", async () => {
  const source = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  const fontSizes = [...source.matchAll(/font-size:\s*(\d+)px/g)].map(
    ([, size]) => Number(size),
  );

  assert.ok(fontSizes.length > 0);
  assert.ok(
    Math.min(...fontSizes) >= 13,
    "presentation text should not render below 13px on the 1920×1080 canvas",
  );
});
