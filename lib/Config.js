var path = require('path');
var fs = require('fs');

var Profile = require('./Profile').Profile;
var makeGetterSetter = require('./Utils').makeGetterSetter;

exports.DEFAULT_CONFIG_PATH = path.join(__dirname, '..', 'config.json');
exports.DEFAULT_BACKUPS_PATH = path.join(__dirname, '..', 'backups');

exports.Config = function Config() {
    var self = this;
    var changed = false;
    var _state = {
        backupDir: null,
        datePrefix: null,
        profiles: {}
    };

    this.path = exports.DEFAULT_CONFIG_PATH;

    this.changed = function() {
        return changed;
    }

    this.listProfiles = function() {
        return Object.keys(_state.profiles)
    }

    this.removeProfile = function(profile) {
        delete _state.profiles[profile];
    }

    this.profile = function(profile, hostObj) {
        if (profile && !hostObj) {
            return _state.profiles[profile];
        } else if (profile && hostObj) {
            var _hostObj = _state.profiles[profile];
            if (_hostObj) {
                _hostObj.raw(hostObj);
            } else {
                _hostObj = new Profile(hostObj)
            }
            _state.profiles[profile] = _hostObj;
        }
    }

    this.backupDir = makeGetterSetter({
        defaultVal: path.join(__dirname, '..', 'backups'),
        get: function() {
            return _state.backupDir;
        },
        set: function(val) {
            fs.accessSync(val, fs.R_OK);
            _state.backupDir = val;
        }
    });

    this.datePrefix = makeGetterSetter({
        defaultVal: 'backup-',
        get: function() {
            return _state.datePrefix;
        },
        set: function(val) {
            _state.datePrefix = val;
        }
    });

    this.raw = function raw() {
        var configToPrint = {};

        for (var key in _state) {
            if (key === 'profiles') {
                configToPrint.profiles = {};
                for (var profile in _state.profiles) {
                    configToPrint.profiles[profile] = _state.profiles[profile].raw();
                }
            } else {
                configToPrint[key] = _state[key];
            }
        }
        return configToPrint;
    }

    this.save = function save() {
        fs.writeFileSync(self.path, JSON.stringify(self.raw(), null, 4));
        changed = false;
    };

    this.load = function load() {
        var _configFile;
        var _config;

        try {
            _configFile = fs.readFileSync(self.path, "utf8");
        } catch(e) {
            _config = _state;
        }

        if (_configFile !== undefined) {
            _config = JSON.parse(_configFile);
        }

        for (var key in _config) {
            if (key === 'profiles') {
                for (var profile in _config.profiles) {
                    self.profile(profile, _config.profiles[profile]);
                }
            } else {
                self[key](_config[key]);
            }
        }
        self.save(); //Saves any changes made on update
    }

    this.load();
}