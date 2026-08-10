import assert from "node:assert/strict";
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
  assert.match(html, /AI 写得越来越快/);
  assert.match(html, /VIBE CODING \/ FIELD NOTES/);
  assert.match(html, /探索加速/);
  assert.match(html, /失控风险/);
  assert.match(html, /重建控制/);
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
