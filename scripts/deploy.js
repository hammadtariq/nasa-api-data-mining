#!/usr/bin/env node
const chalk = require('chalk');

console.log('');
console.log(chalk.bold('SharedShelf Sync Deployment\n'));

const previous = require('./../package.json');
console.log(chalk.cyan('Current version:'), previous.version, "\n");

const program = require('commander');
program
    .version(previous.version)
    .option('--branch [branch]', 'Set branch or tag')
    .parse(process.argv);

const {log, execCommand} = require("./functions/utils");

const npm = require('./functions/npm');
const git = require('./functions/git');

let currentStep = 0;
function executeStep(name, fn, next) {
    currentStep += 1;
    log.step(`${currentStep}. ${name}`);
    fn(function (err) {
        if (err) {
            return next(err);
        }

        console.log(' %s Done', chalk.bold.green("✓"), "\n");
        next();
    });
}

function pullChanges(next) {
    const nextStep = next;

    const pullChangesStep = (n) => executeStep('Pulling latest changes', (callback) => git.pull(callback), n);

    if( program.branch ) {
        next = () => executeStep(`Checking out branch ${program.branch}`, (callback) => git.checkout(program.branch, callback), nextStep);
        pullChangesStep(next);
    }
    else {
        executeStep('Switching to master branch', (callback) => git.checkout("master", callback), () => pullChangesStep(nextStep));
    }

}

function installPackages(next) {
    executeStep('Installing packages', (callback) => npm.install(callback), next);
}

function linkBinaries(next) {
    executeStep('Linking binaries', (callback) => npm.link(callback), next);
}

function compileTypescript(next) {
    executeStep('Compiling typescript', (callback) => execCommand('tsc', [], callback), next);
}

function restartServices(next) {
    executeStep('Restarting services', (callback) => execCommand('pm2', ['restart', 'process.yml'], callback), next);
}

require('async').waterfall([
        pullChanges,
        installPackages,
        linkBinaries,
        compileTypescript,
        restartServices,
    ],
    function (err, result) {

        if (err) {
            console.log(chalk.bold.red(err));
            console.log(chalk.bold.red('Deployment failed.'));
            return process.exit(1);
        }

        const newPackage = require('./../package.json');
        console.log(chalk.bold.green('Successfully deployed version: '), newPackage.version);
    });

