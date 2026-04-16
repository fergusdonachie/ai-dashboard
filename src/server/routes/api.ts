import { Router } from "express";
import { DashboardConfig } from "../../shared/types.js";
import { appendAuditLog, runCommand } from "../services/command-runner.js";
import { loadConfig } from "../services/config.js";
import { readLastLines } from "../services/log-reader.js";
import { getAllServiceStatuses } from "../services/service-status.js";
import { getSystemSummary } from "../services/system-status.js";
import { getErrorMessage } from "../utils/errors.js";

interface RouteOptions {
  config: DashboardConfig;
  startedAt: number;
}

function getAuditLogPath(): string {
  return process.env.ACTION_AUDIT_LOG || "logs/actions.log";
}

export function createApiRouter(options: RouteOptions): Router {
  const router = Router();
  const getConfig = (): DashboardConfig => loadConfig();

  router.get("/health", (_req, res) => {
    const config = getConfig();
    res.json({
      ok: true,
      profile: config.role,
      generatedAt: new Date().toISOString()
    });
  });

  router.get("/dashboard", async (_req, res) => {
    try {
      const config = getConfig();
      const [system, services] = await Promise.all([
        getSystemSummary(options.startedAt),
        getAllServiceStatuses(config)
      ]);

      res.json({
        generatedAt: new Date().toISOString(),
        config: {
          machineName: config.machineName,
          role: config.role,
          features: config.features,
          servicesCount: config.services.length,
          actionsCount: config.actions.length,
          logsCount: config.logs.length,
          linksCount: config.links.length
        },
        system,
        services,
        actions: config.actions,
        logs: config.logs,
        links: config.links
      });
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.get("/services", async (_req, res) => {
    try {
      res.json(await getAllServiceStatuses(getConfig()));
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.post("/services/:id/:operation", async (req, res) => {
    try {
      const config = getConfig();
      const service = config.services.find((item) => item.id === req.params.id);

      if (!service) {
        res.status(404).json({ error: "Service not found" });
        return;
      }

      const operation = req.params.operation;
      const command =
        operation === "start"
          ? service.startCommand
          : operation === "stop"
            ? service.stopCommand
            : operation === "restart"
              ? service.restartCommand
              : undefined;

      if (!command) {
        res.status(400).json({ error: `Operation not available: ${operation}` });
        return;
      }

      const result = await runCommand({
        command,
        cwd: service.cwd,
        timeoutMs: 60_000
      });

      appendAuditLog(getAuditLogPath(), {
        type: "service",
        serviceId: service.id,
        operation,
        result,
        timestamp: new Date().toISOString()
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.post("/actions/:id/run", async (req, res) => {
    try {
      const config = getConfig();
      const action = config.actions.find((item) => item.id === req.params.id);

      if (!action) {
        res.status(404).json({ error: "Action not found" });
        return;
      }

      const result = await runCommand({
        command: action.command,
        cwd: action.cwd,
        timeoutMs: action.timeoutMs
      });

      appendAuditLog(getAuditLogPath(), {
        type: "action",
        actionId: action.id,
        result,
        timestamp: new Date().toISOString()
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.get("/logs/:id", async (req, res) => {
    try {
      const lines = Number(req.query.lines || "200");
      res.json(await readLastLines(getConfig(), req.params.id, lines));
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.get("/config/reload", (_req, res) => {
    try {
      const config = getConfig();
      res.json({
        ok: true,
        machineName: config.machineName,
        role: config.role
      });
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  return router;
}
