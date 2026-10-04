import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [path.join(dir, "preview-runtime-entry.js")],
  bundle: true,
  format: "iife",
  minify: true,
  target: "es2019",
  outfile: path.join(
    dir,
    "..",
    "codepreview",
    "vendor",
    "react-preview-runtime.js"
  ),
  define: { "process.env.NODE_ENV": '"production"' },
});

console.log("Built codepreview/vendor/react-preview-runtime.js");
