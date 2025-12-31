#!/usr/bin/env node

/**
 * Tool Call Logs Viewer
 * 
 * Displays tool call logs, failed calls, and statistics
 * Usage: node scripts/view-tool-logs.js [date]
 * Example: node scripts/view-tool-logs.js 2025-01-23
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOGS_DIR = join(__dirname, "..", "logs", "tool-calls");
const FAILED_LOGS_DIR = join(__dirname, "..", "logs", "tool-calls-failed");

// Get date from command line or use today
const dateArg = process.argv[2];
const date = dateArg || new Date().toISOString().split("T")[0];

function loadLogFile(filePath) {
  if (!existsSync(filePath)) {
    return [];
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.trim().split("\n").filter((line) => line.trim());
    return lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter((entry) => entry !== null);
  } catch (error) {
    console.error(`Error reading log file: ${error.message}`);
    return [];
  }
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Main execution
console.log("=========================================");
console.log("Tool Call Logs Viewer");
console.log("=========================================");
console.log(`Date: ${date}`);
console.log("");

const mainLogFile = join(LOGS_DIR, `tool-calls-${date}.log`);
const failedLogFile = join(FAILED_LOGS_DIR, `tool-calls-${date}.log`);

const allEntries = loadLogFile(mainLogFile);
const failedEntries = loadLogFile(failedLogFile);

if (allEntries.length === 0 && failedEntries.length === 0) {
  console.log(`No logs found for date: ${date}`);
  console.log("");
  console.log("Available log files:");
  if (existsSync(LOGS_DIR)) {
    const files = readdirSync(LOGS_DIR)
      .filter((f) => f.endsWith(".log"))
      .sort()
      .reverse()
      .slice(0, 10);
    files.forEach((f) => console.log(`  ${f}`));
  }
  process.exit(0);
}

// Statistics
console.log("=== Statistics ===");
const successful = allEntries.filter((e) => e.status === "success").length;
const failed = allEntries.filter((e) => e.status === "failure").length;
const total = allEntries.length;
const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : "0";

console.log(`Total calls: ${total}`);
console.log(`✅ Successful: ${successful}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Success rate: ${successRate}%`);

if (allEntries.length > 0) {
  const executionTimes = allEntries
    .map((e) => e.executionTimeMs)
    .filter((t) => t !== undefined && t !== null);
  const avgTime =
    executionTimes.length > 0
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
      : 0;
  console.log(`Average execution time: ${formatDuration(avgTime)}`);
}

console.log("");

// Failed tools summary
if (failedEntries.length > 0) {
  console.log("=== Failed Tools Summary ===");
  console.log("");

  const toolCounts = new Map();
  failedEntries.forEach((entry) => {
    const count = toolCounts.get(entry.toolName) || 0;
    toolCounts.set(entry.toolName, count + 1);
  });

  const sortedTools = Array.from(toolCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  sortedTools.forEach(([toolName, count]) => {
    console.log(`❌ ${toolName}: ${count} failure(s)`);
  });

  console.log("");
}

// Recent failed calls
if (failedEntries.length > 0) {
  console.log("=== Recent Failed Calls (Last 10) ===");
  console.log("");

  failedEntries.slice(-10).reverse().forEach((entry) => {
    console.log(`[${formatTimestamp(entry.timestamp)}] ❌ ${entry.toolName}`);
    if (entry.error) {
      console.log(`  Error: ${entry.error.name}: ${entry.error.message}`);
    }
    if (entry.executionTimeMs) {
      console.log(`  Execution time: ${formatDuration(entry.executionTimeMs)}`);
    }
    console.log(`  Params: ${JSON.stringify(entry.params, null, 2)}`);
    console.log("");
  });
}

// Recent successful calls
const successfulEntries = allEntries.filter((e) => e.status === "success");
if (successfulEntries.length > 0) {
  console.log("=== Recent Successful Calls (Last 10) ===");
  console.log("");

  successfulEntries.slice(-10).reverse().forEach((entry) => {
    const timeStr = entry.executionTimeMs
      ? ` (${formatDuration(entry.executionTimeMs)})`
      : "";
    console.log(
      `[${formatTimestamp(entry.timestamp)}] ✅ ${entry.toolName}${timeStr}`
    );
  });

  console.log("");
}

// Usage tips
console.log("=========================================");
console.log("Usage Tips:");
console.log(`  View full log: cat ${mainLogFile} | jq '.'`);
console.log(`  View failed log: cat ${failedLogFile} | jq '.'`);
console.log(
  `  View specific tool: grep '"toolName":"TOOL_NAME"' ${mainLogFile} | jq '.'`
);
console.log("");



