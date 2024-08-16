#!/usr/bin/env node

import { execSync } from "child_process";

// Use dynamic imports to handle ESM and CommonJS compatibility
const importModule = async (module) => {
  try {
    return await import(module);
  } catch (error) {
    console.error(`Error importing module ${module}:`, error);
    process.exit(1);
  }
};

(async () => {
  const chalk = (await importModule("chalk")).default;
  const inquirer = (await importModule("inquirer")).default;
  const ora = (await importModule("ora")).default;

  const runCommand = (command, description) => {
    const spinner = ora(description).start();
    try {
      execSync(`${command}`, { stdio: "inherit" });
      spinner.succeed();
    } catch (e) {
      spinner.fail();
      console.error(`Failed to execute ${command}`, e);
      return false;
    }
    return true;
  };

  const repoName = process.argv[2];
  if (!repoName) {
    console.error(
      "Please provide a repository name as the second argument like > npx create-edu-dapp my-dapp"
    );
    process.exit(-1);
  }

  const questions = [
    {
      type: "list",
      name: "projectType",
      message: "Please select the project type:",
      choices: ["hardhat", "foundry"],
    },
    {
      type: "input",
      name: "authorName",
      message: "Enter your name (optional):",
    },
  ];

  inquirer.prompt(questions).then((answers) => {
    const { projectType, authorName } = answers;

    let gitCheckoutCommand;
    let installFrontendDepsCommand;
    let installBackendDepsCommand;

    if (projectType === "hardhat") {
      gitCheckoutCommand = `git clone --depth 1 https://github.com/AsharibAli/create-edu-dapp-hardhat ${repoName}`;
      installFrontendDepsCommand = `cd ${repoName} && cd frontend && npm install`;
      installBackendDepsCommand = `cd ${repoName} && cd backend && npm install`;
    } else if (projectType === "foundry") {
      gitCheckoutCommand = `git clone --depth 1 https://github.com/AsharibAli/create-edu-dapp-foundry ${repoName}`;
      installFrontendDepsCommand = `cd ${repoName} && cd frontend && npm install`;
      installBackendDepsCommand = `cd ${repoName} && cd backend`;
    }

    if (
      !runCommand(gitCheckoutCommand, chalk.green("Cloning the repository"))
    ) {
      process.exit(-1);
    }

    if (
      !runCommand(
        installFrontendDepsCommand,
        chalk.green(`Installing frontend dependencies for ${repoName}`)
      )
    ) {
      process.exit(-1);
    }

    if (
      !runCommand(
        installBackendDepsCommand,
        chalk.green(`Installing backend dependencies for ${repoName}`)
      )
    ) {
      process.exit(-1);
    }

    console.log(chalk.yellow("\n-----------------------"));
    console.log(chalk.green(`\nSuccess! 🎉`));
    if (authorName) {
      console.log(
        chalk.green(`Thank you, ${authorName}, for using create-edu-dapp 🙌`)
      );
    }
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

    console.log("\nHappy Building on Open Campus L3 chain!");
    console.log(chalk.yellow("\n-----------------------"));
  });
})();
