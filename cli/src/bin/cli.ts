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
  if (!packagePath) throw new Error("package.json não encontrado!");

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

    program
      .version(pkg.version)
      .name(pkg.name)
      .description(
        chalk.hex("#00ff00")(`${pkg.description} (v${pkg.version})`)
      );

    program
      .command("create <project-name>")
      .description("Cria um novo projeto")
      .option("-t, --template <name>", "Especifica um template")
      .action(async (projectName, options) => {
        console.log(chalk.yellow.bold(`\n⚡ ${pkg.name} v${pkg.version}`));
        console.log(chalk.blue(pkg.description + "\n"));

        await createProject(projectName, {
          template: options.template,
          rootDir,
        });
      });

    program.parse(process.argv);
  } catch (error) {
    console.error(chalk.red("⛔ Erro crítico:"));
    console.error(chalk.yellow(error.message));
    process.exit(1);
  }
})();
