#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import { createProject } from "../commands/create.js";
import { readFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { findUp } from "find-up";

const getProjectRoot = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const packagePath = await findUp("package.json", { cwd: __dirname });
  if (!packagePath) throw new Error("package.json not found!");

  return {
    rootDir: dirname(packagePath),
    packagePath,
  };
};

(async () => {
  try {
    const { rootDir, packagePath } = await getProjectRoot();
    const pkg = JSON.parse(await readFile(packagePath, "utf-8"));
    console.log();
    console.log(
      chalk.bold.cyan(`${pkg.name} `) + chalk.bold.magenta(`v${pkg.version}`)
    );
    console.log(chalk.italic.green(`${pkg.description}`));
    console.log(chalk.italic.magenta(`Author: ${pkg.author}`));
    console.log();

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
