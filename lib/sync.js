var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var dump = require('./dump');

var config = require(path.join(__dirname, '..', 'config.json'));
var db = config.remote.db;
var backupDir = config.backupDir;
var datePrefix = config.datePrefix;
var port = config.local.port;
var host = config.local.host;

var restoreRecent = function restoreRecent(mostRecentFile, callback){
    var mostRecentDump = path.join(backupDir, mostRecentFile, db);
    var restoreCommand = 'mongorestore -h ' + host + ' --port ' + port + ' -d meteor ' + mostRecentDump + ' --drop';
    exec(restoreCommand, function(err, stdout, stderr){
        if (err) {
            console.log(err);
        } else {
            callback();
        } 
    });
}

module.exports = function(callback) {
    dump(function(err, mostRecentFile) {
        if (err) {
            console.log(err);
        } else {
            restoreRecent(mostRecentFile, callback);
        }
    });
}
