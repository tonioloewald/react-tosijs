import * as path from "path";
import { statSync } from "fs";
import { watch } from "chokidar";
import { $ } from "bun";

const PORT = 8016;
const PROJECT_ROOT = "./";
const PUBLIC = path.resolve(PROJECT_ROOT, "docs");
const DIST = path.resolve(PROJECT_ROOT, "dist");
const isSPA = true;

async function prebuild() {
  console.time("prebuild");
  const config = JSON.parse(await Bun.file("package.json").text());
  await Bun.write(
    "src/version.ts",
    `export const version = '${config.version}'`,
  );
  console.log(config.version);

  let output = await $`rm -rf ${PUBLIC}`.text();
  output = await $`mkdir ${PUBLIC}`.text();
  output = await $`cp ./demo/static/* ${PUBLIC}`.text();

  output = await $`rm -rf ${DIST}`.text();
  output = await $`mkdir ${DIST}`.text();
  console.timeEnd("prebuild");

  await build();
}

async function build() {
  console.time("build");
  let result;

  try {
    await $`bun tsc --declaration --emitDeclarationOnly --outDir dist`;
  } catch (e) {
    console.log("types created");
  }
  result = await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: DIST,
    sourcemap: "linked",
    format: "esm",
    // minify: true,
    external: ["tosijs", "react"],
  });
  if (!result.success) {
    console.error("dist build failed");
    for (const message of result.logs) {
      console.error(message);
    }
    return;
  }

  await Bun.build({
    entrypoints: ["./demo/src/index.tsx"],
    outdir: PUBLIC,
    target: "browser",
  });
  if (!result.success) {
    console.error("demo build failed");
    for (const message of result.logs) {
      console.error(message);
    }
    return;
  }

  console.timeEnd("build");
}

const buildOnly = process.argv.includes("--build");

if (!buildOnly) {
  watch("./src").on("change", build);
  watch("./demo").on("change", prebuild);
}

await prebuild();

if (buildOnly) {
  process.exit(0);
}

function serveFromDir(config: {
  directory: string;
  path: string;
}): Response | null {
  let basePath = path.join(config.directory, config.path);
  const suffixes = ["", ".html", "index.html"];

  for (const suffix of suffixes) {
    try {
      const pathWithSuffix = path.join(basePath, suffix);
      const stat = statSync(pathWithSuffix);
      if (stat && stat.isFile()) {
        return new Response(Bun.file(pathWithSuffix));
      }
    } catch (err) {}
  }

  return null;
}

const server = Bun.serve({
  port: PORT,
  fetch(request) {
    let reqPath = new URL(request.url).pathname;
    console.log(request.method, reqPath);
    if (reqPath === "/") reqPath = "/index.html";

    const buildResponse = serveFromDir({
      directory: PUBLIC,
      path: reqPath,
    });
    if (buildResponse) return buildResponse;

    if (isSPA) {
      const spaResponse = serveFromDir({
        directory: PUBLIC,
        path: "/index.html",
      });
      console.log(spaResponse);
      if (spaResponse) return spaResponse;
    }
    return new Response("File not found", {
      status: 404,
    });
  },
});

console.log(`Listening on https://localhost:${PORT}`);
