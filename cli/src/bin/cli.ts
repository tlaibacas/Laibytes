#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import { createProject } from "../commands/create.js";
import { readFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { findUp } from "find-up";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { execa } from "execa";
import templates from "../../templates/templates.json" assert { type: "json" };

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

type Template = {
  name: string;
  value: string;
  version: string;
  description: string;
  recommendation: string;
};

type Choice = {
  name: string;
  value: string;
};

type CreateProjectOptions = {
  template?: string;
  rootDir: string;
};

const createNewProject = async (
  projectName: string,
  options: CreateProjectOptions
) => {
  try {
    const choices: Choice[] = templates.choices.map((template: Template) => ({
      name: `${template.name} (v${template.version})`,
      value: template.value,
    }));

    const { projectType } = await inquirer.prompt<{ projectType: string }>({
      type: "list",
      name: "projectType",
      message: "Select the project type:",
      choices,
      loop: false,
    });

    if (projectType === "exit") {
      console.log(chalk.blue("👋 Exiting CLI..."));
      return;
    }

    const spinner = ora(
      chalk.yellow(`Creating project ${projectName}...`)
    ).start();
    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
      spinner.fail(chalk.red(`Directory ${projectName} already exists!`));
      return;
    }

    fs.mkdirSync(projectPath);
    // ...existing code...
  } catch (error) {
    console.error(chalk.red("Error creating project:", error));
  }
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

        await createNewProject(projectName, {
          template: options.template,
          rootDir,
        });
      });

    program.parse(process.argv);
  } catch (error) {
    console.error(chalk.red("⛔ Erro crítico:"));
    if (error instanceof Error) {
      console.error(chalk.yellow(error.message));
    } else {
      console.error(chalk.yellow(String(error)));
    }
    process.exit(1);
  }
})();
