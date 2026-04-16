import fs from "node:fs/promises";
import { DashboardConfig, LogSourceConfig } from "../../shared/types.js";

function getLogSource(config: DashboardConfig, logId: string): LogSourceConfig {
  const match = config.logs.find((log) => log.id === logId);

  if (!match) {
    throw new Error(`Unknown log source: ${logId}`);
  }

  return match;
}

export async function readLastLines(
  config: DashboardConfig,
  logId: string,
  lines = 200
): Promise<{ source: LogSourceConfig; content: string }> {
  const source = getLogSource(config, logId);
  const content = await fs.readFile(source.path, "utf8");
  const split = content.split(/\r?\n/);
  const excerpt = split.slice(-lines).join("\n");

  return {
    source,
    content: excerpt
  };
}
