import assert from "node:assert/strict";
import test from "node:test";

import { isOpeningSkipShortcut } from "../app/opening/opening-shortcuts.ts";

const keyboardEvent = (overrides = {}) => ({
  altKey: false,
  ctrlKey: false,
  key: "End",
  metaKey: false,
  shiftKey: true,
  ...overrides,
});

test("Shift + End and Shift + ArrowRight skip the opening", () => {
  assert.equal(isOpeningSkipShortcut(keyboardEvent()), true);
  assert.equal(
    isOpeningSkipShortcut(keyboardEvent({ key: "ArrowRight" })),
    true,
  );
  assert.equal(
    isOpeningSkipShortcut(keyboardEvent({ shiftKey: false })),
    false,
  );
  assert.equal(
    isOpeningSkipShortcut(keyboardEvent({ ctrlKey: true })),
    false,
  );
  assert.equal(
    isOpeningSkipShortcut(
      keyboardEvent({ key: "ArrowRight", shiftKey: false }),
    ),
    false,
  );
});
