#!/usr/bin/env node

const fs = require("node:fs");
const pty = require("node-pty");

if (process.argv.length !== 2) {
	console.error("interactive-command-prepend\n\n");
	console.error(
		"  Allows to run interactive command and prepends commands to be executed.",
	);
	console.error(
		"  Implemented using microsoft/node-pty, which will open software defined TTY",
	);
	console.error("  and write required commands into in.\n\n");
	console.error(
		"  Reads `.interactive-command-prepend.json` file from CWD and executes",
	);
	console.error("  according to config.\n\n");
	console.error("  Example config:");
	console.error({
		exec: "node",
		args: ["--experimental-sqlite"],
		write: ["console.log(", "{ hello: 'world' }", ")"],
	});
	process.exit(1);
}

const options = JSON.parse(
	fs.readFileSync(".interactive-command-prepend.json"),
);

const term = pty.spawn(options.exec, options.args);
term.onExit((exit) => process.exit(exit.exitCode));
term.onData((data) => process.stdout.write(data));
term.resize(process.stdout.columns, process.stdout.rows)

const handleSignal = (signal) => term.kill(handle);

process.on("SIGTERM", handleSignal);
process.on("SIGINT", handleSignal);
process.on("SIGBREAK", handleSignal);

process.stdin.setRawMode(true);
process.stdin.on("data", (buffer) => term.write(buffer.toString("utf-8")));

for (const line of options.write || []) {
	term.write(line);
	term.write("\r");
}
