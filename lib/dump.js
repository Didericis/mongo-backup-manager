var inquirer = require('inquirer');
var path = require('path');
var spawn = require('child_process').spawn;
var Spinner = require('cli-spinner').Spinner;

var requireArgs = require('./Utils.js').requireArgs;

function createFilePath(config, profileFrom) {
    var fileName = config.datePrefix() + (new Date()).toISOString();

    return path.join(config.backupDir(), profileFrom, fileName);
}

function selectDumpProfile(args) {
    requireArgs(arguments, ['config']);
    var config = args.config;

    return new Promise(function(resolve, reject) {
        var options = config.listProfiles();
        var exitOption = 'EXIT';

        options.push(new inquirer.Separator());
        options.push(exitOption);

        inquirer.prompt([{
            type: "list",
            name: "profileFrom",
            message: "Select a profile to dump from:",
            choices: options
        }], function(answers) {
            if (answers.profileFrom === exitOption) {
                reject();
            } else {
                resolve({
                    config: config,
                    profileFrom: answers.profileFrom
                });
            }
        });
    });
}

function buildDumpArgument(args) {
    requireArgs(arguments, ['config']);
    var config = args.config;
    var profileFrom = args.profileFrom;
    var profileFromObj = config.profile(profileFrom);

    return new Promise(function(resolve, reject) {
        var buildCommandArgs = function buildCommandArgs(username, password) {
            var commandArgs = [];

            commandArgs = commandArgs.concat(['-h', profileFromObj.host()]);
            commandArgs = commandArgs.concat(['--authenticationDatabase', profileFromObj.authDb()]);
            commandArgs = commandArgs.concat(['--db', profileFromObj.db()]);
            commandArgs = commandArgs.concat(['-o', createFilePath(config, profileFrom)]);

            if (username) {
                commandArgs = commandArgs.concat(['-u', username]);
            }

            if (password) {
                commandArgs = commandArgs.concat(['-p', password]);
            }

            resolve({
                commandArgs: commandArgs
            });
        }

        if (profileFromObj.authDb()) {
            inquirer.prompt([{
                type: "input",
                name: "username",
                message: "Username:"
            }, {
                type: 'password',
                name: 'password',
                message: 'Password:'
            }], function(answers) {
                var username = answers.username;
                var password = answers.password;

                buildCommandArgs(username, password);
            });
        } else {
            buildCommandArgs();
        }
    });
}

function runMongoDump(args) {
    requireArgs(arguments, ['commandArgs']);
    var commandArgs = args.commandArgs;

    return new Promise(function(resolve, reject) {
        var mongodump = spawn('mongodump', commandArgs);
        var spinner = new Spinner('dumping... %s');

        spinner.setSpinnerString('|/-\\');
        spinner.start();

        //mongodump seems to only write to stderr
        mongodump.stderr.on('data', function(data) {
            if (spinner.isSpinning()) {
                spinner.stop();
                console.log('\n');
            }
            console.log(data.toString());
        });

        mongodump.stderr.on('close', function() {
            resolve();
        });
    });
}

exports.dump = function dump(config) {
    return selectDumpProfile({ config: config })
    .then( buildDumpArgument )
    .then( runMongoDump );
};
