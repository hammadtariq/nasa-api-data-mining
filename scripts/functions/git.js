const {execCommand} = require("./utils");

module.exports.pull = function(callback) {
    execCommand('git', ['pull'], callback);
};

module.exports.checkout = function(branch, callback) {
    execCommand('git', ['checkout', branch], callback);
};

module.exports.tag = function(tag, callback) {
    if (!tag) {
        throw new Error("No tag specified.");
    }

    execCommand('git', ['tag', '-a', tag, '-m', `Auto generated tag '${tag}'`], () => {
        execCommand('git', ['push', '--tags', 'origin', 'master'], callback);
    });
};
