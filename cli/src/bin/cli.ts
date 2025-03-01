#!/usr/bin/env node
import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { execa } from "execa";
import { fileURLToPath } from "url";
import Player from "play-sound";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const player = Player();

program
  .version("1.1.1")
  .description(
    chalk.blue("Laibytes CLI - Helpful tool for creating web projects")
  );

// Function to play music

const playThemeSong = () => {
  const themeSongPath = path.join(__dirname, "../assets/theme.mp3");
  console.log(chalk.blue("Attempting to play theme song from:", themeSongPath)); // Debug log
  if (fs.existsSync(themeSongPath)) {
    player.play(themeSongPath, (err: unknown) => {
      if (err) {
        console.error(chalk.red("Error playing theme song:", err));
      } else {
        console.log(chalk.green("Theme song played successfully!")); // Debug log
      }
    });
  } else {
    console.error(chalk.red("Theme song not found at:", themeSongPath));
  }
};

program
  .command("create <project-name>")
  .description("Creates a new project")
  .action(async (projectName: string) => {
    try {
      // Play music when the command starts
      playThemeSong();

      // Step 1: Prompt user to select project type
      const { projectType } = await inquirer.prompt<{ projectType: string }>({
        type: "list",
        name: "projectType",
        message: "Select the project type:",
        choices: [
          { name: "🏢 Institutional Site", value: "institutional" },
          { name: "🔄 Dynamic Site", value: "dynamic" },
          { name: "🛒 E-commerce", value: "e-commerce" },
          { name: "📄 One-Page Site", value: "one-page" },
          { name: "🌐 Portal", value: "portal" },
          { name: "🔥 Hotsite", value: "hotsite" },
          { name: "📱 Landing Page", value: "landing-page" },
        ],
      });

      // Step 2: Create project directory
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

      if (!fs.existsSync(templatePath)) {
        spinner.fail(chalk.red(`Template not found: ${templatePath}`));
        return;
      }

      fs.copySync(templatePath, projectPath);
      spinner.succeed(chalk.green(`Project created at: ${projectPath}`));

      // Step 4: Install dependencies (if applicable)
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

      // Step 5: Final message with next steps
      console.log(
        chalk.blue(`\n✅ Project "${projectName}" created successfully!`)
      );
      console.log(chalk.green(`➡️ Next steps:`));
      console.log(chalk.yellow(`  cd ${projectName}`));
      console.log(chalk.yellow(`  npm run dev`));
      console.log(chalk.blue(`\n🚀 Happy coding!`));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`❌ Error: ${error.message}`));
      } else {
        console.error(chalk.red(`❌ Error: ${String(error)}`));
      }
    }
  });

program.parse(process.argv);
