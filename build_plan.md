Yes. The right way to approach this is to design it as one shared codebase with machine-specific modes, rather than two completely separate apps. That gives you one app to maintain, but lets each Mac expose different controls and views.

Below is a paste-ready plan you can drop into Claude Code / VS Code chat.

⸻

AI Dashboard build plan

Build a mobile-first local web dashboard for controlling AI coding workflows on two Tailscale-connected Mac minis.

Overall goal

Create a small web app that runs locally on each Mac mini and is accessible from my phone browser over Tailscale.

The dashboard should let me:
	•	see machine status
	•	start, stop, and restart key AI services
	•	view logs
	•	run a small number of predefined safe commands
	•	open useful local web tools
	•	optionally monitor Claude/OpenClaw/dev processes
	•	work well on a phone screen

I have two Macs and want the app designed so the same project can run on both, but with different configuration and feature sets.

⸻

Machines

Machine 1: dedicated OpenClaw Mac mini

Purpose:
	•	mainly runs OpenClaw and related agents/services
	•	should have a dashboard focused on:
	•	OpenClaw daemon status
	•	agent/session controls
	•	logs
	•	restart/recovery tools
	•	service health
	•	links to OpenClaw dashboard or related local URLs if available

Machine 2: main working Mac mini

Purpose:
	•	my main AI/dev machine
	•	I use Claude Desktop, Claude Code, Claude co-work, VS Code, terminal tools, git, dev servers, etc.
	•	should have a broader dashboard focused on:
	•	developer workflows
	•	predefined terminal actions
	•	project shortcuts
	•	local dev server status
	•	log viewing
	•	quick launch links to code-server or local services if configured later

⸻

Key design decision

Build this as:
	•	one codebase
	•	Node.js + Express backend
	•	simple frontend that is mobile-first
	•	configuration-driven machine profiles

Do not build two separate apps unless there is a very strong reason later.

Use a config file per machine such as:
	•	config/openclaw-mac.json
	•	config/main-mac.json

The app should read the selected config at startup and expose only the features relevant to that machine.

⸻

Core principles
	1.	Phone first
	•	large buttons
	•	clear status cards
	•	minimal typing
	•	scrollable logs
	•	simple navigation
	2.	Safe by default
	•	no unrestricted shell box initially
	•	predefined commands only
	•	commands grouped by machine role
	•	commands should be easy to audit in config
	3.	Local only
	•	app listens on local network / Tailscale interface
	•	no public internet exposure
	•	security primarily provided by Tailscale
	•	optional app password later if desired
	4.	Recoverability
	•	most useful actions are restart/reload/log/status
	•	dashboard should help me recover from stuck AI sessions without needing a laptop
	5.	Easy to extend
	•	adding a new command should mostly mean editing config
	•	adding a new panel should be straightforward

⸻

Suggested stack

Backend
	•	Node.js
	•	Express
	•	child_process.spawn rather than only exec
	•	optional ws or socket.io for live logs later

Frontend

Start simple:
	•	server-rendered HTML/CSS/JS or very lightweight frontend

Or, if convenient:
	•	React frontend with Vite

Recommended approach:
	•	start with Express + static frontend
	•	keep the first version simple and robust
	•	only move to React if the UI grows

Process / service helpers

Consider:
	•	ps-list for checking running processes
	•	systeminformation for CPU/memory/disk
	•	maybe pidusage if useful

Optional later
	•	xterm.js for browser terminal
	•	socket.io for live logs
	•	code-server integration
	•	launchd service wrapper

⸻

Main features for version 1

1. Home dashboard

Show:
	•	machine name
	•	machine role (openclaw or main)
	•	online timestamp / app uptime
	•	CPU and memory summary
	•	disk free space
	•	current user
	•	hostname
	•	key service status badges

Layout:
	•	mobile-friendly cards
	•	green/yellow/red indicators

⸻

2. Service status panel

Show status for configured services/processes.

For OpenClaw machine:
	•	OpenClaw daemon
	•	relevant node process
	•	dashboard/web UI if applicable

For main Mac:
	•	Claude-related helper processes if detectable
	•	VS Code / code-server if relevant
	•	common dev servers if configured
	•	git-related background tasks only if useful

Need:
	•	config-driven service definitions
	•	each service can define:
	•	display name
	•	status check command or process match
	•	start command
	•	stop command
	•	restart command
	•	optional log path

Example service object:
	•	name
	•	description
	•	statusType (command, process, url)
	•	statusCheck
	•	startCommand
	•	stopCommand
	•	restartCommand
	•	logPath

