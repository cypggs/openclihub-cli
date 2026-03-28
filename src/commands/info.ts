import { Command } from "commander";
import { getTool } from "../lib/api.js";
import { formatToolDetail } from "../lib/formatter.js";

export const infoCommand = new Command("info")
  .description("Show details of a CLI tool")
  .argument("<slug>", "Tool slug (e.g. lark-cli)")
  .option("--json", "Output as JSON")
  .action(async (slug: string, opts) => {
    const tool = await getTool(slug);

    if (opts.json) {
      console.log(JSON.stringify(tool, null, 2));
      return;
    }

    console.log(formatToolDetail(tool));
  });
