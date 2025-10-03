#!/usr/bin/env node
const { execSync } = require("child_process");
const { writeFileSync, mkdirSync, existsSync, readFileSync } = require("fs");

const appName = process.argv[2] || "my-app";

function run(cmd) {
  console.log("▶", cmd);
  execSync(cmd, { stdio: "inherit", shell: true });
}

run(`npm create vite@latest ${appName} -- --template react-ts`);

process.chdir(appName);

run(`npm install -D tailwindcss @tailwindcss/postcss autoprefixer postcss tailwindcss-animate`);
run(`npm install shadcn@latest`);

writeFileSync(
  "tailwind.config.js",
  `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [require("tailwindcss-animate")],
}
`
);

writeFileSync(
  "postcss.config.js",
  `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
`
);

if (!existsSync("src")) mkdirSync("src");
writeFileSync(
  "src/index.css",
  `@import "tailwindcss";

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));
`
);


const tsconfigPath = "tsconfig.json";
if (existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
  tsconfig.compilerOptions = tsconfig.compilerOptions || {};
  tsconfig.compilerOptions.baseUrl = ".";
  tsconfig.compilerOptions.paths = { "@/*": ["./src/*"] };
  writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
}

try {
  run(`npx shadcn@latest init -y`);
} catch (e) {
  console.log("⚠️  Aviso: No se pudo ejecutar 'shadcn init'. Puedes correrlo luego con:");
  console.log("   npx shadcn@latest init");
}

console.log(`
✅ Proyecto creado en ${appName}
👉 cd ${appName} && npm run dev
`);
