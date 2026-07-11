import esbuild from "esbuild";
import fs from "node:fs/promises";

await esbuild.build({
  entryPoints: ["src/client/api.ts"],
  outfile: "public/api-client.js",
  bundle: true,
  format: "iife",
  globalName: "PrintVisualApi",
  target: ["es2020"],
  charset: "utf8",
  sourcemap: true,
  legalComments: "none"
});

// Keep the verified legacy runtime active until the strict modular client
// reaches behavioral parity. The TypeScript modules are checked separately.
const appSource = await fs.readFile("src/client/app.legacy-runtime.ts", "utf8");
const appResult = await esbuild.transform(appSource, {
  loader: "ts",
  format: "iife",
  target: ["es2020"],
  charset: "utf8",
  sourcemap: true,
  legalComments: "none",
  sourcefile: "src/client/app.legacy-runtime.ts"
});

await fs.writeFile("public/app.js", `${appResult.code}\n//# sourceMappingURL=app.js.map\n`, "utf8");
if (appResult.map) {
  await fs.writeFile("public/app.js.map", appResult.map, "utf8");
}

console.log("Built frontend: src/client/api.ts -> public/api-client.js");
console.log("Built frontend: src/client/app.legacy-runtime.ts -> public/app.js");
