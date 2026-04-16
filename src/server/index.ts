import express from "express";
import { createApiRouter } from "./routes/api.js";
import { loadConfig } from "./services/config.js";
import { clientDirectory } from "./utils/paths.js";

const startedAt = Date.now();
const config = loadConfig();
const host = config.host || "0.0.0.0";

const app = express();

app.use(express.json());
app.use("/api", createApiRouter({ config, startedAt }));
app.use(express.static(clientDirectory));

app.use((_req, res) => {
  res.sendFile("index.html", { root: clientDirectory });
});

app.listen(config.port, host, () => {
  console.log(
    `AI Dashboard running for ${config.machineName} at http://${host}:${config.port}`
  );
});
