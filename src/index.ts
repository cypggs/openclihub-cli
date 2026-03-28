#!/usr/bin/env node

import { Command } from "commander";
import { setApiUrl } from "./lib/api.js";
import { listCommand } from "./commands/list.js";
import { searchCommand } from "./commands/search.js";
import { infoCommand } from "./commands/info.js";
import { installCommand } from "./commands/install.js";
import { authCommand } from "./commands/auth.js";
import { categoriesCommand } from "./commands/categories.js";
import { statsCommand } from "./commands/stats.js";
import { openCommand } from "./commands/open.js";

const program = new Command();

program
  .name("openclihub")
  .description("Search, browse and install CLI tools from OpenCLI Hub")
  .version("0.1.0")
  .option("--api-url <url>", "Custom API URL (default: https://openclihub.com)")
  .hook("preAction", (thisCommand) => {
    const apiUrl = thisCommand.opts().apiUrl;
    if (apiUrl) setApiUrl(apiUrl);
  });

program.addCommand(listCommand);
program.addCommand(searchCommand);
program.addCommand(infoCommand);
program.addCommand(installCommand);
program.addCommand(authCommand);
program.addCommand(categoriesCommand);
program.addCommand(statsCommand);
program.addCommand(openCommand);

program.parse();
