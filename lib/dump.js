var prompt = require('prompt');
var path = require('path');
var config = require(path.join(__dirname, '..', 'config.json'));
var exec = require('child_process').exec;

module.exports = function dump(callback) {
    prompt.start();
    prompt.get({
        properties: {
            username: {
                required: true
            },
            password: {
                hidden: true,
                required: true
            }
        }
    }, function(err, result) {
        var name = config.datePrefix + (new Date()).toISOString();
        var command = 'mongodump -h ' + config.remote.host + 
                      ' -u ' + result.username + 
                      ' -p ' + result.password + 
                      ' --authenticationDatabase ' + config.remote.auth +
                      ' --db ' + config.remote.db + 
                      ' -o ' + path.join(config.backupDir, name);
        exec(command, function(err, stdout, stderr) {
            callback(err, name);
        });
    }); 
}
