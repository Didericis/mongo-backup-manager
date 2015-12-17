var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var config = require('./config.json');
var db = config.db;
var dbDir = config.dbDir;
var datePrefix = config.datePrefix;
var port = config.port;
var host = config.host;

fs.readdir(dbDir, function(err, files){
    var dates = files.map(function(fileName, i){
        return fileName.replace(datePrefix, '');
    });
    var mostRecentDate = dates.sort(function(a, b){
        return (new Date(b) - new Date(a));
    })[0];
    var mostRecentFile = datePrefix + mostRecentDate;
    restoreRecent(mostRecentFile);
});

function restoreRecent(mostRecentFile){
    var mostRecentDump = path.join(dbDir, mostRecentFile, db);
    var restoreCommand = 'mongorestore -h ' + host + ' --port ' + port + ' -d meteor ' + mostRecentDump + ' --drop';
    exec(restoreCommand, function(err, stdout, stderr){
       if (err) {
          console.log(err);
       } 
    });
}
