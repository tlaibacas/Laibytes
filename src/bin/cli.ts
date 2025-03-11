#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import { createProject } from "../commands/create.js";
import { readFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { findUp } from "find-up";
import { readFileSync } from "fs";

const templates = JSON.parse(
  readFileSync(
    new URL("../../templates/templates.json", import.meta.url),
    "utf-8"
  )
);

const getProjectRoot = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const packagePath = await findUp("package.json", { cwd: __dirname });
  if (!packagePath) throw new Error("package.json not found!");

  return {
    rootDir: dirname(packagePath),
    packagePath,
    __dirname,
    __filename,
  };
};

(async () => {
  try {
    const { rootDir, packagePath } = await getProjectRoot();

    const pkg = JSON.parse(await readFile(packagePath, "utf-8"));

    const centerText = (text: string) => {
      const terminalWidth = process.stdout.columns || 80;
      const textLength = text.length;
      const padding = Math.max(0, Math.floor((terminalWidth - textLength) / 2));
      return " ".repeat(padding) + text;
    };

    console.log(chalk.bold.yellow(centerText(`${pkg.name}`)));
    console.log(chalk.green(centerText(`Version: ${pkg.version}`)));
    console.log(chalk.yellow.italic(centerText(`${pkg.description}`)));

    program
      .version(pkg.version)
      .name(pkg.name)
      .description(
        chalk.hex("#00ff00")(`${pkg.description} (v${pkg.version})`)
      );

    program
      .command("create <project-name>")
      .description("Creates a new project")
      .option("-t, --template <name>", "Specifies a template")
      .action(async (projectName, options) => {
        await createProject(projectName, {
          template: options.template,
          rootDir,
        });
      });

    program.parse(process.argv);
  } catch (error) {
    console.error(chalk.red("⛔ Critical error:"));
    if (error instanceof Error) {
      console.error(chalk.yellow(error.message));
    } else {
      console.error(chalk.yellow(String(error)));
    }
    process.exit(1);
  }
})();
