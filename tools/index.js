const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const express = require("express");
const { createServer } = require("vite");
const reactRefresh = require("@vitejs/plugin-react-refresh").default;
const ReplitDB = require("@replit/database");

const db = new ReplitDB();

async function init(output) {
  const app = express();
  const server = http.createServer(app);

  const vite = await createServer({
    plugins: [reactRefresh()],
    server: {
      middlewareMode: "true",
      hmr: {
        clientPort: 443,
        server: server,
      },
    },
    configFile: false,
  });

  app.get("/", async (req, res) => {
    const url = req.originalUrl;
    const template = await vite.transformIndexHtml(
      req.originalUrl,
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>dApp</title>
					<link rel="preconnect" href="https://fonts.googleapis.com">
					<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
					<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@400;500&display=swap" rel="stylesheet">
        </head>
        <body>
          <div id="root">Loading...</div>
          <script type="module" src="/tools/ui.jsx"></script>
        </body>
      </html>
    `
    );

    res.end(template);
  });

  let first = true;

  app.get("/compile", async (req, res) => {
    res.json(compile()).end();
  });

  app.get("/watch/:mtime", async (req, res) => {
    const reqMtime = parseInt(req.params.mtime);
    const fileMtime = fs.statSync("contract.sol").mtime.getTime();
    if (reqMtime < fileMtime) {
      compile().then(
        (output) => res.json({ changed: true, output, mtime: fileMtime }),
        (error) => console.error(error)
      );
      return;
    }

    var watcher = fs.watch("contract.sol", "utf-8", (event, filename) => {
      clearTimeout(timeout);
      watcher.close();
      compile().then(
        (output) =>
          res.json({
            changed: true,
            output,
            mtime: fs.statSync("contract.sol").mtime.getTime(),
          }),
        (error) => console.error(error)
      );
    });
    var timeout = setTimeout(() => {
      watcher.close();
      res.json({ changed: false }).end();
    }, 30000);
    req.on("close", () => {
      clearTimeout(timeout);
      watcher.close();
    });
  });

  app.get("/contracts", async (req, res) => {
    const contracts = await db.get("contracts").catch((err) => null);
    res.json(contracts || []).end();
  });

  app.post("/contracts", express.json(), async (req, res) => {
    if (req.body) {
      await db.set("contracts", req.body);
    }
    res.json({ success: true }).end();
  });

  app.use(vite.middlewares);
  server.listen(3000, () => console.log("Ready"));

  process.on('SIGTERM', () => {
    process.exit(0);
  });
}

// solcjs is less efficient but more hackable,
// e.g. can specify import resolver that behaves like commonjs
async function compile() {
  const solc = require("solc");

  const sources = {};
  for (const src of fs.readdirSync(path.join(__dirname, ".."))) {
    if (src.endsWith(".sol")) {
      sources[src] = {
        content: fs.readFileSync(src, "utf8"),
      };
    }
  }

  const input = {
    language: "Solidity",
    sources,
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  function findImports(path) {
    try {
      const file = fs.readFileSync(require.resolve(path), "utf8");
      input.sources[path] = { content: file };
      return { contents: file };
    } catch (error) {
      return { error };
    }
  }

  console.log("Compiling", Object.keys(sources).join(", "));
  const output = JSON.parse(
    solc.compile(JSON.stringify(input), { import: findImports })
  );
  console.log("Compiled");
  return output;
}

// solc is more efficient but it's a binary we can't
// flexibly interact with
function compile2() {
  return new Promise((resolve, reject) => {
    const proc = spawn("solc", [
      "@=node_modules/@",
      "--allow-paths",
      '""',
      "--combined-json",
      "abi,bin",
      "contract.sol",
    ]);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (data) => (stdout += data));
    proc.stderr.on("data", (data) => (stderr += data));
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(toJS(JSON.parse(stdout)));
      } else {
        resolve({ errors: [{ formattedMessage: stderr }] });
      }
    });
  });
}

// Change it to the format ui is expecting
// It's legacy from solcjs and we should change the UI
function toJS(output) {
  const contracts = {};
  for (const [name, data] of Object.entries(output.contracts)) {
    const [file, contract] = name.split(":");
    contracts[file] = contracts[file] || {};
    contracts[file][contract] = {
      abi: data.abi,
      evm: {
        bytecode: {
          object: data.bin,
        },
      },
    };
  }

  return { contracts };
}

init();
console.log("Done!");
