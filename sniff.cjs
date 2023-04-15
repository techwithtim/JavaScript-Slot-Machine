const fs = require("fs").promises;
const assert = require("assert");

main().catch(console.error);

async function main() {
  const packageJson = JSON.parse((await fs.readFile("./package.json")).toString());
  const viteVersion = getViteVersion(packageJson);

  if (!lessOrEqual(viteVersion, [2, 9, 9])) {
    console.log("Vite.js verion " + viteVersion.join(".") + " is not vulnerable.");
    return;
  } else {
    console.log("Vite.js verion " + viteVersion.join(".") + " is vulnerable. Perform upgrade.");
    const type = getUpgradeType(packageJson);

    console.log("Upgrade type:", type);
  }
}

function getViteVersion(packageJson) {
  let vite = getDep('vite', packageJson);
  if (!vite) {
    return null;
  }
  let version = vite;
  if (version[0] === '^') {
    version = version.substring(1);
  }
  return version.split(".").map(Number);
}

function lessOrEqual(subject, target) {
  assert.equal(subject.length, 3);
  assert.equal(subject.length, target.length);

  for (let i = 0; i < 3; i++) {
    if (subject[i] < target[i]) {
      return true;
    } else if (subject[i] === target[i]) {
      continue;
    } else {
      return false;
    }
  }

  return true;
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