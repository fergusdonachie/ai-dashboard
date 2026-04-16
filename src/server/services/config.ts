import fs from "node:fs";
import path from "node:path";
import { DashboardConfig } from "../../shared/types.js";
import { configDirectory, projectRoot } from "../utils/paths.js";

const DEFAULT_PROFILE = "openclaw-mac";

export function getActiveProfile(): string {
  return process.env.DASHBOARD_PROFILE || DEFAULT_PROFILE;
}

export function loadConfig(profile = getActiveProfile()): DashboardConfig {
  const configPath = path.join(configDirectory, `${profile}.json`);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config profile not found: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(raw) as DashboardConfig;

  return {
    ...parsed,
    port: Number(process.env.PORT || parsed.port || 3000),
    host: process.env.HOST || parsed.host || "0.0.0.0",
    services: parsed.services.map((service) => ({
      ...service,
      cwd: service.cwd ? path.resolve(projectRoot, service.cwd) : undefined,
      logPath: service.logPath ? path.resolve(projectRoot, service.logPath) : undefined
    })),
    actions: parsed.actions.map((action) => ({
      ...action,
      cwd: action.cwd ? path.resolve(projectRoot, action.cwd) : undefined
    })),
    logs: parsed.logs.map((log) => ({
      ...log,
      path: path.resolve(projectRoot, log.path)
    }))
  };
}
