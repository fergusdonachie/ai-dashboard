import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CommandResult } from "../../shared/types.js";

interface RunCommandOptions {
  command: string[];
  cwd?: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 60_000;

export async function runCommand(options: RunCommandOptions): Promise<CommandResult> {
  const { command, cwd, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const [bin, ...args] = command;

  if (!bin) {
    throw new Error("Command is empty");
  }

  const started = Date.now();
  const startedAt = new Date(started).toISOString();

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 1_000).unref();
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (exitCode) => {
      clearTimeout(timeout);
      const finished = Date.now();

      resolve({
        command,
        startedAt,
        finishedAt: new Date(finished).toISOString(),
        durationMs: finished - started,
        exitCode,
        timedOut,
        stdout,
        stderr
      });
    });
  });
}

export function appendAuditLog(filePath: string, payload: Record<string, unknown>): void {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(payload)}\n`, "utf8");
}
