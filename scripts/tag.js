#!/usr/bin/env node
const chalk = require('chalk');
const pkg = require('./../package.json');

console.log('');
console.log(chalk.bold('SharedShelf Sync'), `version ${pkg.version}`, '\n');

const {log} = require("./functions/utils");
const git = require('./functions/git');

const strftime = require("strftime");
const tag = `sync-${strftime("%Y%m%d-%H%M")}`;

log.step(`Creating new tag ${tag}\n`);

git.tag(tag, function (err, result) {

    if (err) {
        console.log(chalk.bold.red(err));
        console.log(chalk.bold.red('Failed.'));
        return process.exit(1);
    }

    console.log(' %s Done', chalk.bold.green("✓"), "\n");
});

