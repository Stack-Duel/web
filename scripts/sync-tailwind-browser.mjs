import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.dirname(
  fileURLToPath(import.meta.resolve("@tailwindcss/browser/package.json"))
);

fs.copyFileSync(
  path.join(pkgDir, "dist", "index.global.js"),
  path.join(dir, "..", "codepreview", "vendor", "tailwind-browser.js")
);
fs.copyFileSync(
  path.join(pkgDir, "LICENSE"),
  path.join(dir, "..", "codepreview", "vendor", "tailwind-browser.LICENSE.txt")
);

console.log(
  "Synced codepreview/vendor/tailwind-browser.js from @tailwindcss/browser"
);
