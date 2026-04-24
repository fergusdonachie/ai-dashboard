import { runCommand } from "./command-runner.js";
import { DashboardConfig, ServiceConfig, ServiceStatus } from "../../shared/types.js";

async function checkProcess(pattern: string): Promise<Pick<ServiceStatus, "state" | "detail">> {
  const result = await runCommand({
    command: ["pgrep", "-fl", pattern],
    timeoutMs: 5_000
  });

  if (result.exitCode === 0 && result.stdout.trim()) {
    const lines = result.stdout.trim().split("\n");
    return {
      state: "online",
      detail: lines[0]
    };
  }

  return {
    state: "offline",
    detail: "No matching process found"
  };
}

async function checkCommand(
  command: string[],
  cwd?: string
): Promise<Pick<ServiceStatus, "state" | "detail">> {
  const result = await runCommand({
    command,
    cwd,
    timeoutMs: 8_000
  });

  if (result.exitCode === 0) {
    return {
      state: "online",
      detail: (result.stdout || "Command succeeded").trim().slice(0, 160)
    };
  }

  return {
    state: "offline",
    detail: (result.stderr || result.stdout || "Command failed").trim().slice(0, 160)
  };
}

async function checkUrl(target: string): Promise<Pick<ServiceStatus, "state" | "detail">> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(target, {
      method: "GET",
      signal: controller.signal
    });

    return {
      state: response.ok ? "online" : "degraded",
      detail: `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      state: "offline",
      detail: error instanceof Error ? error.message : String(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function getStatus(service: ServiceConfig): Promise<ServiceStatus> {
  let baseStatus: Pick<ServiceStatus, "state" | "detail">;

  switch (service.statusType) {
    case "process":
      baseStatus = await checkProcess(String(service.statusCheck));
      break;
    case "command":
      baseStatus = await checkCommand(
        Array.isArray(service.statusCheck) ? service.statusCheck : [String(service.statusCheck)],
        service.cwd
      );
      break;
    case "url":
      baseStatus = await checkUrl(String(service.statusCheck));
      break;
    default:
      baseStatus = {
        state: "degraded",
        detail: "Unsupported status type"
      };
  }

  return {
    id: service.id,
    name: service.name,
    description: service.description,
    state: baseStatus.state,
    detail: baseStatus.detail,
    logPath: service.logPath,
    actions: {
      canStart: Boolean(service.startCommand),
      canStop: Boolean(service.stopCommand),
      canRestart: Boolean(service.restartCommand)
    }
  };
}

export async function getAllServiceStatuses(config: DashboardConfig): Promise<ServiceStatus[]> {
  return Promise.all(config.services.map((service) => getStatus(service)));
}
