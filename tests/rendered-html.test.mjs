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
  assert.match(html, /工程对象正在不断向外扩展/);
  assert.match(html, /Loop 解决局部收敛，Graph 解决全局协作/);
  assert.match(html, /Dynamic Workflows 是实现，Graph Engineering 是方法/);
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
  assert.match(html, /00(?:(?:<!-- -->)|\s)*\/(?:(?:<!-- -->)|\s)*25/);
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
