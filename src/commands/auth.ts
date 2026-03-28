import { Command } from "commander";
import chalk from "chalk";
import { getTool } from "../lib/api.js";
import { printQrTerminal, saveQrImage, getQrBase64 } from "../lib/qr.js";

// Known auth commands for tools that require authentication
const AUTH_COMMANDS: Record<string, { command: string; urlPattern: RegExp }> = {
  "lark-cli": {
    command: "lark-cli auth login",
    urlPattern: /https?:\/\/\S+/,
  },
};

export const authCommand = new Command("auth")
  .description("Authenticate with a CLI tool (handles QR codes for IM agents)")
  .argument("<slug>", "Tool slug (e.g. lark-cli)")
  .option("--qr-image <path>", "Save QR code as PNG image")
  .option("--json", "Output as JSON (includes auth URL and QR base64)")
  .option("--url-only", "Output only the auth URL")
  .action(async (slug: string, opts) => {
    const tool = await getTool(slug);
    const authInfo = AUTH_COMMANDS[slug];

    if (!authInfo) {
      // For tools without known auth flow, suggest running their auth command directly
      if (opts.json) {
        console.log(
          JSON.stringify({
            name: tool.name,
            slug: tool.slug,
            message: `No known auth flow. Try running the tool's auth command directly.`,
            homepage_url: tool.homepage_url,
            github_url: tool.github_url,
          })
        );
      } else {
        console.log(chalk.yellow(`No known auth flow for ${tool.name}.`));
        console.log("Try running the tool's auth command directly after installing it.");
        if (tool.homepage_url) console.log(`Homepage: ${tool.homepage_url}`);
      }
      return;
    }

    // For known tools, provide auth URL info
    const authUrl = `${tool.homepage_url || tool.github_url || ""}`;

    if (opts.json) {
      const result: Record<string, string> = {
        name: tool.name,
        slug: tool.slug,
        auth_command: authInfo.command,
        suggestion: `Run "${authInfo.command}" and complete authentication`,
      };
      if (authUrl) {
        result.auth_related_url = authUrl;
        result.qr_base64 = await getQrBase64(authUrl);
      }
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (opts.urlOnly) {
      console.log(authUrl);
      return;
    }

    console.log(chalk.bold(`Authentication for ${tool.name}`));
    console.log(chalk.dim(`Run: ${authInfo.command}`));
    console.log("");

    if (authUrl) {
      console.log(chalk.dim("Related URL:"));
      console.log(chalk.blue(authUrl));
      console.log("");

      if (opts.qrImage) {
        const path = await saveQrImage(authUrl, opts.qrImage);
        console.log(chalk.green(`QR code saved to: ${path}`));
        console.log(chalk.dim("(Send this image to your IM chat for scanning)"));
      } else {
        console.log(chalk.dim("QR Code:"));
        await printQrTerminal(authUrl);
      }
    }

    console.log(chalk.dim("\nTip: Use --json for agent-friendly output, --qr-image to save QR as PNG"));
  });
