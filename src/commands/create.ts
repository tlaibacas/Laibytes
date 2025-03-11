import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { execa } from "execa";

type Template = {
  name: string;
  value: string;
  version: string;
  description: string;
  recommendation?: string;
};

type CreateProjectOptions = {
  template?: string;
  rootDir: string;
};

const loadTemplates = async (rootDir: string): Promise<Template[]> => {
  const templatesPath = path.join(rootDir, "templates/templates.json");

  try {
    const data = await fs.readFile(templatesPath, "utf-8");
    const templates = JSON.parse(data) as { choices: Template[] };

    if (!templates.choices || !Array.isArray(templates.choices)) {
      throw new Error("Invalid format: templates must have a 'choices' array.");
    }

    return templates.choices;
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
    const choices = templates.map((template) => ({
      name:
        template.value === "exit"
          ? template.name
          : `${template.name} (${chalk.green(`v${template.version}`)})`,
      value: template.value,
    }));

    const { projectType } = await inquirer.prompt<{ projectType: string }>({
      type: "list",
      name: "projectType",
      message: "Select a project template:",
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
    const templatePath = path.join(options.rootDir, "templates", projectType);

    if (!fs.existsSync(templatePath)) {
      spinner.fail(chalk.red(`Template not found: ${projectType}`));
      return;
    }

    fs.copySync(templatePath, projectPath);
    spinner.succeed(chalk.green(`Project created at: ${projectPath}`));

    const packageJsonPath = path.join(projectPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const installSpinner = ora(
        chalk.yellow("Installing dependencies...")
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
        "Error creating project:",
        error instanceof Error ? error.message : "Unknown error"
      )
    );
  }
};
