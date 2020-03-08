const Media = require("../models/media");
const User = require("../models/user");
const async = require("async");
const validator = require("express-validator");
const customUtil = require("../controller/customUtil");
const Sanitizer = require("./sanitizer")
const modelName = "media";
const base_route = `/${modelName}/`;

const form_sanitize_option = [
    {
        field : "publish_status",
        funcs : [Sanitizer.toBoolean]
    }
]

module.exports.sanitize_form = function (req,res,next) {
    for (const option of form_sanitize_option) {
        Sanitizer.sanitize(req.body, option)
    }
    next()
}

module.exports.isOwner = function (req,res,next) {
    if (req.session.login){
        req.data.isOwner = req.session.account.user.medias.find(media => media._id === req.params.id)
        console.log(req.session.account.user, "session status.");
        console.log(req.data.isOwner,"isOwner");
    } 
    next()
}

module.exports.getPage = function (req,res,next) { 
    // type: public
    Media.findOne({_id : req.params.id}).then(doc => {
        console.log((doc.publish_status || req.data.isOwner));
        
        if (doc && (doc.publish_status || req.data.isOwner)){
            res.render(`${modelName}`, {
                session: req.session,
                isOwner: req.data.isOwner,
                data: doc,
                title : `影音 - ${doc.title}`,
                host : global.hostname,
                ENUMS: global.ENUMS,
                originalUrl : hostname + req.originalUrl
            })
        }else{
            customUtil.sys_msg(res, "頁面不存在或是不公開")
        }
    }, err => customUtil.sys_msg(res, "頁面不存在或是不公開"))
}

module.exports.getEditPage = function (req,res,next) { 
    Media.findById(req.params.id).lean().then(doc => {
        res.render(`edit_${modelName}`, {
            session: req.session,
            data: doc,
            title : "編輯影音",
            ENUMS: global.ENUMS
        })
    }, err => customUtil.sys_msg(res, "頁面不存在或是不公開"))
}
module.exports.validateEditPage = function (req,res,next) { 
    next()
}
module.exports.postEditPage = function (req,res,next) { 
    updateMedia(req).then(result =>{
        res.redirect(`${base_route}${req.params.id}`)
    },err => {
       
        
        res.render(`edit_${modelName}`, {
            session: req.session,
            data: req.body,
            title : "編輯影音",
            ENUMS: global.ENUMS,
            error: err
        })
    })
}

async function updateMedia(req) {
    const mediaId = req.params.id;
    try {
        let media = await Media.findById(mediaId)
                               .then(doc => doc, err => { throw err })
        await media.customUpdate(req)
    } catch (err) {
        throw err
    }
}

module.exports.validateDelete = function (req,res,next) { 
    next()
}

module.exports.delete = function (req,res,next) { 
    Media.findById(req.params.id).populate("owner.user").then(doc =>{
        doc.customDelete(req).then(result =>{
            res.redirect(`/user/${req.session.account.user._id}`)
        }, err => {  customUtil.sys_msg(res, err) })

    }, err => {  customUtil.sys_msg(res, err) })
}


module.exports.postCreate = function (req,res,next) {
    let newMedia = new Media(req.body);

    newMedia.customCreate(req).then(doc =>{
        res.redirect(`${base_route}${doc._id}`);
    }, err => {
        console.log(req.body);
        res.render(`create_${modelName}`, {
            session: req.session,
            title: "建立新影音",
            ENUMS: global.ENUMS,
            data : req.body,
            error: err
        })
    })
}




module.exports.validateCreate = function (req,res,next) { 
    next()
}

module.exports.getCreatePage = function (req, res, next) {
    res.render(`create_${modelName}`, {
        session: req.session,
        title: "建立新影音",
        ENUMS: global.ENUMS,
        data : null
    })
}
