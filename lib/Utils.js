exports.requireArgs = function requireArgs(funcArgs, requiredArgs) {
    var functionName = funcArgs.callee.name;
    var args = funcArgs[0];

    requiredArgs.forEach(function(requiredArg) {
        if (!args[requiredArg]) {
            throw new Error(functionName + ' requires a ' + requiredArg + ' argument');
        }
    });
}

exports.makeGetterSetter = function makeGetterSetter(obj) {
    return function _getterSetter(param) {
        if ((typeof param !== 'undefined') && (obj.get() !== param)) {
            obj.set(param);
        } else if ((obj.get() === null) && (obj.defaultVal !== null)) {
            obj.set(obj.defaultVal);
        }

        return obj.get();
    }
}