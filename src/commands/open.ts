import { Command } from "commander";
import chalk from "chalk";
import open from "open";
import { getTool } from "../lib/api.js";

export const openCommand = new Command("open")
  .description("Open a tool's page in the browser")
  .argument("<slug>", "Tool slug (e.g. lark-cli)")
  .option("--github", "Open GitHub repo instead")
  .option("--homepage", "Open homepage instead")
  .action(async (slug: string, opts) => {
    const tool = await getTool(slug);

    let url: string;
    if (opts.github) {
      if (!tool.github_url) {
        console.log(chalk.red(`${tool.name} has no GitHub URL`));
        process.exit(1);
      }
      url = tool.github_url;
    } else if (opts.homepage) {
      if (!tool.homepage_url) {
        console.log(chalk.red(`${tool.name} has no homepage URL`));
        process.exit(1);
      }
      url = tool.homepage_url;
    } else {
      url = `https://openclihub.com/tool/${slug}`;
    }

    console.log(chalk.dim(`Opening ${url}`));
    await open(url);
  });