⸻

3. Action buttons

Provide predefined actions by machine.

OpenClaw machine actions

Examples:
	•	Start OpenClaw daemon
	•	Stop OpenClaw daemon
	•	Restart OpenClaw daemon
	•	OpenClaw status
	•	Run doctor
	•	Show recent sessions/logs
	•	Restart a helper service if one exists
	•	Tail main OpenClaw log
	•	Clean up stale sessions only if safe and confirmed

Main Mac actions

Examples:
	•	show current processes related to Claude / node / code-server / dev servers
	•	git pull in a chosen project
	•	npm install in chosen project
	•	npm run dev in chosen project
	•	restart a local service
	•	tail a project log
	•	open common project links

Important:
	•	actions should come from config
	•	each action should have:
	•	label
	•	command
	•	working directory if needed
	•	confirmation flag for risky actions
	•	timeout
	•	whether output is streamed or returned at end

⸻

4. Logs view

This is one of the most important screens.

Support:
	•	viewing the last N lines of configured logs
	•	choosing from several logs
	•	auto-refresh
	•	copy button
	•	monospace display
	•	wrap/nowrap toggle if easy

For v1:
	•	fetch last 100 or 200 lines

For later:
	•	live tail over websockets

Need support for:
	•	OpenClaw logs
	•	app logs
	•	selected project logs on main machine

⸻

5. Command output screen

When I tap an action, show:
	•	command name
	•	machine
	•	timestamp
	•	status: running / success / failed
	•	stdout/stderr output
	•	exit code

This should be readable on mobile and preserve formatting.

For long-running commands:
	•	either block until complete with timeout
	•	or better, stream output incrementally

At minimum in v1:
	•	show output after completion
	•	set sensible timeouts

⸻

6. Useful links screen

Per machine, configure links such as:

OpenClaw Mac
	•	local OpenClaw dashboard URL
	•	any relevant local monitoring page

Main Mac
	•	code-server URL if installed later
	•	local dev server URLs
	•	local documentation tools
	•	project-specific web UIs

These links should be stored in config and rendered as big mobile-friendly buttons.

⸻

Configuration system

Create a configuration model so the same app behaves differently on each Mac.

Suggested approach:
	•	environment variable DASHBOARD_PROFILE=openclaw-mac or main-mac
	•	load JSON or TS config file based on that
	•	config contains:
	•	machine metadata
	•	services
	•	actions
	•	log sources
	•	links
	•	optional feature flags

Suggested config structure:

{
  "machineName": "OpenClaw Mac Mini",
  "role": "openclaw",
  "port": 3000,
  "services": [],
  "actions": [],
  "logs": [],
  "links": [],
  "features": {
    "liveLogs": false,
    "terminal": false
  }
}

This is important: I want it easy to maintain different functionality on the two machines without forking the code.

⸻

Security requirements

Because this will control local commands, security matters.

Version 1 security model:
	•	accessible only over Tailscale / local network
	•	bind carefully, ideally not broadly exposed unless required
	•	no arbitrary shell input
	•	only predefined commands in config
	•	sanitize arguments if any are used
	•	optional simple password/PIN later
	•	audit logging of actions run

Please build with security in mind even though it is a local tool.

Do not create a “run any command” textbox in the first version.

⸻

Suggested pages / navigation

Use a bottom nav or top tabs for mobile:
	•	Home
	•	Services
	•	Actions
	•	Logs
	•	Links
	•	Settings/About

Home

Overview and key statuses

Services

Status cards with start/stop/restart buttons

Actions

Grouped buttons for safe predefined commands

Logs

Choose a log source and view output

Links

Open useful local web tools

Settings/About

Machine name, profile, version, uptime, config summary

⸻

Implementation phases

Phase 1: scaffold and basics

Tasks:
	•	create Node/Express app
	•	create config loader
	•	add health endpoint
	•	add home page
	•	add responsive CSS
	•	show machine name and role
	•	show server uptime

Deliverable:
	•	basic phone-friendly dashboard accessible from browser

⸻

Phase 2: services and actions

Tasks:
	•	implement config-driven services
	•	implement status checks
	•	implement start/stop/restart actions
	•	implement safe action execution wrapper
	•	show action results

Important:
	•	use spawn
	•	capture stdout/stderr
	•	enforce timeout
	•	return structured JSON to frontend

Deliverable:
	•	can control OpenClaw and other configured services safely

⸻

Phase 3: logs

Tasks:
	•	add log source definitions in config
	•	implement endpoint to fetch last N lines from a selected log
	•	build logs page
	•	add refresh button
	•	make it readable on mobile

