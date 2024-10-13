#!/usr/bin/env node

import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { promises as fs } from 'fs';
import path from 'path';

// Function to run commands with better error handling and output
const runCommand = (command, description) => {
  const spinner = ora(description).start();
  try {
    execSync(command, { stdio: 'pipe' });
    spinner.succeed();
    return true;
  } catch (error) {
    spinner.fail();
    console.error(chalk.red(`Failed to execute ${command}`));
    console.error(chalk.red(error.stderr.toString()));
    return false;
  }
};

// Function to create directory if it doesn't exist
const createDirectoryIfNotExists = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// New function to copy files from root directory
async function copyRootFiles(sourceDir, targetDir) {
  const files = await fs.readdir(sourceDir);
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    const stats = await fs.stat(sourcePath);
    if (stats.isFile() && file !== '.git' && file !== '.gitignore') {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

// Main function
async function main() {
  const repoName = process.argv[2];
  if (!repoName) {
    console.error(chalk.red("Please provide a repository name as the second argument like > npx create-edu-dapp my-dapp"));
    process.exit(1);
  }

  const questions = [
    {
      type: "list",
      name: "frontendFramework",
      message: "Please select the frontend framework:",
      choices: ["React and NextJS", "Vue and NuxtJS"],
    },
    {
      type: "list",
      name: "projectType",
      message: "Please select the project type:",
      choices: ["hardhat", "foundry"],
    },
  ];

  const { frontendFramework, projectType } = await inquirer.prompt(questions);

  const repoUrl = "https://github.com/AsharibAli/create-edu-dapp";
  const frontendFolder = frontendFramework === "React and NextJS" ? "react-nextjs" : "vue-nuxtjs";
  const backendFolder = projectType === "hardhat" ? "hardhat" : "foundry";

  const tempDir = `${repoName}-temp`;
  const projectDir = repoName;

  console.log(chalk.blue("\nSetting up your project. This might take a moment..."));

  // Clone repository
  if (!runCommand(`git clone --depth 1 ${repoUrl} ${tempDir}`, "Cloning repository")) {
    process.exit(1);
  }

  // Create project directory
  await createDirectoryIfNotExists(projectDir);

  // Move required folders
  await fs.rename(path.join(tempDir, 'frontend', frontendFolder), path.join(projectDir, 'frontend'));
  await fs.rename(path.join(tempDir, 'backend', backendFolder), path.join(projectDir, 'backend'));

  // Copy files from root directory
  await copyRootFiles(tempDir, projectDir);

  // Remove temp directory
  await fs.rm(tempDir, { recursive: true, force: true });

  // Install dependencies
  if (!runCommand(`cd ${projectDir}/frontend && npm install`, `Installing frontend dependencies`)) {
    process.exit(1);
  }

  if (projectType === "hardhat") {
    if (!runCommand(`cd ${projectDir}/backend && npm install`, `Installing backend dependencies`)) {
      process.exit(1);
    }
  }

  console.log(chalk.green("\nSuccess! 🎉"));
  console.log("\nFollow the Quickstart guide in README.md");

  if (projectType === "hardhat") {
    console.log(
      chalk.cyan("\nTo set up the backend, run the following commands:")
    );
    console.log(chalk.cyan(`cd ${repoName} && cd backend`));
    console.log(
      chalk.yellow(
        "\n⚠️ Please create a .env file in the backend directory and paste your Metamask private key:"
      )
    );
    console.log(chalk.cyan("ACCOUNT_PRIVATE_KEY="), "<YOUR_KEY>");
    console.log(chalk.cyan("\t npx hardhat compile"));
    console.log(chalk.cyan("\t npx hardhat test"));
    console.log(
      chalk.cyan("\t npx hardhat run scripts/deploy.ts --network opencampus")
    );
    console.log(
      chalk.cyan(
        "\t npx hardhat verify --network opencampus <deployed-contract-address>"
      )
    );
  } else if (projectType === "foundry") {
    console.log(
      chalk.cyan("\nTo set up the backend, run the following commands:")
    );
    console.log(chalk.cyan(`cd ${repoName} && cd backend`));
    console.log(
      chalk.yellow(
        "\n⚠️ Please create a .env file in the backend directory and paste your Metamask private key:"
      )
    );
    console.log(chalk.cyan("ACCOUNT_PRIVATE_KEY="), "<YOUR_KEY>");
    console.log(chalk.cyan("\t forge compile"));
    console.log(chalk.cyan("\t forge test"));
    console.log(
      chalk.cyan(
        "\t forge script script/DeployGreeter.s.sol --broadcast --rpc-url https://rpc.open-campus-codex.gelato.digital/ --gas-limit 30000000 --with-gas-price 5gwei --skip-simulation"
      )
    );
    console.log(
      chalk.cyan(
        "\t forge verify-contract --rpc-url https://rpc.open-campus-codex.gelato.digital --verifier blockscout --verifier-url 'https://opencampus-codex.blockscout.com/api/' <deployed-contract-address> src/Greeter.sol:Greeter"
      )
    );
  }

  console.log(
    chalk.cyan(
      "\nTo start the frontend development server, run the following commands:"
    )
  );
  console.log(chalk.cyan(`cd ${repoName} && cd frontend`));
  console.log(chalk.cyan("npm run dev"));

  console.log("\n➡️ Happy Building on the EduChain ⚡");
  console.log("\n➡️ Let's bring Education on-chain 📚");
  console.log(chalk.yellow("\n-----------------------"));
}

main().catch(error => {
  console.error(chalk.red("An unexpected error occurred:"));
  console.error(chalk.red(error));
  process.exit(1);
});
