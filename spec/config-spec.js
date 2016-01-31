var Config = require('../lib/Config.js');
var fs = require('fs');
var path = require('path');

describe("Config.update", function () {
    var config;
    var configOnDisk;
    var oldConfig;
    var backupDir = path.join(__dirname, 'support', 'backups');
    var originalDefaultPath = Config.DEFAULT_PATH;

    beforeEach(function() {
        oldConfig = {
            "backupDir": backupDir,
            "datePrefix": "sample-prefix",
            "profiles": {
                "local": {
                    "host": "127.0.0.1",
                    "port": "3001"
                },
                "remote": {
                    "host": "text.com",
                    "port": "27017",
                    "db": "superDb",
                    "authDb": "autDb"
                }
            }
        };
        Config.DEFAULT_PATH = path.join(__dirname, 'Config.json');
        fs.writeFileSync(Config.DEFAULT_PATH, JSON.stringify(oldConfig, null, 4));
        fs.mkdirSync(backupDir);

        config = new Config.Config();
        configOnDisk = require(Config.DEFAULT_PATH);
    });

    afterEach(function() {
        fs.unlinkSync(Config.DEFAULT_PATH);
        fs.rmdirSync(backupDir);
        Config.DEFAULT_PATH = originalDefaultPath;
    });

    it("should load from config.json on instantiation", function() {
        spyOn(fs, 'readFileSync');

        config = new Config.Config();

        expect(fs.readFileSync).toHaveBeenCalledWith(Config.DEFAULT_PATH, 'utf8');
    });

    it("should have the same backupDir as file after instantiation", function() {
        expect(config.backupDir()).toEqual(oldConfig.backupDir);

        expect(configOnDisk.backupDir).toEqual(oldConfig.backupDir);
    });

    it("should thow an error if a bad backup dir is set", function() {
        expect(function() {
            config.backupDir('/this/dir/is/extremely/unprobable');
        }).toThrow();

        expect(function() {
            config.backupDir(123);
        }).toThrow();
    });

    it("should accept a valid backup dir", function() {
        expect(function() {
            config.backupDir(__dirname);
        }).not.toThrow();
    });

    it("should not be able to set a null/undefined backup dir", function() {
        expect(function() {
            config.backupDir(null);
        }).toThrow();

        expect(function() {
            config.backupDir(undefined);
        }).toThrow;
    });

    it("should have the same datePrefix as file after instantiation", function() {
        expect(config.datePrefix()).toEqual(oldConfig.datePrefix);

        expect(configOnDisk.datePrefix).toEqual(oldConfig.datePrefix);
    });

    it("should be able to set a null/undefined date prefix", function() {
        expect(function() {
            config.datePrefix(null);
        }).not.toThrow();

        expect(function() {
            config.datePrefix(undefined);
        }).not.toThrow();
    });

    it("should have the same local host as file after instantiation", function() {
        expect(config.profile('local').host()).toEqual(oldConfig.profiles.local.host);

        expect(configOnDisk.profiles.local.host).toEqual(oldConfig.profiles.local.host);
    });

    it("should throw an error if a bad local host is set", function() {
        expect(function() {
            config.profile('local').host('thisisnotahost')
        }).toThrow();

        expect(function() {
            config.profile('local').host(1234.1234)
        }).toThrow();
    });

    it("should accept a valid local host", function() {
        var host = '127.0.0.1';

        expect(function() {
            config.profile('local').host(host);
        }).not.toThrow();

        expect(config.profile('local').host()).toBe(host);
    });

    it("should not be able to have a null/undefined local host", function() {
        expect(function(){
            config.profile('local').host(null);
        }).toThrow();
    });

    it("should have the same local port as file after instantiation", function() {
        expect(config.profile('local').port()).toEqual(oldConfig.profiles.local.port);

        expect(configOnDisk.profiles.local.port).toEqual(oldConfig.profiles.local.port);
    });

    it("should throw an error if a bad local port is set", function() {
        expect(function() {
            config.profile('local').port('10abc');
        }).toThrow();

        expect(function() {
            config.profile('local').port(-10);
        }).toThrow();
    });

    it("should accept a valid local port number", function() {
        var validPort = 27017;

        expect(function() {
            config.profile('local').port(validPort);
        }).not.toThrow();

        expect(function() {
            config.profile('local').port(validPort.toString());
        }).not.toThrow();

        expect(config.profile('local').port()).toEqual(validPort.toString());
    });

    it("should have the same remote host as file after instantiation", function() {
        expect(config.profile('remote').host()).toEqual(oldConfig.profiles.remote.host);

        expect(configOnDisk.profiles.remote.host).toEqual(oldConfig.profiles.remote.host);
    });

    it("should have the same remote db as file after instantiation", function() {
        expect(config.profile('remote').db()).toEqual(oldConfig.profiles.remote.db);

        expect(configOnDisk.profiles.remote.db).toEqual(oldConfig.profiles.remote.db);
    });

    it("should have updated and moved the auth db into a new file after instantiation", function() {
        expect(config.profile('remote').authDb()).toEqual(oldConfig.profiles.remote.authDb);

        expect(configOnDisk.profiles.remote.authDb).toEqual(oldConfig.profiles.remote.authDb);
    });
});