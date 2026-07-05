import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceFile = path.join(root, "print 1.8.28.html");
const publicDir = path.join(root, "public");
const clientDir = path.join(root, "src", "client");

fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(clientDir, { recursive: true });

let html = fs.readFileSync(sourceFile, "utf8");

function takeFirstBlock(source, startTag, endTag, replacement) {
  const start = source.indexOf(startTag);
  if (start < 0) throw new Error(`Missing ${startTag}`);

  const contentStart = start + startTag.length;
  const end = source.indexOf(endTag, contentStart);
  if (end < 0) throw new Error(`Missing ${endTag}`);

  return {
    content: source.slice(contentStart, end).trimStart(),
    html: source.slice(0, start) + replacement + source.slice(end + endTag.length)
  };
}

function takeLastBlock(source, startTag, endTag, replacement) {
  const start = source.lastIndexOf(startTag);
  if (start < 0) throw new Error(`Missing ${startTag}`);

  const contentStart = start + startTag.length;
  const end = source.indexOf(endTag, contentStart);
  if (end < 0) throw new Error(`Missing ${endTag}`);

  return {
    content: source.slice(contentStart, end).trimStart(),
    html: source.slice(0, start) + replacement + source.slice(end + endTag.length)
  };
}

const redirect = takeFirstBlock(html, "<script>", "</script>", '<script src="/redirect.js"></script>');
fs.writeFileSync(path.join(publicDir, "redirect.js"), redirect.content, "utf8");
html = redirect.html;

const styles = takeFirstBlock(html, "<style>", "</style>", '<link rel="stylesheet" href="/styles.css">');
fs.writeFileSync(path.join(publicDir, "styles.css"), styles.content, "utf8");
html = styles.html;

const app = takeLastBlock(html, "<script>", "</script>", [
  '<script src="/api-client.js"></script>',
  '<script src="/app.js"></script>'
].join("\n            "));
fs.writeFileSync(
  path.join(clientDir, "app.legacy-extracted.ts"),
  `// @ts-nocheck\n// Legacy extraction snapshot. Do not edit directly; migrate changes into src/client/app.ts.\n\n${app.content}`,
  "utf8"
);
html = app.html;

fs.writeFileSync(path.join(publicDir, "index.html"), html, "utf8");

console.log("Extracted frontend shell to public/ and legacy app snapshot to src/client/app.legacy-extracted.ts");
