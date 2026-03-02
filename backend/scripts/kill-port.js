#!/usr/bin/env node
/**
 * Kill any process listening on the given port (e.g. previous nodemon/node instance).
 * Usage: node scripts/kill-port.js 5000
 */
const port = parseInt(process.argv[2] || "5000", 10);
const { execSync } = require("child_process");

function killPort(p) {
  try {
    // Linux: lsof -t -i:PORT gives PIDs; kill -9 terminates
    const pids = execSync(`lsof -t -i:${p} 2>/dev/null || true`, { encoding: "utf8" }).trim();
    if (pids) {
      execSync(`kill -9 ${pids} 2>/dev/null || true`, { stdio: "pipe" });
      console.log(`🔧 Killed process(es) on port ${p}`);
    }
  } catch (e) {
    // Ignore
  }
}

killPort(port);
