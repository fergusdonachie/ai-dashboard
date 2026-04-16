export type StatusType = "process" | "command" | "url";

export interface ServiceConfig {
  id: string;
  name: string;
  description?: string;
  statusType: StatusType;
  statusCheck: string | string[];
  startCommand?: string[];
  stopCommand?: string[];
  restartCommand?: string[];
  cwd?: string;
  logPath?: string;
}

export interface ActionConfig {
  id: string;
  label: string;
  description?: string;
  category?: string;
  command: string[];
  cwd?: string;
  timeoutMs?: number;
  requiresConfirmation?: boolean;
  streamOutput?: boolean;
}

export interface LogSourceConfig {
  id: string;
  name: string;
  path: string;
  description?: string;
}

export interface LinkConfig {
  id: string;
  label: string;
  url: string;
  description?: string;
}

export interface FeatureFlags {
  liveLogs: boolean;
  terminal: boolean;
}

export interface DashboardConfig {
  machineName: string;
  role: string;
  port: number;
  host?: string;
  services: ServiceConfig[];
  actions: ActionConfig[];
  logs: LogSourceConfig[];
  links: LinkConfig[];
  features: FeatureFlags;
}

export interface ServiceStatus {
  id: string;
  name: string;
  description?: string;
  state: "online" | "offline" | "degraded";
  detail: string;
  logPath?: string;
  actions: {
    canStart: boolean;
    canStop: boolean;
    canRestart: boolean;
  };
}

export interface CommandResult {
  command: string[];
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  exitCode: number | null;
  timedOut: boolean;
  stdout: string;
  stderr: string;
}

export interface SystemSummary {
  hostname: string;
  username: string;
  platform: string;
  uptimeSeconds: number;
  loadAverage: number[];
  totalMemoryBytes: number;
  freeMemoryBytes: number;
  diskFree?: string;
}

export interface DashboardSnapshot {
  generatedAt: string;
  config: {
    machineName: string;
    role: string;
    features: FeatureFlags;
    servicesCount: number;
    actionsCount: number;
    logsCount: number;
    linksCount: number;
  };
  system: SystemSummary;
  services: ServiceStatus[];
  actions: ActionConfig[];
  logs: LogSourceConfig[];
  links: LinkConfig[];
}
