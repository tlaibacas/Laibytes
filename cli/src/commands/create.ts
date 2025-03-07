import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { execa } from "execa";
import { fileURLToPath } from "url";
import templates from "../../templates/templates.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Template = {
  name: string;
  value: string;
  version: string;
  description: string;
  recommendation: string;
};

export const createProject = async (projectName: string) => {
  try {
    const choices = templates.choices.map((template: Template) => ({
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

    const templatePath = path.join(__dirname, "../../templates", projectType);

    if (!fs.existsSync(templatePath)) {
      spinner.fail(chalk.red(`Template not found: ${templatePath}`));
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
        installSpinner.fail(chalk.red("Error installing dependencies!"));
        console.error(error);
      }
    } else {
      console.log(
        chalk.yellow("⚠️ No package.json found. Skipping npm install.")
      );
    }

    console.log(
      chalk.blue(`\n✅ Project "${projectName}" created successfully!`)
    );
    console.log(chalk.green(`➡️ Next steps:`));
    console.log(chalk.yellow(`  cd ${projectName}`));
    console.log(chalk.yellow(`  npm run dev`));
    console.log(chalk.blue(`\n🚀 Happy coding!`));
  } catch (error) {
    console.error(chalk.red("Error creating project:", error));
  }
};
