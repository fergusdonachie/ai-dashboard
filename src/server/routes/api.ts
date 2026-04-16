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

  router.get("/health", (_req, res) => {
    res.json({
      ok: true,
      profile: options.config.role,
      generatedAt: new Date().toISOString()
    });
  });

  router.get("/dashboard", async (_req, res) => {
    try {
      const [system, services] = await Promise.all([
        getSystemSummary(options.startedAt),
        getAllServiceStatuses(options.config)
      ]);

      res.json({
        generatedAt: new Date().toISOString(),
        config: {
          machineName: options.config.machineName,
          role: options.config.role,
          features: options.config.features,
          servicesCount: options.config.services.length,
          actionsCount: options.config.actions.length,
          logsCount: options.config.logs.length,
          linksCount: options.config.links.length
        },
        system,
        services,
        actions: options.config.actions,
        logs: options.config.logs,
        links: options.config.links
      });
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.get("/services", async (_req, res) => {
    try {
      res.json(await getAllServiceStatuses(options.config));
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.post("/services/:id/:operation", async (req, res) => {
    try {
      const service = options.config.services.find((item) => item.id === req.params.id);

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
      const action = options.config.actions.find((item) => item.id === req.params.id);

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
      res.json(await readLastLines(options.config, req.params.id, lines));
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  router.get("/config/reload", (_req, res) => {
    try {
      options.config = loadConfig();
      res.json({
        ok: true,
        machineName: options.config.machineName,
        role: options.config.role
      });
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  return router;
}
