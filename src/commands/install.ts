import { Command } from "commander";
import chalk from "chalk";
import { getTool } from "../lib/api.js";
import { detectPackageManager, runInstall, getInstallInfo } from "../lib/installer.js";

export const installCommand = new Command("install")
  .description("Install a CLI tool")
  .argument("<slug>", "Tool slug (e.g. lark-cli)")
  .option("--agent", "Use agent install command (outputs README URL for AI agents)")
  .option("--json", "Output as JSON")
  .option("-y, --yes", "Skip confirmation")
  .action(async (slug: string, opts) => {
    const tool = await getTool(slug);
    const info = getInstallInfo(tool, opts.agent);

    if (!info) {
      const msg = `No install command available for ${tool.name}`;
      if (opts.json) {
        console.log(JSON.stringify({ error: msg }));
      } else {
        console.log(chalk.red(msg));
      }
      process.exit(1);
    }

    if (info.type === "agent") {
      if (opts.json) {
        console.log(
          JSON.stringify({
            name: tool.name,
            slug: tool.slug,
            agent_install_command: info.command,
            instruction: `Read the content and install this project locally: ${info.command}`,
          })
        );
      } else {
        console.log(chalk.dim("Agent Install:"));
        console.log(`Read the content and install this project locally: ${chalk.blue(info.command)}`);
      }
      return;
    }

    // Human install
    if (opts.json) {
      console.log(
        JSON.stringify({
          name: tool.name,
          slug: tool.slug,
          install_command: info.command,
        })
      );
      return;
    }

    const { manager, available } = detectPackageManager(info.command);
    if (!available) {
      console.log(chalk.red(`Package manager "${manager}" not found. Please install it first.`));
      process.exit(1);
    }

    console.log(chalk.bold(`Installing ${tool.name}...`));
    console.log(`${chalk.green("$")} ${info.command}\n`);

    if (!opts.yes) {
      const readline = await import("node:readline");
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise<string>((resolve) => {
        rl.question("Proceed? [Y/n] ", resolve);
      });
      rl.close();
      if (answer.toLowerCase() === "n") {
        console.log("Cancelled.");
        return;
      }
    }

    const result = runInstall(info.command);
    if (result.success) {
      console.log(chalk.green(`✓ ${tool.name} installed successfully`));
    } else {
      console.log(chalk.red(`✗ Installation failed`));
      console.log(result.output);
      process.exit(1);
    }
  });
