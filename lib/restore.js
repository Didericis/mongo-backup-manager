var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var spawn = require('child_process').spawn;
var Spinner = require('cli-spinner').Spinner;

var requireArgs = require('./Utils.js').requireArgs;

var selectFromProfile = function selectFromProfile(args) {
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
            message: "Select a profile to restore from:",
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

var selectBackup = function selectBackup(args) {
    requireArgs(arguments, ['config', 'profileFrom']);
    var config = args.config;
    var profileFrom = args.profileFrom;
    var profileFromObj = config.profile(profileFrom);

    return new Promise(function(resolve, reject) {
        var options = fs.readdirSync(path.join(config.backupDir(), profileFrom));
        var exitOption = 'EXIT';

        options.push(new inquirer.Separator());
        options.push(exitOption);

        inquirer.prompt([{
            type: "list",
            name: "backup",
            message: "Select a backup:",
            choices: options
        }], function(answers) {
            if (answers.backup === exitOption) {
                reject();
            } else {
                resolve({
                    config: config,
                    backup: path.join(config.backupDir(), profileFrom, answers.backup, profileFromObj.db())
                });
            }
        });
    }); 
}

var selectToProfile = function selectToProfile(args) {
    requireArgs(arguments, ['config', 'backup']);
    var config = args.config;
    var backup = args.backup;

    return new Promise(function(resolve, reject) {
        var options = config.listProfiles();
        var exitOption = 'EXIT';

        options.push(new inquirer.Separator());
        options.push(exitOption);

        inquirer.prompt([{
            type: "list",
            name: "profileTo",
            message: "Select a profile to restore to:",
            choices: options
        }], function(answers) {
            if (answers.profile === exitOption) {
                reject();
            } else {
                resolve({
                    config: config,
                    backup: backup,
                    profileTo: answers.profileTo
                });
            }
        });   
    });    
}

var buildRestoreArgument = function buildRestoreArgument(args) {
    requireArgs(arguments, ['config', 'backup', 'profileTo']);
    var config = args.config;
    var backup = args.backup;
    var profileTo = args.profileTo;
    var profileFrom = args.profileFrom;
    var profileToObj = config.profile(profileTo);

    return new Promise(function(resolve, reject) {
        var commandArgs = [];

        commandArgs = commandArgs.concat(['-h', profileToObj.host()]);
        commandArgs = commandArgs.concat(['--port', profileToObj.port()]); 
        commandArgs = commandArgs.concat(['--db', profileToObj.db()]);
        commandArgs = commandArgs.concat(['--drop']);
        commandArgs = commandArgs.concat([backup]);   

        resolve({
            commandArgs: commandArgs
        });
    });
}

var runMongoRestore = function runMongoRestore(args) {
    requireArgs(arguments, ['commandArgs']);
    var commandArgs = args.commandArgs;

    return new Promise(function(resolve, reject) {
        var mongorestore = spawn('mongorestore', commandArgs);
        var result = ''
        var err = '';
        var spinner = new Spinner('restoring... %s');

        spinner.setSpinnerString('|/-\\');
        spinner.start();

        mongorestore.stdout.on('data', function(data) {
            result += data.toString();
        });
        mongorestore.stderr.on('data', function(data) {
            err += data.toString();
        });
        mongorestore.stderr.on('close', function() {
            spinner.stop();
            if (err != '') {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.restore = function restore(config) {
    return selectFromProfile( { config: config } )
    .then( selectBackup )
    .then( selectToProfile )
    .then( buildRestoreArgument )
    .then( runMongoRestore );
};