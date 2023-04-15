/*
Steps:

1. determine if it is Vanilla vite, VueJs, React vite, or Svelt
2. For each one different upgrade method
*/
const fs = require("fs").promises;
const util = require("util");
const child_process = require("child_process");
const exec = util.promisify(child_process.exec);

main().catch(console.error);

async function main() {
  const packageJson = JSON.parse((await fs.readFile("./package.json")).toString());
  const upgradeType = getUpgradeType(packageJson);

  if (upgradeType === 'svelte') {
    await svelteUpgrade(packageJson);
  } else if (upgradeType === 'vue') {
    await vueUpgrade(packageJson);
  } else if (upgradeType === 'react') {
    await reactUpgrade(packageJson);
  } else if (upgradeType === 'vanilla') {
    await vanillaUpgrade(packageJson);
  }
}

function getDep(dep, packageJson) {
  if (packageJson.devDependencies && dep in packageJson.devDependencies) {
    return packageJson.devDependencies[dep];
  }
  if (packageJson.dependencies && dep in packageJson.dependencies) {
    return packageJson.dependencies[dep];
  }
  return null;
}

function updateDep(dep, version, packageJson) {
  if (packageJson.devDependencies && dep in packageJson.devDependencies) {
    packageJson.devDependencies[dep] = version;
  }
  if (packageJson.dependencies && dep in packageJson.dependencies) {
    packageJson.dependencies[dep] = version;
  }
}

function getUpgradeType(packageJson) {
  if (getDep('svelte', packageJson)) {
    return 'svelte';
  } else if (getDep("@vitejs/plugin-vue", packageJson)) {
    return 'vue';
  } else if (getDep('react', packageJson)) {
    return 'react';
  } else {
    return 'vanilla';
  }
}

async function svelteUpgrade(packageJson) {
  console.log("Performing Svelte Vite.js upgrade...")
  packageJson.devDependencies.vite = '^3.0.4';
  packageJson.devDependencies.svelte = '^3.49.0';
  packageJson.devDependencies['@sveltejs/vite-plugin-svelte'] = '^1.0.1';
  console.log(packageJson);
  await fs.writeFile("./package.json", JSON.stringify(packageJson, null, "  "));
  console.log("Wrote package.json");
  console.log("Execute npm install...");
  const { stdout, stderr } = await exec("npm install");
  console.log(stdout);
  if (stderr) {
    console.log(stderr);
  }
  const viteConfig = `import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true
  }
})
`;
  await fs.writeFile('./vite.config.js', viteConfig);
  console.log("Wrote vite.config.js");
}

async function vueUpgrade(packageJson) {
  console.log("Performing VueJS Vite.js upgrade...")
  packageJson.devDependencies.vite = '^3.0.4';
  delete packageJson.devDependencies["@vue/compiler-sfc"];
  packageJson.devDependencies["@vitejs/plugin-vue"] = "^3.0.1";
  if (packageJson.dependencies && packageJson.dependencies.vue) {
    console.log("setting vue version")
    packageJson.dependencies.vue = "^3.2.37";
  }
  console.log(packageJson);
  await fs.writeFile("./package.json", JSON.stringify(packageJson, null, "  "));
  console.log("Wrote package.json");

  console.log("Execute npm install...");
  const { stdout, stderr } = await exec("npm install");
  console.log(stdout);
  if (stderr) {
    console.log(stderr);
  }
  if (await exists("./yarn.lock")) {
    await fs.unlink("./yarn.lock");
  }
  await exec(`sed -i 's/"yarn dev"/"npm run dev"/' .replit`);
  const viteConfig = `
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
`;
  await fs.writeFile("./vite.config.js", viteConfig);
  console.log("Wrote vite.config.js");
}

async function reactUpgrade(packageJson) {
  console.log("Performing React Vite.js upgrade...");
  updateDep('vite', "^3.0.4", packageJson);
  if (packageJson.devDependencies) {
    packageJson.devDependencies["@vitejs/plugin-react"] = "^2.0.0";
  } else {
    packageJson.dependencies["@vitejs/plugin-react"] = "^2.0.0";
  }
  delete packageJson.dependencies['@vitejs/plugin-react-refresh'];
  console.log(packageJson);
  await fs.writeFile("./package.json", JSON.stringify(packageJson, null, "  "));
  console.log("Wrote package.json");

  console.log("Execute npm install...");
  const { stdout, stderr } = await exec("npm install");
  console.log(stdout);
  if (stderr) {
    console.log(stderr);
  }

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  }
})
`;
  await fs.writeFile("./vite.config.js", viteConfig);
  console.log("Wrote vite.config.js");
}

async function vanillaUpgrade(packageJson) {
  console.log("Performing vanilla Vite.js upgrade...");
  updateDep('vite', "^3.0.4", packageJson);
  
  console.log(packageJson);
  await fs.writeFile("./package.json", JSON.stringify(packageJson, null, "  "));
  console.log("Wrote package.json");

  console.log("Execute npm install...");
  const { stdout, stderr } = await exec("npm install");
  console.log(stdout);
  if (stderr) {
    console.log(stderr);
  }
}

async function exists(filepath) {
  try {
    await fs.access(filepath, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}