Deliverable:
	•	easy log viewing from phone

⸻

Phase 4: polish and machine-specific configs

Tasks:
	•	create openclaw-mac config
	•	create main-mac config
	•	refine visible controls for each machine
	•	add useful links page
	•	improve status indicators and layout

Deliverable:
	•	same app behaves appropriately on each Mac

⸻

Phase 5: optional enhancements

Possible later additions:
	•	live log streaming with websockets
	•	command history
	•	confirmation dialogs for risky actions
	•	code-server integration
	•	browser terminal with xterm.js
	•	launchd installation so dashboard runs at boot
	•	basic auth or PIN
	•	dark mode
	•	push notification/webhook hooks

⸻

Specific behaviours I want

Please build with these user needs in mind:
	1.	From my phone, I want to quickly check whether OpenClaw is healthy.
	2.	I want one-tap restart/recovery actions.
	3.	I want to read recent logs without using SSH.
	4.	On my main Mac, I want quick access to common dev actions without opening terminal.
	5.	I do not want the UI cluttered with low-value controls.
	6.	I want the app to be stable and simple rather than over-engineered.
	7.	I want it easy to add more commands later.

⸻

OpenClaw-specific considerations

On the dedicated OpenClaw Mac, please think about these possible controls:
	•	daemon status
	•	daemon start/stop/restart
	•	doctor output
	•	recent session issues if there is a safe command for that
	•	log views for OpenClaw logs
	•	links to local dashboard if it exists
	•	maybe a “basic health check” action that runs a few safe diagnostics and returns combined output

If OpenClaw commands vary depending on installed version, design the code so commands can be edited in config rather than hard-coded.

⸻

Main Mac-specific considerations

On the main Mac, I want broader but still safe utility.

Potential categories:
	•	project actions
	•	dev server actions
	•	git actions
	•	process checks
	•	quick links

Examples:
	•	git pull in selected repo
	•	npm install
	•	npm run dev
	•	check node processes
	•	check listening ports for local services
	•	tail app log
	•	open code-server link if present later

I want these to be configurable per project rather than hard-coded.

⸻

Technical requirements for code quality

Please build this cleanly.

Requirements:
	•	use TypeScript if practical
	•	modular structure
	•	separate command runner, config loader, status checker, log reader
	•	no giant single file
	•	clear README
	•	.env.example
	•	sample configs for both machines
	•	sensible error handling
	•	avoid assumptions that only work on one machine
	•	preserve whitespace/formatting in logs and outputs

Suggested folder structure:

ai-dashboard/
  src/
    server/
      index.ts
      routes/
      services/
      utils/
    shared/
      types.ts
    client/
      ...
  config/
    openclaw-mac.json
    main-mac.json
  logs/
  README.md
  .env.example

If a simpler structure makes more sense initially, that is fine, but keep it tidy.

⸻

Operational requirements

Please make it easy to run in development and production.

Need:
	•	npm run dev
	•	npm run build
	•	npm start

Also:
	•	instructions for running as a background service on macOS using launchd
	•	instructions for binding to a suitable interface for Tailscale access
	•	note any firewall or permissions considerations

⸻

Nice-to-have UI details
	•	clean, modern, minimal mobile layout
	•	large tap targets
	•	status colours
	•	monospace log/output panels
	•	collapsible sections if helpful
	•	confirm dialog before risky commands
	•	visible machine badge so I know which Mac I’m controlling
	•	visible last updated time
	•	dark mode preferred if easy

⸻

Deliverables I want from you

Please produce:
	1.	the actual app code
	2.	a clear setup guide
	3.	sample config for both Macs
	4.	instructions for installing/running on each Mac
	5.	notes on how to add a new command, service, log source, or link
	6.	a short section on security assumptions and limitations

⸻

Build approach

Please implement this incrementally and show me:
	1.	project structure
	2.	core backend
	3.	frontend
	4.	sample configs
	5.	setup instructions
	6.	any follow-up improvements you recommend

Do not overcomplicate the first version. Prefer a solid version 1 that works well on a phone over a feature-rich but fragile system.

⸻

Extra note

I may want to evolve this later into:
	•	a more advanced dashboard
	•	optional browser terminal
	•	code-server launcher
	•	richer OpenClaw monitoring
	•	machine-specific custom panels

So please design the code in a way that leaves room for that.

⸻

If you want, I can also turn this into a second, more prescriptive prompt that tells Claude exactly what tech choices to use and in what order to build the files.