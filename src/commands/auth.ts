import { Command } from "commander";
import chalk from "chalk";
import { spawn } from "node:child_process";
import * as readline from "node:readline";
import { getTool } from "../lib/api.js";
import { printQrTerminal, getQrBase64 } from "../lib/qr.js";

interface AuthFlow {
  // The command + args to spawn, e.g. ["lark-cli", "auth", "login"]
  command: string[];
  // Regex to extract the auth URL from the process output
  urlPattern: RegExp;
  // Optional: regex to detect successful auth completion in output
  successPattern?: RegExp;
}

// Registry of known CLI auth flows.
// urlPattern should capture the full auth URL from stdout/stderr.
// Generic fallback (any https URL) is applied when no entry is found.
const AUTH_REGISTRY: Record<string, AuthFlow> = {
  "lark-cli": {
    // --recommend grants the default recommended scopes; required to get an OAuth URL
    command: ["lark-cli", "auth", "login", "--recommend"],
    urlPattern: /https?:\/\/accounts\.feishu\.cn\/\S+/,
    successPattern: /登录成功|login success|authenticated/i,
  },
  "wecom-cli": {
    command: ["wecom-cli", "init"],
    urlPattern: /https?:\/\/\S+/,
    successPattern: /成功|success/i,
  },
  "dingtalk-workspace-cli": {
    command: ["dingtalk", "auth", "login"],
    urlPattern: /https?:\/\/\S+/,
    successPattern: /登录成功|login success|authenticated/i,
  },
  "gogcli": {
    command: ["gogcli", "auth", "login"],
    urlPattern: /https?:\/\/\S+/,
  },
  "google-workspace-cli": {
    command: ["gwstools", "auth", "login"],
    urlPattern: /https?:\/\/accounts\.google\.com\/\S+/,
    successPattern: /authenticated|success/i,
  },
};

