import { Command } from "commander";
import chalk from "chalk";
import { listTools } from "../lib/api.js";

export const categoriesCommand = new Command("categories")
  .description("List all tool categories")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const res = await listTools({ limit: 100 });
    const counts = new Map<string, number>();

    for (const t of res.data) {
      const cat = t.category || "Uncategorized";
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }

    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

    if (opts.json) {
      console.log(JSON.stringify(Object.fromEntries(sorted), null, 2));
      return;
    }

    for (const [cat, count] of sorted) {
      console.log(`  ${chalk.bold(cat)} ${chalk.dim(`(${count})`)}`);
    }
  });
