import { execSync } from "node:child_process";
import type { CliTool } from "../types.js";

function commandExists(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function detectPackageManager(command: string): {
  manager: string;
  available: boolean;
} {
  const managers = ["npm", "npx", "pip", "pip3", "pipx", "brew", "go", "cargo", "uv"];
  for (const m of managers) {
    if (command.includes(m)) {
      return { manager: m, available: commandExists(m) };
    }
  }
  return { manager: "unknown", available: true };
}

export function runInstall(command: string): { success: boolean; output: string } {
  try {
    const output = execSync(command, {
      stdio: ["inherit", "pipe", "pipe"],
      encoding: "utf-8",
      timeout: 300_000,
    });
    return { success: true, output: output || "Installed successfully" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, output: msg };
  }
}

export function getInstallInfo(tool: CliTool, agentMode: boolean) {
  if (agentMode && tool.agent_install_command) {
    return {
      command: tool.agent_install_command,
      type: "agent" as const,
    };
  }
  if (tool.install_command) {
    return {
      command: tool.install_command,
      type: "human" as const,
    };
  }
  return null;
}
