#!/usr/bin/env node
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { execa } from "execa";
import fetch from "node-fetch";

declare module "inquirer" {
  interface Theme {
    prefix: string;
  }
}

type Template = {
  type: string;
  refs?: string[];
};

type CreateProjectOptions = {
  template?: string;
  rootDir: string;
};

const loadTemplates = async (rootDir: string): Promise<Template[]> => {
  const templatesUrl =
    "https://raw.githubusercontent.com/tlaibacas/templates/master/template.json";

  try {
    const response = await fetch(templatesUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const data: any = await response.json();
    if (!data.choices || !Array.isArray(data.choices)) {
      throw new Error("Invalid format: templates must have a 'choices' array.");
    }

    return data.choices as Template[];
  } catch (error) {
    throw new Error(
      `Failed to load templates: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const createProject = async (
  projectName: string,
  options: CreateProjectOptions
) => {
  try {
    const templates = await loadTemplates(options.rootDir);

    const { selectedType } = await inquirer.prompt<{ selectedType: Template }>({
      type: "list",
      name: "selectedType",
      message: "Select a project type:",
      choices: templates.map((template) => ({
        name: template.type,
        value: template,
      })),
      loop: false,
      theme: {
        prefix: "",
      },
    });

    if (selectedType.type === "🚪 Exit") {
      console.log(chalk.blue("\n👋 Exiting CLI..."));
      return;
    }

    let templateRef = "";
    if (selectedType.refs && selectedType.refs.length > 0) {
      const { selectedRef } = await inquirer.prompt<{ selectedRef: string }>({
        type: "list",
        name: "selectedRef",
        message: "Select a version:",
        choices: selectedType.refs.map((ref) => ({
          name: ref,
          value: ref,
        })),
        loop: false,
        theme: {
          prefix: "",
        },
      });
      templateRef = selectedRef;
    }

    const spinner = ora(
      chalk.yellow(`\nCreating project ${projectName}...`)
    ).start();
    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
      spinner.fail(chalk.red(`Directory ${projectName} already exists!`));
      return;
    }

    fs.mkdirSync(projectPath);
    const templatePath = path.join(
      options.rootDir,
      "templates",
      templateRef || selectedType.type
    );

    if (!fs.existsSync(templatePath)) {
      spinner.fail(chalk.red(`Template not found: ${templatePath}`));
      return;
    }

    fs.copySync(templatePath, projectPath);
    spinner.succeed(chalk.green(`Project created at: ${projectPath}`));

    const packageJsonPath = path.join(projectPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const installSpinner = ora(
        chalk.yellow("\nInstalling dependencies...")
      ).start();
      try {
        await execa("npm", ["install"], { cwd: projectPath });
        installSpinner.succeed(
          chalk.green("Dependencies installed successfully!")
        );
      } catch (error) {
        installSpinner.fail(chalk.red("Failed to install dependencies!"));
        console.error(error instanceof Error ? error.message : "Unknown error");
      }
    }

    console.log(
      chalk.blue(`\n✅ Project "${projectName}" created successfully!`)
    );
    console.log(chalk.green("➡️ Next steps:"));
    console.log(chalk.yellow(`  cd ${projectName}`));
    console.log(chalk.yellow("  npm run dev"));
    console.log(chalk.blue("\n🚀 Happy coding!"));
  } catch (error) {
    console.error(
      chalk.red(
        "\nError creating project:",
        error instanceof Error ? error.message : "Unknown error"
      )
    );
    process.exit(1);
  }
};
