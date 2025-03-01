import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import Player from "play-sound";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const player = Player();

export const playThemeSong = () => {
  const themeSongPath = path.resolve(__dirname, "../../assets/theme.mp3");

  console.log(chalk.blue("Attempting to play theme song from:", themeSongPath));

  if (fs.existsSync(themeSongPath)) {
    player.play(themeSongPath, (err: unknown) => {
      if (err) {
        console.error(chalk.red("Error playing theme song:", err));
      } else {
        console.log(chalk.green("Theme song played successfully!"));
      }
    });
  } else {
    console.error(chalk.red("Theme song not found at:", themeSongPath));
  }
};
