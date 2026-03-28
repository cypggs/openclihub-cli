import { Command } from "commander";
import chalk from "chalk";
import { listTools } from "../lib/api.js";
import { formatToolTable } from "../lib/formatter.js";

export const searchCommand = new Command("search")
  .description("Search CLI tools by keyword")
  .argument("<keyword>", "Search keyword")
  .option("--json", "Output as JSON")
  .action(async (keyword: string, opts) => {
    const res = await listTools({ q: keyword });

    if (opts.json) {
      console.log(JSON.stringify(res.data, null, 2));
      return;
    }

    if (res.data.length === 0) {
      console.log(chalk.yellow(`No tools found for "${keyword}"`));
      return;
    }

    console.log(formatToolTable(res.data));
    console.log(`\n${res.data.length} results for "${keyword}"`);
  });
