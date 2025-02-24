#!/usr/bin/env node
const { program } = require("commander");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const ora = require("ora");

program
  .version("1.0.0")
  .description(
    chalk.blue.bold("Laibytes CLI - Official tool for creating web projects")
  );

program
  .command("create <project-name>")
  .description("Creates a new project")
  .action(async (projectName) => {
    try {
      // Step 1: Project type selection
      const { projectType } = await inquirer.prompt({
        type: "list",
        name: "projectType",
        message: "Select the project type:",
        choices: [
          { name: "Static Site", value: "static" },
          { name: "Blog", value: "blog" },
          { name: "E-commerce", value: "ecommerce" },
        ],
      });

      // Step 2: Directory creation
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
        shell.cd(projectPath);
        shell.exec("npm install", { silent: true }, (code) => {
          if (code === 0) {
            installSpinner.succeed(
              chalk.green("Dependencies installed successfully!")
            );
          } else {
            installSpinner.fail(chalk.red("Error installing dependencies!"));
          }
        });
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
    }
  });

program.parse(process.argv);
