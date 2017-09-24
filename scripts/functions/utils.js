var spawn = require('child_process').spawn;
const chalk = require('chalk');

module.exports.execCommand = function(command, args, callback) {

    var cmd = spawn(command, args);

    cmd.stdout.on('data', function (data) {
        console.log(data.toString('utf8'));
    });

    cmd.stderr.on('data', function (err) {
        console.log(chalk.bold.red(err));
    });

    cmd.on('close', function (code) {
        if (code !== 0) {
            return callback(`Process exited with code ${code}`);
        }
        else {
            callback();
        }
    });

    return cmd;
};

module.exports.log = {
    step: function(s) {
        console.log(chalk.underline(s), "\n");
    }
};
