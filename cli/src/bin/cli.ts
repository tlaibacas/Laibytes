#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import { createProject } from "../commands/create";

program
  .version("1.1.1")
  .description(
    chalk.blue("Laibytes CLI - Helpful tool for creating web projects")
  );

program
  .command("create <project-name>")
  .description("Creates a new project")
  .action(createProject);

program.parse(process.argv);
