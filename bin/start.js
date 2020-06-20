#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const program = require('commander');
const packageJson = require('../package.json');
const fs = require('fs-extra');
const path = require('path');
const spawn = require('cross-spawn');
const ejs = require('ejs');
const inquirer = require('inquirer');

const templatePath = path.resolve(__dirname, '../template');

program
  .version(packageJson.version)
  .option('-p, --path', 'path for project')
  .action(async (command) => {
    if (command.args.length > 0) {
      const projectPath = command.args[0];
      const { libName } = await inquirer.prompt([
        { type: 'input', name: 'libName', message: '请输入你的库名称：' },
      ]);
      if (!libName) {
        console.log(chalk.red('无效名称'));
        return;
      }
      console.log(chalk.blue('start...'));
      try {
        await fs.ensureDir(projectPath);
        await fs.copy(templatePath, projectPath);
        await renderPkgFile(projectPath, { libName });
        await installDeps(projectPath);
        console.log(chalk.green('create completed.'));
      } catch (e) {
        console.log(chalk.red('create error'));
        console.log(e);
      }
    } else {
      console.log(chalk.red('please input project path'));
    }
  })
  .parse(process.argv);

program.on('--help', () => {
  console.log();
  console.log(
    `直接创建，有需求或问题请直接提mr，${chalk.green(
      packageJson.repository.url
    )}`
  );
  console.log();
});

const renderPkgFile = async (projectPath, { libName }) => {
  const pkgFile = await ejs.renderFile(
    path.resolve(projectPath, 'package.json'),
    {
      name: libName,
    }
  );
  await fs.writeFile(path.resolve(projectPath, 'package.json'), pkgFile);
};

const installDeps = async (projectPath) => {
  process.chdir(path.resolve(process.cwd(), projectPath));
  const cmd = 'yarn';
  await new Promise((resolve, reject) => {
    spawn(cmd, ['install'], {
      stdio: 'inherit',
    }).on('close', (code) => {
      if (code !== 0) {
        console.log(chalk.red('install error'));
        reject();
      } else {
        resolve();
      }
    });
  });
};
