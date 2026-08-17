import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const fallbackRepository = "SudoJacky/VibeShare";
const [owner, repository] = (
  process.env.GITHUB_REPOSITORY ?? fallbackRepository
).split("/");
const isAccountSite =
  repository.toLowerCase() === `${owner.toLowerCase()}.github.io`;
const basePath = isAccountSite ? "" : `/${repository}`;
const siteUrl = `https://${owner.toLowerCase()}.github.io${basePath}/`;
const vinextCli = fileURLToPath(
  new URL("../node_modules/vinext/dist/cli.js", import.meta.url),
);

const build = spawn(process.execPath, [vinextCli, "build"], {
  env: {
    ...process.env,
    GITHUB_PAGES_BUILD: "true",
    PAGES_BASE_PATH: basePath,
    PAGES_SITE_URL: siteUrl,
  },
  stdio: "inherit",
});

build.on("error", (error) => {
  console.error("Unable to start the GitHub Pages build:", error);
  process.exitCode = 1;
});

build.on("exit", (code, signal) => {
  if (signal) {
    console.error(`GitHub Pages build stopped by signal ${signal}.`);
    process.exitCode = 1;
    return;
  }

  process.exitCode = code ?? 1;
});
