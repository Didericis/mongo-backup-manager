var fs = require('fs');
var path = require('path');
var Menu = require('terminal-menu');
var exec = require('child_process').exec;

var config = require(path.join(__dirname, '..', 'config.json'));
var backupDir = config.backupDir;
var datePrefix = config.datePrefix;

module.exports = function list(callback) {
    fs.readdir(backupDir, function(err, files){
        if (!files) {
            console.log('no files');
            return;
        }

        var menu = Menu({ width: 50, x: 4, y: 2});
        menu.reset();
        menu.write('Restore Menu\n');
        menu.write('------------\n');
        var dates = files.forEach(function(fileName, i){
            menu.add(fileName.replace(datePrefix, ''));
        });
        menu.add('EXIT');

        menu.on('select', function(label) {
            var db = config.remote.db;
            var backupDir = config.backupDir;
            var port = config.local.port;
            var host = config.local.host;
            var dbToRestore = path.join(backupDir, datePrefix + label, db);

            var restoreCommand = 'mongorestore -h ' + host + ' --port ' + port + ' -d meteor ' + dbToRestore + ' --drop';

            menu.close();

            if (label === 'EXIT') {
                callback();
                return;
            } else {
                exec(restoreCommand, function(err, stdout, stderr){
                    if (err) {
                        console.log(err);
                    } else {
                        callback();
                    } 
                });
            }
        });

        process.stdin.pipe(menu.createStream()).pipe(process.stdout);
         
        process.stdin.setRawMode(true);
        menu.on('close', function () {
            process.stdin.setRawMode(false);
            process.stdin.end();
        });
    });
}
