const state = {
  snapshot: null
};

const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");
const statusBanner = document.getElementById("status-banner");
const machineName = document.getElementById("machine-name");
const machineMeta = document.getElementById("machine-meta");
const focusPanel = document.getElementById("focus-panel");
const homeCards = document.getElementById("home-cards");
const servicesList = document.getElementById("services-list");
const actionsList = document.getElementById("actions-list");
const linksList = document.getElementById("links-list");
const aboutCard = document.getElementById("about-card");
const logSelector = document.getElementById("log-selector");
const logOutput = document.getElementById("log-output");
const commandDialog = document.getElementById("command-dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogMeta = document.getElementById("dialog-meta");
const dialogOutput = document.getElementById("dialog-output");

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return "Unknown";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(1)} ${units[unit]}`;
}

function setActiveTab(tabName) {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tabName);
  });
}

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function renderHome(snapshot) {
  const usedMemory = snapshot.system.totalMemoryBytes - snapshot.system.freeMemoryBytes;
  const codeServerService = snapshot.services.find((service) => service.id === "code-server");
  const codeServerLink = snapshot.links.find((link) => link.id === "code-server");
  const stateLabel = codeServerService?.state || "offline";
  const detail =
    codeServerService?.detail || "Install and start code-server to get a browser IDE on this Mac.";

  focusPanel.innerHTML = `
    <article class="card focus-card">
      <div class="row-between">
        <div>
          <p class="eyebrow">Remote Coding</p>
          <h2>code-server</h2>
          <p class="muted">This is the main path to secure remote file access, editing, terminal use, and AI coding sessions over Tailscale.</p>
        </div>
        <span class="badge badge-${stateLabel}">${stateLabel}</span>
      </div>
      <p class="detail-text">${detail}</p>
      <div class="button-row">
        ${
          codeServerLink
            ? `<a class="primary-button link-button" href="${codeServerLink.url}" target="_blank" rel="noreferrer">Open IDE</a>`
            : ""
        }
        <button class="secondary-button" data-tab-target="services">Service</button>
        <button class="secondary-button" data-tab-target="actions">Setup</button>
      </div>
    </article>
  `;

  const cards = [
    ["Role", snapshot.config.role],
    ["Host", snapshot.system.hostname],
    ["User", snapshot.system.username],
    ["Platform", snapshot.system.platform],
    ["Server uptime", `${snapshot.system.uptimeSeconds}s`],
    ["Load avg", snapshot.system.loadAverage.map((item) => item.toFixed(2)).join(" / ")],
    ["Memory", `${formatBytes(usedMemory)} used of ${formatBytes(snapshot.system.totalMemoryBytes)}`],
    ["Disk free", snapshot.system.diskFree || "Unknown"]
  ];

  homeCards.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="card stat-card">
          <p class="stat-label">${label}</p>
          <p class="stat-value">${value}</p>
        </article>
      `
    )
    .join("");
}

function renderServices(snapshot) {
  servicesList.innerHTML = snapshot.services
    .map((service) => {
      const buttons = [
        service.actions.canStart ? `<button data-service="${service.id}" data-operation="start" class="secondary-button">Start</button>` : "",
        service.actions.canStop ? `<button data-service="${service.id}" data-operation="stop" class="secondary-button">Stop</button>` : "",
        service.actions.canRestart ? `<button data-service="${service.id}" data-operation="restart" class="primary-button">Restart</button>` : ""
      ].join("");

      return `
        <article class="card">
          <div class="row-between">
            <div>
              <h3>${service.name}</h3>
              <p class="muted">${service.description || ""}</p>
            </div>
            <span class="badge badge-${service.state}">${service.state}</span>
          </div>
          <p class="detail-text">${service.detail}</p>
          <div class="button-row">${buttons}</div>
        </article>
      `;
    })
    .join("");
}

