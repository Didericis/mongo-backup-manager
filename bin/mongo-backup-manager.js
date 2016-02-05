#!/usr/bin/env node

var clear = require('clear');
var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');
var validFilename = require('valid-filename');

var Config = require('../lib/Config.js');
var dump = require('../lib/Dump.js').dump;
var restore = require('../lib/Restore.js').restore;
var Validate = require('../lib/Validate.js');

var config = new Config.Config();
var packageJson = require('../package.json');

function removeProfile(config) {
    var options = config.listProfiles();
    var exitOption = 'EXIT';

    options.push(new inquirer.Separator());
    options.push(exitOption);

    inquirer.prompt([{
        type: "list",
        name: "profile",
        message: "Select profile to remove:",
        choices: options
    }], function( answers ) {
        if (answers.profile === exitOption) {
            main();
        } else {
            config.removeProfile(answers.profile);
            config.save();
            main();
        }
    });    
}

var Inputs = {
    name: function NameInput(defaultName) {
        this.type = 'input';
        this.name = 'name';
        this.message = 'What do you want to call it:';
        this.validate = function(name) {
            if (!name) {
                return new Error('Profile must have a name');
            } else if (!validFilename(name)) {
                return new Error('Profile name must be a valid directory name');
            } else {
                return true;
            }
        };
        this.default = defaultName;
    },
    host: function HostInput(defaultHost) {
        this.type = 'input';
        this.name = 'host';
        this.message = 'What\'s the host:';
        this.validate = function(host) {
            try {
                Validate.host(host);
                return true;
            } catch(e) {
                return e;
            } 
        };
        this.default = defaultHost;
    },
    port: function PortInput(defaultPort) {
        this.type = 'input';
        this.name = 'port';
        this.message = 'What\'s the port:';
        this.validate = function(port) {
            try {
                Validate.port(port);
                return true;
            } catch(e) {
                return e;
            } 
        };
        this.default = defaultPort || function() { 
            return 27017; 
        };
    },
    db: function DbInput(defaultDb) {
        this.type = 'input';
        this.name = 'db';
        this.message = 'What\'s the db:';
        this.default = defaultDb;
    },
    authDb: function AuthDb(defaultAuthDb) {
        this.type = 'input';
        this.name = 'authDb';
        this.message = 'What\'s the authDb:';
        this.default = defaultAuthDb;
    }
}

function addProfile(config) {
    var questions = [
        new Inputs.name(),
        new Inputs.host(),
        new Inputs.port(),
        new Inputs.db(),
        new Inputs.authDb()
    ];

    inquirer.prompt(questions, function(answers) {
        var name = answers.name;
        var profileDir = path.join(config.backupDir(), name);
        var configObj;

        delete answers.name;
        configObj = answers;

        config.profile(name, configObj);
        config.save();
        if (!fs.existsSync(profileDir)){
            fs.mkdirSync(profileDir);
        }
        main();
    });
}

function editProfileArg(profile, profileProp) {
    inquirer.prompt([
        new Inputs[profileProp](function(){
            return profile[profileProp]();
        })
    ], function(answers) {
        profile[profileProp](answers[profileProp]);
        config.save();
        main();
    });
}

function selectProfileArg(profile) {
    var options = Object.keys(profile.raw());
    var exitOption = 'EXIT';

    options.push(new inquirer.Separator());
    options.push(exitOption);

    inquirer.prompt([{
        type: "list",
        name: "profileProp",
        message: "Select a profile arg:",
        choices: options
    }], function(answers) {
        if (answers.profileProp === exitOption) {
            main();
        } else {
            editProfileArg(profile, answers.profileProp);
        }
    });    
}

function editProfile(config) {
    var options = config.listProfiles();
    var exitOption = 'EXIT';

    options.push(new inquirer.Separator());
    options.push(exitOption);

    inquirer.prompt([{
        type: "list",
        name: "profile",
        message: "Select a profile:",
        choices: options
    }], function(answers) {
        if (answers.profile === exitOption) {
            main();
        } else {
            selectProfileArg(config.profile(answers.profile));
        }
    });
}

function printHeader() {
    var header = 'Mongo Backup - v' + packageJson.version;
    var headerLength = header.length;
    var paddingLength = 2;
    var padding = Array(paddingLength).join(' ');
    var bar = Array(headerLength + paddingLength * 2).join('-');

    console.log(bar);
    console.log(padding + header + padding);
    console.log(bar);
}

function main() {
    var selection;
    var OPTIONS = {
        EDIT: 'List/Edit profiles',
        ADD: 'Add profile',
        REMOVE: 'Remove profile',
        RESTORE: 'Restore db',
        DUMP: 'Dump db',
        EXIT: 'EXIT'
    }

    clear();
    printHeader();

    inquirer.prompt([{
        type: "list",
        name: "commands",
        message: "What do you want to do?",
        choices: [

            OPTIONS.RESTORE,
            OPTIONS.DUMP,
            new inquirer.Separator(),
            OPTIONS.EDIT,
            OPTIONS.ADD,
            OPTIONS.REMOVE,
            new inquirer.Separator(),
            OPTIONS.EXIT
        ]
    }], function( answers ) {
        switch (answers.commands) {
            case OPTIONS.LIST:
                listProfiles(config);
                break;
            case OPTIONS.ADD:
                addProfile(config);
                break;
            case OPTIONS.EDIT:
                editProfile(config);
                break;
            case OPTIONS.REMOVE:
                removeProfile(config);
                break;
            case OPTIONS.RESTORE:
                restore(config)
                .then(done)
                .catch(done);
                break;
            case OPTIONS.DUMP:
                dump(config)
                .then(done)
                .catch(done);
                break;
            case OPTIONS.EXIT:
                done();
                break;
        }
    });
}

function done() {
    console.log('\nDone!');  
}

main();