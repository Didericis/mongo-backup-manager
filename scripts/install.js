var fs = require('fs');
var defaultBackupsPath = require('../lib/Config').DEFAULT_BACKUPS_PATH;

if (!fs.existsSync(defaultBackupsPath)){
    fs.mkdirSync(defaultBackupsPath);
}