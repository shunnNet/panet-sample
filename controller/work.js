const Work = require("../models/work");
const User = require("../models/user");
const async = require("async");
const validator = require("express-validator");
const customUtil = require("./customUtil");
const Sanitizer = require("./sanitizer")
const modelName = "work";
const base_route = `/${modelName}/`;



const form_sanitize_option = [
    {
        field : "publish_status",
        funcs : [Sanitizer.toBoolean]
    },
    {
        field : "demand",
        funcs : [Sanitizer.toArray]
    }
]

module.exports.sanitize_form = function (req,res,next) {
    for (const option of form_sanitize_option) {
        Sanitizer.sanitize(req.body, option)
    }
   next()
}
module.exports.isOwner = function (req, res, next) {
    if (req.session.login) {
        req.data.isOwner = req.session.account.user.works.find(ele => ele._id === req.params.id);
        console.log(req.session.account.user, "session status.");
    }
    next()
}

module.exports.getPage = function (req, res, next) {
    // type: public
    Work.findOne({ _id: req.params.id }).lean().then(doc => {
        if (doc && (doc.publish_status || req.data.isOwner)){
            res.render(`${modelName}`, {
                session: req.session,
                isOwner: req.data.isOwner,
                data: doc,
                title : `工作 - ${doc.title}`,
                host : global.hostname,
                ENUMS: global.ENUMS,
                originalUrl : hostname + req.originalUrl
            })
        }else{
            customUtil.sys_msg(res, "頁面不存在或是不公開")
        }
    }, err => customUtil.sys_msg(res, "頁面不存在或是不公開"))
}
module.exports.getEditPage = function (req, res, next) {
    Work.findById(req.params.id).lean().then(doc => {
        res.render(`edit_${modelName}`, {
            session: req.session,
            data: doc,
            title : "編輯工作",
            ENUMS: global.ENUMS
        })

    }, err => customUtil.sys_msg(res, "頁面不存在或是不公開"))
}
module.exports.validateEditPage = function (req, res, next) {
    next()
}

module.exports.postEditPage = function (req, res, next) {
    updateWork(req).then(result =>{
        res.redirect(`${base_route}${req.params.id}`)
    },err => {
        res.render(`edit_${modelName}`, {
            session: req.session,
            data: req.body,
            title : "編輯工作",
            ENUMS: global.ENUMS,
            error: err
        })
    })
}

async function updateWork(req) {
    const workId = req.params.id;
    try {
        let doc = await Work.findById(workId)
                            .then(doc => doc, err => { throw err })
        await doc.customUpdate(req)
    } catch (err) {
        throw err
    }
}

module.exports.validateDelete = function (req, res, next) {
    next()
}

module.exports.delete = function (req, res, next) {
    Work.findById(req.params.id).populate("owner.user").then(doc =>{
        doc.customDelete(req).then(result =>{
            res.redirect(`/user/${req.session.account.user._id}`)
        }, err => {  customUtil.sys_msg(res, err) })

    }, err => {  customUtil.sys_msg(res, err) })
}

module.exports.getCreatePage = function (req, res, next) {
    res.render(`create_${modelName}`, {
        session: req.session,
        title: "建立新工作",
        ENUMS: global.ENUMS,
        data : null
    })
}


module.exports.validateCreate = function (req, res, next) {
    next()
}

module.exports.postCreate = function (req, res, next) {
    let newDoc = new Work(req.body);

    newDoc.customCreate(req).then(doc =>{
        res.redirect(`${base_route}${doc._id}`);
    }, err => {
        res.render(`create_${modelName}`, {
            session: req.session,
            title: "建立新工作",
            ENUMS: global.ENUMS,
            data : req.body,
            error: err
        })
    })

}

