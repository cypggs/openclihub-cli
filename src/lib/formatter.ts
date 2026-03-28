import chalk from "chalk";
import Table from "cli-table3";
import type { CliTool } from "../types.js";

export function formatToolTable(tools: CliTool[]): string {
  const table = new Table({
    head: [
      chalk.bold("Name"),
      chalk.bold("Slug"),
      chalk.bold("Type"),
      chalk.bold("Category"),
      chalk.bold("Language"),
      chalk.bold("Stars"),
    ],
    style: { head: [], border: [] },
  });

  for (const t of tools) {
    const badge =
      t.maintainer_type === "official"
        ? chalk.green("official")
        : chalk.blue("community");
    table.push([
      chalk.white.bold(t.name),
      chalk.dim(t.slug),
      badge,
      t.category || "-",
      t.primary_language || "-",
      t.stars > 0 ? formatStars(t.stars) : "-",
    ]);
  }

  return table.toString();
}

export function formatToolDetail(t: CliTool): string {
  const lines: string[] = [];
  const badge =
    t.maintainer_type === "official"
      ? chalk.green("● Official")
      : chalk.blue("● Community");

  lines.push(chalk.bold.white(`${t.name}`) + `  ${badge}`);
  lines.push(chalk.dim(`slug: ${t.slug}`));
  lines.push("");

  if (t.description) lines.push(t.description);
  lines.push("");

  if (t.maintainer_name) lines.push(`${chalk.dim("Maintainer:")}  ${t.maintainer_name}`);
  if (t.primary_language) lines.push(`${chalk.dim("Language:")}    ${t.primary_language}`);
  if (t.category) lines.push(`${chalk.dim("Category:")}    ${t.category}`);
  if (t.stars > 0) lines.push(`${chalk.dim("Stars:")}       ${formatStars(t.stars)}`);
  lines.push("");

  if (t.install_command) {
    lines.push(chalk.dim("Install:"));
    lines.push(`  ${chalk.green("$")} ${t.install_command}`);
    lines.push("");
  }

  if (t.agent_install_command) {
    lines.push(chalk.dim("Agent Install:"));
    lines.push(`  ${chalk.blue(t.agent_install_command)}`);
    lines.push("");
  }

  if (t.github_url) lines.push(`${chalk.dim("GitHub:")}      ${t.github_url}`);
  if (t.homepage_url) lines.push(`${chalk.dim("Homepage:")}    ${t.homepage_url}`);
  lines.push(`${chalk.dim("Detail:")}      https://openclihub.com/tool/${t.slug}`);

  return lines.join("\n");
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
