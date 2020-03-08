const validator = require("express-validator");
const fs = require("fs")
const { promisfy } = require("promisfy")
const unlink = promisfy(fs.unlink)

module.exports.unlink = unlink;

module.exports.re

module.exports.returnIfFormError = function (req, page, next) {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())

        let accountData = req.session.login ? req.session.account : { name: "anonymous" };

        res.render(page.name, {
            session: req.session,
            title: page.title,
            errors: errors.array(),
            login: req.session.login,
            account: accountData,
            ENUMS: global.ENUMS
        })

    } else {
        next()
    }
}

module.exports.redirectIfNotLogin = function (req, res, next) {
    if (req.session.login) {
        next()
    } else {
        res.redirect("/account/login");
    }
}


module.exports.redirectIfNotOwner = function (req, res, next) {
    if (req.data.isOwner) {
        next()
    } else {
        res.render("sys_msg", 
            { 
                msg: "您沒有權限編輯此頁面" ,
                ENUMS: global.ENUMS
            }
            )
    }
}


module.exports.urlSanitizer = function (req, res, next) {
    console.log("url sanitization.")
    next()
}

module.exports.loginStatus = function (req, res, next) {
    if (req.session) {

        if (req.session.account) {
            req.session.login = true;
        } else {
            req.session.login = false;
        }
    }
    next();
}

module.exports.addDataObj = function (req, res, next) {
    req.data = {};
    next();
}

module.exports.sys_msg = function (res, message) {
    res.render("sys_msg", 
        { 
            msg: message ,
            ENUMS: global.ENUMS
        
        })
}

module.exports.handleValidatorError = function (validatorError) {
    let result = [];
    const errors = validatorError.errors
    for (const field in errors) {
        const ele = errors[field];
        result.push([field, ele.message])
    }
    return result
}

module.exports.copyFile = function (from, dest) {
    return new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(dest);
        ws.on('finish', () => resolve(dest))
            .on('error', err => reject({ errors: { cover: { message: "存檔失敗" } } })) // FIX: error when piping or writing. will not end the stream
        fs.createReadStream(from)
            .pipe(ws)
    })
}

module.exports.acceptUploadType = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png"
}

module.exports.fieldSetting = {
    "cover": {
        modelPath: "cover_image",
        defaultFileType: "jpg",
        defaultFileName: "default.jpg",
        mimeTypeReg: new RegExp(/image\/(.+)/) // FIX : how to use it ?.....
    },
    "medias": {
        modelPath: "media_route",
        defaultFileName: undefined,
        mimeTypeReg: new RegExp(/image\/(.+)/) // FIX : what type will it be ?
    }
}


module.exports.returnReoutePath = function (field, modelName) {
    return {
        dirRoute: `/static/${field}/${modelName}`,
        dirPath: `./public/${field}/${modelName}`
    }
}
module.exports.handleUpload = function (req, upload, doc, modelName) {
    const field = upload.fieldname;
    const { dirRoute, dirPath } = this.returnReoutePath(field, modelName);

    const fileType = this.acceptUploadType[upload.mimetype] // FIX : if undefined
    
    const file_name = `${doc._id}.${fileType}`;
    const file_path = `${dirPath}/${file_name}`;
    const file_route = `${dirRoute}/${file_name}`;
    return {
        path: `${dirPath}/${file_name}`,
        route: `${dirRoute}/${file_name}`,
        temp_path: `./${upload.path}`,
        mimetype: upload.mimetype,
        fileType
    }
};
module.exports.useDefault = function (req, field, doc, modelName) {
    const { defaultFileName, defaultFileType } = this.fieldSetting[field]
    if (defaultFileName) {
        const dirRoute = `/static/${field}/${modelName}`;
        const dirPath = `./public/${field}/${modelName}`;
        const file_name = `${doc._id}.${defaultFileType}`;

        return {
            path: `${dirPath}/${file_name}`,
            route: `${dirRoute}/${file_name}`,
            temp_path: `${dirPath}/${defaultFileName}`,
            mimetype: "image/jpeg",
            fileType: "jpg"
        }
    } else {
        return false;
    }
}

module.exports.transTimeformat = function (timestring) {
    var time = timestring === undefined ? new Date() : new Date(timestring)

    if (String(time) === "Invalid Date") {
        return false
    }

    var y = String(time.getFullYear())
    var m = String(time.getMonth() + 1)
    var d = String(time.getDate())

    time = y + '/' + m + '/' + d

    return time
}








