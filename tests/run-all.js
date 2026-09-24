const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function findTestFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      findTestFiles(fullPath, files);
    } else if (item.name.endsWith(".test.js")) {
      files.push(fullPath);
    }
  }
  return files;
}

const testFiles = findTestFiles(__dirname);
console.log(`\n📋 Ejecutando ${testFiles.length} archivos de test con el runner nativo de Node.js...\n`);

const child = spawn(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