function renderActions(snapshot) {
  actionsList.innerHTML = snapshot.actions
    .map(
      (action) => `
        <article class="card">
          <p class="eyebrow">${action.category || "General"}</p>
          <h3>${action.label}</h3>
          <p class="muted">${action.description || ""}</p>
          <div class="row-between">
            <code>${action.command.join(" ")}</code>
            <button class="primary-button" data-action="${action.id}">Run</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderLogs(snapshot) {
  logSelector.innerHTML = snapshot.logs
    .map((log) => `<option value="${log.id}">${log.name}</option>`)
    .join("");
}

function renderLinks(snapshot) {
  linksList.innerHTML = snapshot.links
    .map(
      (link) => `
        <a class="card link-card" href="${link.url}" target="_blank" rel="noreferrer">
          <div>
            <h3>${link.label}</h3>
            <p class="muted">${link.description || link.url}</p>
          </div>
          <span class="link-arrow">Open</span>
        </a>
      `
    )
    .join("");
}

function renderAbout(snapshot) {
  aboutCard.innerHTML = `
    <p class="eyebrow">Profile summary</p>
    <h3>${snapshot.config.machineName}</h3>
    <p class="muted">Role: ${snapshot.config.role}</p>
    <p class="muted">Services: ${snapshot.config.servicesCount} | Actions: ${snapshot.config.actionsCount} | Logs: ${snapshot.config.logsCount} | Links: ${snapshot.config.linksCount}</p>
    <p class="muted">Generated at ${new Date(snapshot.generatedAt).toLocaleString()}</p>
  `;
}

function renderSnapshot(snapshot) {
  state.snapshot = snapshot;
  machineName.textContent = snapshot.config.machineName;
  machineMeta.textContent = `${snapshot.config.role} profile on ${snapshot.system.hostname}`;
  statusBanner.textContent = `Updated ${new Date(snapshot.generatedAt).toLocaleTimeString()}`;
  renderHome(snapshot);
  renderServices(snapshot);
  renderActions(snapshot);
  renderLogs(snapshot);
  renderLinks(snapshot);
  renderAbout(snapshot);
}

function openDialog(title, meta, output) {
  dialogTitle.textContent = title;
  dialogMeta.textContent = meta;
  dialogOutput.textContent = output;
  commandDialog.showModal();
}

async function loadDashboard() {
  statusBanner.textContent = "Refreshing dashboard…";

  try {
    const snapshot = await api("/api/dashboard");
    renderSnapshot(snapshot);
  } catch (error) {
    statusBanner.textContent = error.message;
  }
}

async function runServiceOperation(serviceId, operation) {
  try {
    const result = await api(`/api/services/${serviceId}/${operation}`, {
      method: "POST"
    });
    openDialog(
      `${operation} service`,
      `${result.exitCode === 0 ? "Success" : "Completed with issues"} in ${result.durationMs}ms`,
      [result.stdout, result.stderr].filter(Boolean).join("\n\n") || "No output"
    );
    await loadDashboard();
  } catch (error) {
    openDialog("Service error", "Request failed", error.message);
  }
}

async function runAction(actionId) {
  const action = state.snapshot?.actions.find((item) => item.id === actionId);

  if (action?.requiresConfirmation && !window.confirm(`Run ${action.label}?`)) {
    return;
  }

  try {
    const result = await api(`/api/actions/${actionId}/run`, {
      method: "POST"
    });
    openDialog(
      action?.label || "Action output",
      `${result.exitCode === 0 ? "Success" : "Failed"} | exit ${result.exitCode} | ${result.durationMs}ms`,
      [result.stdout, result.stderr].filter(Boolean).join("\n\n") || "No output"
    );
    await loadDashboard();
  } catch (error) {
    openDialog("Action error", "Request failed", error.message);
  }
}

async function loadLog() {
  if (!logSelector.value) {
    return;
  }

  logOutput.textContent = "Loading log…";

  try {
    const result = await api(`/api/logs/${logSelector.value}?lines=200`);
    logOutput.textContent = result.content || "Log is empty";
    logOutput.classList.remove("empty");
  } catch (error) {
    logOutput.textContent = error.message;
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

document.getElementById("refresh-button").addEventListener("click", loadDashboard);
document.getElementById("load-log-button").addEventListener("click", loadLog);
document.getElementById("copy-log-button").addEventListener("click", async () => {
  await navigator.clipboard.writeText(logOutput.textContent || "");
});
document.getElementById("close-dialog").addEventListener("click", () => commandDialog.close());
focusPanel.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-tab-target]");
  if (!button) {
    return;
  }

  setActiveTab(button.dataset.tabTarget);
});

servicesList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-service]");
  if (!button) {
    return;
  }

  runServiceOperation(button.dataset.service, button.dataset.operation);
});

actionsList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  runAction(button.dataset.action);
});

loadDashboard();
