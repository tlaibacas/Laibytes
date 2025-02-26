#!/usr/bin/env node
import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { execa } from "execa";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program
  .version("1.0.5")
  .description(
    chalk.blue("Laibytes CLI - Official tool for creating web projects")
  );

program
  .command("create <project-name>")
  .description("Creates a new project")
  .action(async (projectName: string) => {
    try {
      const { projectType } = await inquirer.prompt<{ projectType: string }>({
        type: "list",
        name: "projectType",
        message: "Select the project type:",
        choices: [
          { name: "🏢 Institutional Site", value: "institucional" },
          { name: "🔄 Dynamic Site", value: "dinamico" },
          { name: "🛒 E-commerce", value: "loja-virtual" },
          { name: "📄 One-Page Site", value: "one-page" },
          { name: "🌐 Portal", value: "portal" },
          { name: "🔥 Hotsite", value: "hotsite" },
          { name: "📱 Landing Page", value: "landing-page" },
        ],
      });

      const spinner = ora(
        chalk.yellow(`Creating project ${projectName}...`)
      ).start();
      const projectPath = path.join(process.cwd(), projectName);

      if (fs.existsSync(projectPath)) {
        spinner.fail(chalk.red(`Directory ${projectName} already exists!`));
        return;
      }

      fs.mkdirSync(projectPath);

      // Step 3: Copy template
      const templatePath = path.join(__dirname, "../templates", projectType);
      fs.copySync(templatePath, projectPath);

      spinner.succeed(chalk.green(`Project created at: ${projectPath}`));

      // Step 4: Install dependencies (example for React)
      if (projectType === "blog" || projectType === "ecommerce") {
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
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
      } else {
        console.error(chalk.red(`❌ Error: ${String(error)}`));
      }
    }
  });

program.parse(process.argv);
