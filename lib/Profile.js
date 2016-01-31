var Validate = require('./Validate.js');
var makeGetterSetter = require('./Utils').makeGetterSetter;

exports.Profile = function Profile(state) {
    var self = this;
    var _state = {
        host: null,
        port: null,
        db: null,
        authDb: null
    };

    this.host = makeGetterSetter({
        get: function() {
            return _state.host;
        },
        set: function(val) {
            Validate.host(val);
            _state.host = val;
        }
    });

    this.port = makeGetterSetter({
        get: function() {
            return _state.port;
        },
        set: function(val) {
            Validate.port(val);
            _state.port = val;
        }
    });

    this.db = makeGetterSetter({
        get: function() {
            return _state.db;
        },
        set: function(val) {
            _state.db = val;
        }
    });

    this.authDb = makeGetterSetter({
        get: function() {
            return _state.authDb;
        },
        set: function(val) {
            _state.authDb = val;
        }
    });

    this.raw = makeGetterSetter({
        get: function() {
            return _state;
        },
        set: function(state) {
            var keys = Object.keys(state);
            keys.forEach(function(key) {
                self[key](state[key]);
            });
        }
    });

    if (state) {
        this.raw(state);
    }
}