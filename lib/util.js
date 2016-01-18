var path = require('path');
var fs = require('fs');

var configPath = path.join(__dirname, '..', 'config.json');

module.exports.saveConfig = function save(json) {
    fs.writeFileSync(configPath, JSON.stringify(json, null, 4));
}

module.exports.getConfig = function getConfig() {
    var save = false;
    var configJson = require(configPath) || {};
    var defaultConfig = {
        backupDir: '~/meteorMongoDump',
        datePrefix: 'backup-',
        local: {
            host: '127.0.0.1',
            port: '3001'
        },
        remote: {
            host: null,
            port: null,
            auth: null,
            db: null
        }
    }

    for (var key in defaultConfig) {
        if (!configJson[key]) {
            configJson[key] = defaultConfig[key];
            save = true;
        }
    }

    if (save) {
        module.exports.saveConfig(configJson);
    }

    return configJson;
}
