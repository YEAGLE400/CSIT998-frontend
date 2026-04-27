import { spawn, spawnSync } from "node:child_process"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm"
const children = []

function stopAll(signal = "SIGTERM") {
  for (const child of children) {
    if (!child.killed) child.kill(signal)
  }
}

function run(name, command, args) {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  })

  children.push(child)

  child.on("exit", (code, signal) => {
    if (signal) {
      stopAll(signal)
      process.exit(0)
    }

    if (code !== 0) {
      console.error(`\n${name} exited with code ${code}.\n`)
      stopAll()
      process.exit(code || 1)
    }
  })
}

const uvCheck = spawnSync("uv", ["--version"], { stdio: "ignore" })
if (uvCheck.error || uvCheck.status !== 0) {
  console.error(
    [
      "",
      "Speak full-stack mode needs uv for the local Python AI backend.",
      "Install it once, then run npm run dev:speak again:",
      "",
      "  curl -LsSf https://astral.sh/uv/install.sh | sh",
      "",
      "The normal frontend-only command still works:",
      "",
      "  npm run dev",
      "",
    ].join("\n"),
  )
  process.exit(1)
}

process.on("SIGINT", () => {
  stopAll("SIGINT")
  process.exit(0)
})
process.on("SIGTERM", () => {
  stopAll("SIGTERM")
  process.exit(0)
})

run("Speak backend", npmCommand, ["run", "dev:speak-backend"])
run("Next.js frontend", npmCommand, ["run", "dev"])
