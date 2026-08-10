import assert from "node:assert/strict";
import test from "node:test";

import { syncPresentationHash } from "../app/presentation-location.ts";

test("syncing slide position does not emit a hash navigation", () => {
  let currentHash = "#/page/0/frame/0";
  let directHashWrites = 0;
  const replacements = [];
  const targetWindow = {
    location: {
      get hash() {
        return currentHash;
      },
      set hash(value) {
        directHashWrites += 1;
        currentHash = value;
      },
    },
    history: {
      state: { source: "test" },
      replaceState(state, unused, url) {
        replacements.push({ state, unused, url });
        currentHash = String(url);
      },
    },
  };

  syncPresentationHash(targetWindow, 1, 2);

  assert.equal(directHashWrites, 0);
  assert.deepEqual(replacements, [
    {
      state: { source: "test" },
      unused: "",
      url: "#/page/1/frame/2",
    },
  ]);

  syncPresentationHash(targetWindow, 1, 2);
  assert.equal(replacements.length, 1);
});
