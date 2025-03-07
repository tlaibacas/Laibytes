#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import { createProject } from "../commands/create.js";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packagePath = resolve(__dirname, "../../package.json");
const pkg = JSON.parse(readFileSync(packagePath, "utf-8"));

program
  .version(pkg.version)
  .name(pkg.name)
  .description(chalk.blue(`${pkg.description} (v${pkg.version})`));

program
  .command("create <project-name>")
  .description("Creates a new project")
  .action(createProject);

program.parse(process.argv);
