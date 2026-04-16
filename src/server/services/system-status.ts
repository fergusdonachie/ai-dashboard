import os from "node:os";
import { runCommand } from "./command-runner.js";
import { SystemSummary } from "../../shared/types.js";

async function getDiskFree(): Promise<string | undefined> {
  try {
    const result = await runCommand({
      command: ["df", "-h", "/"],
      timeoutMs: 5_000
    });
    const lines = result.stdout.trim().split("\n");
    const row = lines[1];

    if (!row) {
      return undefined;
    }

    const columns = row.split(/\s+/);
    return columns[3];
  } catch {
    return undefined;
  }
}

export async function getSystemSummary(startedAt: number): Promise<SystemSummary> {
  return {
    hostname: os.hostname(),
    username: os.userInfo().username,
    platform: `${os.platform()} ${os.release()}`,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    loadAverage: os.loadavg(),
    totalMemoryBytes: os.totalmem(),
    freeMemoryBytes: os.freemem(),
    diskFree: await getDiskFree()
  };
}
