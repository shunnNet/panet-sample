function toArray(value) {
    let result = [];
    if (value){
        result =  Array.isArray(value) ? value : [value]
    }
    return result
}

function toBoolean(value) {
    return Boolean(value)
}
function emptyArrayToFalse(value) {
    if (Array.isArray(value)){
        value = value.length === 0 ? false : value;
    }
    return value;
}

function sanitize(body, setting) {
    let value = body[setting.field];

    let funcs = setting.funcs;
    for (const func of funcs) {
        body[setting.field] = func(value)
    }

}


module.exports.toArray = toArray;
module.exports.toBoolean = toBoolean;
module.exports.emptyArrayToFalse = emptyArrayToFalse;
module.exports.sanitize = sanitize;