// Generic fallback: any https URL found in output
const GENERIC_URL_PATTERN = /https?:\/\/[^\s"'<>]+/;
// Auth timeout: 5 minutes
const AUTH_TIMEOUT_MS = 5 * 60 * 1000;

export const authCommand = new Command("auth")
  .description("Authenticate with a CLI tool — captures real OAuth URL and generates QR code")
  .argument("<slug>", "Tool slug (e.g. lark-cli)")
  .option("--agent", "Agent mode: output JSON with qr_url and qr_png_base64, then wait for completion")
  .option("--json", "Alias for --agent")
  .option("--url-only", "Output only the captured auth URL and exit")
  .action(async (slug: string, opts) => {
    const agentMode = opts.agent || opts.json;

    // Fetch tool info for fallback messaging
    let tool: Awaited<ReturnType<typeof getTool>>;
    try {
      tool = await getTool(slug);
    } catch {
      const msg = `Tool "${slug}" not found in OpenCLI Hub`;
      if (agentMode) {
        console.log(JSON.stringify({ error: msg, slug }));
      } else {
        console.error(chalk.red(msg));
      }
      process.exit(1);
    }

    const flow = AUTH_REGISTRY[slug];

    // If no registered flow, fall back to README/homepage guidance
    if (!flow) {
      const readmeUrl = tool.agent_install_command || tool.homepage_url || tool.github_url;
      if (agentMode) {
        console.log(
          JSON.stringify({
            status: "no_auth_flow",
            name: tool.name,
            slug: tool.slug,
            message: `No known auth flow for ${tool.name}. Read the README to find the auth command.`,
            readme_url: readmeUrl,
          })
        );
      } else {
        console.log(chalk.yellow(`No known auth flow for ${tool.name}.`));
        console.log("Check the README for authentication instructions:");
        if (readmeUrl) console.log(chalk.blue(readmeUrl));
      }
      return;
    }

    if (!agentMode) {
      console.log(chalk.bold(`Authenticating ${tool.name}...`));
      console.log(chalk.dim(`Running: ${flow.command.join(" ")}\n`));
    }

    // Spawn the auth process
    const [bin, ...args] = flow.command;
    const child = spawn(bin, args, {
      stdio: ["inherit", "pipe", "pipe"],
    });

    let authUrl: string | null = null;
    let qrEmitted = false;
    let completed = false;

    const timeout = setTimeout(() => {
      if (!completed) {
        child.kill();
        if (agentMode) {
          console.log(JSON.stringify({ status: "timeout", slug, message: "Auth timed out after 5 minutes" }));
        } else {
          console.log(chalk.red("\nAuth timed out after 5 minutes."));
        }
        process.exit(1);
      }
    }, AUTH_TIMEOUT_MS);

    // Try to extract auth URL and emit QR once
    const tryEmitQr = async (line: string) => {
      if (qrEmitted) return;

      const urlPattern = flow.urlPattern || GENERIC_URL_PATTERN;
      const match = line.match(urlPattern);
      if (!match) return;

      authUrl = match[0].replace(/[,.]$/, ""); // strip trailing punctuation
      qrEmitted = true;

      if (opts.urlOnly) {
        console.log(authUrl);
        // Don't kill the process — let auth complete
        return;
      }

      if (agentMode) {
        const qrBase64 = await getQrBase64(authUrl);
        console.log(
          JSON.stringify({
            status: "pending",
            name: tool.name,
            slug: tool.slug,
            qr_url: authUrl,
            qr_png_base64: qrBase64,
            message: "Send qr_png_base64 as an image to the user for scanning. Wait for status:success.",
          })
        );
      } else {
        console.log(chalk.dim("Auth URL:"));
        console.log(chalk.blue(authUrl));
        console.log("");
        console.log(chalk.dim("QR Code (scan with your app):"));
        await printQrTerminal(authUrl);
        console.log(chalk.dim("Waiting for authentication...\n"));
      }
    };

    // Stream stdout
    const stdoutRl = readline.createInterface({ input: child.stdout! });
    stdoutRl.on("line", async (line) => {
      if (!agentMode) process.stdout.write(line + "\n");
      await tryEmitQr(line);

      // Detect success from output
      if (flow.successPattern && flow.successPattern.test(line)) {
        completed = true;
      }
    });

    // Stream stderr (many CLIs print URLs to stderr)
    const stderrRl = readline.createInterface({ input: child.stderr! });
    stderrRl.on("line", async (line) => {
      if (!agentMode) process.stderr.write(line + "\n");
      await tryEmitQr(line);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      completed = true;

      if (agentMode) {
        if (code === 0) {
          console.log(JSON.stringify({ status: "success", slug, name: tool.name }));
        } else if (qrEmitted) {
          // Process exited non-zero after showing QR — user may have cancelled
          console.log(JSON.stringify({ status: "cancelled", slug, exit_code: code }));
        } else {
          // Process exited without ever showing a URL — full fallback
          const readmeUrl = tool.agent_install_command || tool.homepage_url || tool.github_url;
          console.log(
            JSON.stringify({
              status: "fallback",
              slug,
              name: tool.name,
              message: `Could not capture auth URL. Follow the README to authenticate manually.`,
              readme_url: readmeUrl,
            })
          );
        }
      } else {
        if (code === 0) {
          console.log(chalk.green(`\n✓ ${tool.name} authenticated successfully`));
        } else if (!qrEmitted) {
          console.log(chalk.yellow(`\nNo auth URL was captured. Check the README:`));
          const readmeUrl = tool.agent_install_command || tool.homepage_url || tool.github_url;
          if (readmeUrl) console.log(chalk.blue(readmeUrl));
        }
      }
    });

    child.on("error", (err) => {
      clearTimeout(timeout);
      const msg = `Could not run "${bin}". Is ${tool.name} installed? Try: openclihub install ${slug}`;
      if (agentMode) {
        console.log(JSON.stringify({ status: "error", message: msg, install_hint: `openclihub install ${slug}` }));
      } else {
        console.log(chalk.red(`\n✗ ${msg}`));
      }
      process.exit(1);
    });
  });
