const {execCommand} = require("./utils");

module.exports.install = function(callback) {
    execCommand('npm', ['install'], callback);
};

module.exports.link = function(callback) {
    execCommand('npm', ['link'], callback);
};
