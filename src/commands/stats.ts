import { Command } from "commander";
import chalk from "chalk";
import { listTools } from "../lib/api.js";

export const statsCommand = new Command("stats")
  .description("Show statistics about CLI tools on OpenCLI Hub")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const res = await listTools({ limit: 100 });
    const tools = res.data;

    const totalStars = tools.reduce((sum, t) => sum + t.stars, 0);
    const official = tools.filter((t) => t.maintainer_type === "official").length;
    const community = tools.filter((t) => t.maintainer_type === "community").length;
    const languages = new Set(tools.map((t) => t.primary_language).filter(Boolean));
    const categories = new Set(tools.map((t) => t.category).filter(Boolean));

    const stats = {
      total_tools: tools.length,
      official,
      community,
      total_stars: totalStars,
      languages: languages.size,
      categories: categories.size,
    };

    if (opts.json) {
      console.log(JSON.stringify(stats, null, 2));
      return;
    }

    console.log(chalk.bold("OpenCLI Hub Statistics\n"));
    console.log(`  ${chalk.dim("Total tools:")}    ${stats.total_tools}`);
    console.log(`  ${chalk.dim("Official:")}       ${chalk.green(String(stats.official))}`);
    console.log(`  ${chalk.dim("Community:")}      ${chalk.blue(String(stats.community))}`);
    console.log(`  ${chalk.dim("Total stars:")}    ${totalStars.toLocaleString()}`);
    console.log(`  ${chalk.dim("Languages:")}      ${stats.languages}`);
    console.log(`  ${chalk.dim("Categories:")}     ${stats.categories}`);
  });
