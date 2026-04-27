import { spawn, spawnSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const backendDir = join(rootDir, "speak-backend")

function fail(message) {
  console.error(`\n${message}\n`)
  process.exit(1)
}

const uvCheck = spawnSync("uv", ["--version"], { stdio: "ignore" })
if (uvCheck.error || uvCheck.status !== 0) {
  fail(
    [
      "Speak backend needs uv to run the Python 3.12 model environment.",
      "Install it once, then run this command again:",
      "",
      "  curl -LsSf https://astral.sh/uv/install.sh | sh",
    ].join("\n"),
  )
}

const sync = spawnSync("uv", ["sync"], {
  cwd: backendDir,
  stdio: "inherit",
})

if (sync.error || sync.status !== 0) {
  process.exit(sync.status || 1)
}

const server = spawn("uv", ["run", "server.py"], {
  cwd: backendDir,
  stdio: "inherit",
})

server.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code || 0)
})
