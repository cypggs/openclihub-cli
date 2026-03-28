import { Command } from "commander";
import { listTools } from "../lib/api.js";
import { formatToolTable } from "../lib/formatter.js";

export const listCommand = new Command("list")
  .description("List all CLI tools")
  .option("--type <type>", "Filter by type: official or community")
  .option("--category <category>", "Filter by category")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const res = await listTools({ type: opts.type, category: opts.category });

    if (opts.json) {
      console.log(JSON.stringify(res.data, null, 2));
      return;
    }

    console.log(formatToolTable(res.data));
    console.log(`\n${res.total} tools total`);
  });
