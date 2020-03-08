const User = require("../models/user");
const Account = require("../models/account");
const async = require("async");
const validator = require("express-validator");
const FB = require("../controller/FB")
const customUtil = require("../controller/customUtil")
const Sanitizer = require("./sanitizer")
const modelName = "user";
const base_route = `/${modelName}/`;


const form_sanitize_option = [
    {
        field : "publish_status",
        funcs : [Sanitizer.toBoolean]
    },
    {
        field : "show_email",
        funcs : [Sanitizer.toBoolean]
    },
    {
        field : "demand",
        funcs : [Sanitizer.toArray]
    },
    {
        field : "skill",
        funcs : [Sanitizer.toArray]
    },
    {
        field : "habits",
        funcs : [Sanitizer.toArray]
    },
    {
        field : "area",
        funcs : [Sanitizer.toArray]
    },
    {
        field : "concerned_topic",
        funcs : [Sanitizer.toArray]
    },
    {
        field : "experience",
        funcs : [Sanitizer.toArray]
    },
    {
        field : "want_to_try",
        funcs : [Sanitizer.toArray]
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
        req.data.isOwner = req.session.account.user._id === req.params.id
    } 
    next()
}

module.exports.getPage = function (req,res,next) { 
    User.findById(req.params.id).lean().then(doc => {
        if (doc && (doc.publish_status || req.data.isOwner) ){
            res.render(`${modelName}`, {
                session: req.session,
                isOwner: req.data.isOwner,
                data: doc,
                title : doc.name,
                ENUMS: global.ENUMS,
                originalUrl : hostname + req.originalUrl,
                block_collection:[
                    {
                        name:"個人資訊",
                        sub_desc: '',
                        value: "info"
                    },
                    {
                        name:"影音",
                        sub_desc: `(${doc.medias.length})`,
                        value: "medias"
                    },
                    {
                        name:"活動",
                        sub_desc: `(${doc.events.length})`,
                        value: "events"
                    },
                    {
                        name:"工作",
                        sub_desc: `(${doc.works.length})`,
                        value: "works"
                    },
                    {
                        name:"想法",
                        sub_desc: `(${doc.ideas.length})`,
                        value: "ideas"
                    },
                ]
            })
        }else{
            customUtil.sys_msg(res, "頁面不存在或是不公開");
        }
    }, err => customUtil.sys_msg(res, "頁面不存在或是不公開"))
}
module.exports.getEditPage = function (req,res,next) { 
    // find all data and 

    User.findById(req.session.account.user._id).lean().then(doc => {
        if (doc){
            res.render(`edit_${modelName}`, {
                session: req.session,
                data: doc,
                title : "編輯使用者",
                ENUMS: global.ENUMS
            })
        }else{
            customUtil.sys_msg(res, "頁面不存在");
        }
    }, err => customUtil.sys_msg(res, "發生未知的錯誤"))
}
module.exports.validateEditPage = function (req,res,next) { 
    next()
}
module.exports.postEditPage = function (req,res,next) { 
    updateUser(req).then(result =>{
        res.redirect(`${base_route}${req.session.account.user._id}`)
    },err => {
        User.findById(req.session.account.user._id).lean().then(doc => {
            if (doc){
                let data = {
                    ...doc,
                    ...req.body
                }
                res.render(`edit_${modelName}`, {
                    session: req.session,
                    data: data,
                    title : "編輯使用者",
                    ENUMS: global.ENUMS,
                    error: err
                })
            }else{
                customUtil.sys_msg(res, "頁面不存在");
            }
        }, err => customUtil.sys_msg(res, "發生未知的錯誤"))
    })
}


async function updateUser(req) {
    const docId = req.session.account.user._id;
    try {
        let doc = await User.findById(docId)
                             .then(doc => doc, err => { throw err })
        await doc.customUpdate(req)
    } catch (err) {
        throw err
    }
}