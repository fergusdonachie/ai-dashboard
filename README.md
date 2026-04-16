# AI Dashboard

Local, mobile-first dashboard for controlling AI and development workflows on Tailscale-connected Mac minis.

## What is included

- TypeScript + Express backend
- Static mobile-first frontend
- Config-driven machine profiles
- Service status checks for process, command, and URL targets
- Safe predefined action runner with timeouts and audit logging
- Log viewer for configured files
- Sample configs for `openclaw-mac` and `main-mac`

## Project structure

```text
.
├── build_plan.md
├── config/
│   ├── main-mac.json
│   └── openclaw-mac.json
├── src/
│   ├── client/
│   │   ├── app.js
│   │   ├── index.html
│   │   └── styles.css
│   ├── server/
│   │   ├── index.ts
│   │   ├── routes/api.ts
│   │   ├── services/
│   │   └── utils/
│   └── shared/types.ts
└── .env.example
```

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` if you want local overrides.
3. Choose a profile with `DASHBOARD_PROFILE=openclaw-mac` or `DASHBOARD_PROFILE=main-mac`.
4. Start development with `npm run dev`.
5. Build production assets with `npm run build`.
6. Run the compiled server with `npm start`.

## Environment variables

- `DASHBOARD_PROFILE`: config profile name from `config/*.json`
- `PORT`: override the config port
- `HOST`: bind address, for example `100.x.y.z` or `0.0.0.0`
- `ACTION_AUDIT_LOG`: path for action audit logs

## Config model

Each machine profile lives in `config/<profile>.json`.

- `services`: process, command, or URL checks with optional start/stop/restart commands
- `actions`: safe predefined commands with optional `cwd`, timeout, and confirmation requirement
- `logs`: readable log files for the Logs tab
- `links`: large mobile-friendly launch targets
- `features`: reserved for later features like live logs and terminal access

Important: commands are executed directly with `spawn`, not through an arbitrary shell input box. Keep commands as explicit arrays.

## Adding a new service

```json
{
  "id": "my-service",
  "name": "My Service",
  "statusType": "process",
  "statusCheck": "my-binary",
  "restartCommand": ["launchctl", "kickstart", "-k", "gui/501/com.example.my-service"]
}
```

Use:

- `process` when `pgrep -fl <pattern>` is enough
- `command` when the service has a native status command
- `url` when checking a local HTTP endpoint

## Adding a new action

```json
{
  "id": "pull-project",
  "label": "Git pull project",
  "category": "Project actions",
  "command": ["git", "pull"],
  "cwd": "/Users/you/project",
  "timeoutMs": 30000,
  "requiresConfirmation": true
}
```

## Adding a new log source

```json
{
  "id": "project-log",
  "name": "Project log",
  "path": "/Users/you/project/logs/app.log"
}
```

## Adding a new link

```json
{
  "id": "project-ui",
  "label": "Project UI",
  "url": "http://100.x.y.z:5173"
}
```

## Security assumptions and current limitations

- Version 1 assumes access is limited to your local network and Tailscale.
- There is no arbitrary command textbox.
- Commands come only from config and are audited to `logs/actions.log` by default.
- There is not yet authentication, websocket log streaming, or browser terminal access.
- Sample configs include placeholders that must be replaced with your real service labels, paths, and URLs.

## Tailscale and binding

- For quick local testing, `HOST=0.0.0.0` is acceptable.
- For tighter exposure, bind to the machine’s Tailscale IP instead.
- Confirm macOS firewall rules allow inbound access to the chosen port from Tailscale.

## launchd outline

Create a `~/Library/LaunchAgents/com.yourname.ai-dashboard.plist` that runs `npm start` from this project directory with the right environment variables. Recommended settings:

- `WorkingDirectory` set to the repo root
- `EnvironmentVariables` for `DASHBOARD_PROFILE`, `PORT`, and `HOST`
- `RunAtLoad` set to `true`
- `KeepAlive` set to `true`
- `StandardOutPath` and `StandardErrorPath` pointed at files in `logs/`

Load it with `launchctl load ~/Library/LaunchAgents/com.yourname.ai-dashboard.plist`.

## Next recommended improvements

- Replace placeholder commands in both sample configs with your real OpenClaw and project commands
- Add better path validation for logs
- Add confirmation UX text for risky actions
- Add websocket-based live log tailing
