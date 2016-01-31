var validator = require('validator');

exports.host = function host(host) {
    if (!validator.isURL(host)) {
        throw new Error('local host must be set to a valid url');
    }
};

exports.port = function port(port) {
    if (!validator.isInt(port) || (port < 0)) {
        throw new Error('local port must be an integer greater than 0')
    }
};