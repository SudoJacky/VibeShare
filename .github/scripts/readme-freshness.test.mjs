import assert from "node:assert/strict";
import {
  chmodSync,
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(
  new URL("./readme-freshness.mjs", import.meta.url),
);
const hookPath = fileURLToPath(
  new URL("../../.githooks/pre-commit", import.meta.url),
);

function run(command, arguments_, cwd) {
  return spawnSync(command, arguments_, {
    cwd,
    encoding: "utf8",
  });
}

function git(repository, ...arguments_) {
  const result = run("git", arguments_, repository);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

function write(repository, path, contents) {
  const absolutePath = join(repository, ...path.split("/"));
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents, "utf8");
}

function fixture(t) {
  const repository = mkdtempSync(join(tmpdir(), "vibeshare-readme-freshness-"));
  t.after(() => rmSync(repository, { recursive: true, force: true }));

  git(repository, "init");
  git(repository, "config", "user.name", "VibeShare Tests");
  git(repository, "config", "user.email", "vibeshare@example.com");
  write(repository, "app/README.md", "# Application\n\nApplication overview.\n");
  write(repository, "app/page.tsx", "export default function Page() {}\n");
  write(repository, "app/opening/README.md", "# Opening\n\nOpening overview.\n");
  write(repository, "app/opening/sequence.tsx", "export function Sequence() {}\n");
  write(repository, "worker/README.md", "# Worker\n\nWorker overview.\n");
  write(repository, "worker/index.ts", "export default { fetch() {} };\n");
  git(repository, "add", ".");
  git(repository, "commit", "-m", "test: create fixture");
  return repository;
}

function readmeTool(repository, ...arguments_) {
  return run(process.execPath, [scriptPath, ...arguments_], repository);
}

test("review records a fingerprint and check detects later changes", (t) => {
  const repository = fixture(t);
  const modulePath = "app/opening";
  const source = "app/opening/sequence.tsx";

  const beforeReview = readmeTool(repository, "check", modulePath);
  assert.equal(beforeReview.status, 1);
  assert.match(beforeReview.stdout, /UNREVIEWED\s+app\/opening\/README\.md/);

  const reviewed = readmeTool(repository, "review", modulePath);
  assert.equal(reviewed.status, 0, reviewed.stderr);
  assert.match(reviewed.stdout, /REVIEWED\s+app\/opening\/README\.md/);
  assert.match(
    readFileSync(join(repository, "app/opening/README.md"), "utf8"),
    /^<!-- vibeshare-module-fingerprint: sha256:[a-f0-9]{64} -->$/m,
  );

  const current = readmeTool(repository, "check", modulePath);
  assert.equal(current.status, 0, current.stdout + current.stderr);
  assert.match(current.stdout, /CURRENT\s+app\/opening\/README\.md/);

  git(repository, "config", "core.autocrlf", "true");
  write(repository, source, "export function Sequence() {}\r\n");
  const differentCheckoutNewlines = readmeTool(repository, "check", modulePath);
  assert.equal(
    differentCheckoutNewlines.status,
    0,
    differentCheckoutNewlines.stdout + differentCheckoutNewlines.stderr,
  );

  write(repository, source, "export function Sequence() { return 'changed'; }\r\n");
  const stale = readmeTool(repository, "check", modulePath);
  assert.equal(stale.status, 1);
  assert.match(stale.stdout, /STALE\s+app\/opening\/README\.md/);
  assert.match(stale.stdout, /changed: app\/opening\/sequence\.tsx/);
});

test("a file belongs only to its nearest ancestor README", (t) => {
  const repository = fixture(t);
  const parent = "app";
  const child = "app/opening";

  assert.equal(readmeTool(repository, "review", parent, child).status, 0);
  write(
    repository,
    "app/opening/sequence.tsx",
    "export function Sequence() { return 'child'; }\n",
  );

  const parentAfterChildChange = readmeTool(repository, "check", parent);
  assert.equal(parentAfterChildChange.status, 0, parentAfterChildChange.stdout);
  assert.match(parentAfterChildChange.stdout, /CURRENT\s+app\/README\.md/);
  assert.equal(readmeTool(repository, "check", child).status, 1);

  write(repository, "app/page.tsx", "export default function Page() { return null; }\n");
  const parentAfterOwnChange = readmeTool(repository, "check", parent);
  assert.equal(parentAfterOwnChange.status, 1);
  assert.match(parentAfterOwnChange.stdout, /changed: app\/page\.tsx/);
});

test("staged checks enforce only affected modules and ignore unstaged content", (t) => {
  const repository = fixture(t);
  const modulePath = "app/opening";
  const source = "app/opening/sequence.tsx";
  const readme = "app/opening/README.md";

  write(repository, source, "export function Sequence() { return 'staged'; }\n");
  git(repository, "add", source);

  const unreviewed = readmeTool(repository, "check", "--staged");
  assert.equal(unreviewed.status, 1);
  assert.match(unreviewed.stdout, /UNREVIEWED\s+app\/opening\/README\.md/);
  assert.doesNotMatch(unreviewed.stdout, /UNREVIEWED\s+app\/README\.md/);

  assert.equal(readmeTool(repository, "review", modulePath).status, 0);
  git(repository, "add", readme);
  const reviewed = readmeTool(repository, "check", "--staged");
  assert.equal(reviewed.status, 0, reviewed.stdout + reviewed.stderr);

  write(repository, source, "export function Sequence() { return 'unstaged'; }\n");
  const ignoresUnstaged = readmeTool(repository, "check", "--staged");
  assert.equal(ignoresUnstaged.status, 0, ignoresUnstaged.stdout + ignoresUnstaged.stderr);
});

test("staged review fingerprints the index instead of working-tree content", (t) => {
  const repository = fixture(t);
  const modulePath = "app/opening";
  const source = "app/opening/sequence.tsx";
  const readme = "app/opening/README.md";

  write(repository, source, "export function Sequence() { return 'staged'; }\n");
  git(repository, "add", source);
  write(repository, source, "export function Sequence() { return 'unstaged'; }\n");

  const reviewed = readmeTool(repository, "review", "--staged", modulePath);
  assert.equal(reviewed.status, 0, reviewed.stderr);
  git(repository, "add", readme);

  const stagedCheck = readmeTool(repository, "check", "--staged");
  assert.equal(stagedCheck.status, 0, stagedCheck.stdout + stagedCheck.stderr);

  const workingTreeCheck = readmeTool(repository, "check", modulePath);
  assert.equal(workingTreeCheck.status, 1);
  assert.match(workingTreeCheck.stdout, /STALE\s+app\/opening\/README\.md/);
});

test("the pre-commit hook blocks an unreviewed staged module", (t) => {
  const repository = fixture(t);
  const repositoryScript = join(repository, ".github/scripts/readme-freshness.mjs");
  const repositoryHook = join(repository, ".githooks/pre-commit");
  mkdirSync(dirname(repositoryScript), { recursive: true });
  mkdirSync(dirname(repositoryHook), { recursive: true });
  copyFileSync(scriptPath, repositoryScript);
  copyFileSync(hookPath, repositoryHook);
  chmodSync(repositoryHook, 0o755);
  git(repository, "config", "core.hooksPath", ".githooks");

  const note = "app/opening/notes.txt";
  write(repository, note, "A staged module change.\n");
  git(repository, "add", note);

  const rejected = run("git", ["commit", "-m", "test: unreviewed module"], repository);
  assert.equal(rejected.status, 1);
  assert.match(
    rejected.stdout + rejected.stderr,
    /UNREVIEWED\s+app\/opening\/README\.md/,
  );

  assert.equal(readmeTool(repository, "review", "app/opening").status, 0);
  git(repository, "add", "app/opening/README.md");
  const accepted = run("git", ["commit", "-m", "test: reviewed module"], repository);
  assert.equal(accepted.status, 0, accepted.stdout + accepted.stderr);
});

test("review fails when a module README owns no tracked files", (t) => {
  const repository = fixture(t);
  write(repository, "worker/empty/README.md", "# Empty module\n");
  git(repository, "add", ".");
  git(repository, "commit", "-m", "test: add empty module");

  const reviewed = readmeTool(repository, "review", "worker/empty");
  assert.equal(reviewed.status, 1);
  assert.match(
    reviewed.stderr,
    /module README owns no tracked files: worker\/empty\/README\.md/,
  );
});
