const Idea = require("../models/idea");
const User = require("../models/user");
const async = require("async");
const validator = require("express-validator");
const customUtil = require("../controller/customUtil");
const Sanitizer = require("./sanitizer")
const modelName = "idea";
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
        req.data.isOwner = req.session.account.user.ideas.find(idea => idea._id === req.params.id)
    }
    next()
}

module.exports.getPage = function (req, res, next) {
    // type: public
    Idea.findOne({ _id: req.params.id}).lean().then(doc => {
        if (doc && (doc.publish_status || req.data.isOwner)){
            res.render(`${modelName}`, {

                session: req.session,
                isOwner: req.data.isOwner,
                data: doc,
                title : `想法 - ${doc.title}`,
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
    Idea.findById(req.params.id).lean().then(idea => {
        res.render(`edit_${modelName}`, {
            session: req.session,
            data: idea,
            title : "編輯想法",
            ENUMS: global.ENUMS
        })

    }, err => customUtil.sys_msg(res, "頁面不存在或是不公開"))
}
module.exports.validateEditPage = function (req, res, next) {
    next()
}

module.exports.postEditPage = function (req, res, next) {
    updateIdea(req).then(result =>{
        res.redirect(`${base_route}${req.params.id}`)
    },err => {
        res.render(`edit_${modelName}`, {
            session: req.session,
            data: req.body,
            title : "編輯想法",
            ENUMS: global.ENUMS,
            error: err
        })
    })
}



async function updateIdea(req) {
    const ideaId = req.params.id;
    try {
        let idea = await Idea.findById(ideaId)
                             .then(idea => idea, err => { throw err })
        await idea.customUpdate(req)
    } catch (err) {
        throw err
    }
}

module.exports.validateDelete = function (req, res, next) {
    next()
}

module.exports.delete = function (req, res, next) {
    Idea.findById(req.params.id).populate("owner.user").then(idea =>{
        idea.customDelete(req).then(result =>{
            res.redirect(`/user/${req.session.account.user._id}`)
        }, err => {  customUtil.sys_msg(res, err) })

    }, err => {  customUtil.sys_msg(res, err) })
}

module.exports.getCreatePage = function (req, res, next) {
    res.render(`create_${modelName}`, {
        session: req.session,
        title: "建立新想法",
        ENUMS: global.ENUMS,
        data: null
    })
}

module.exports.validateCreate = function (req, res, next) {
    next()
}

module.exports.postCreate = function (req, res, next) {
    let newIdea = new Idea(req.body);

    newIdea.customCreate(req).then(idea =>{
        res.redirect(`${base_route}${idea._id}`);
    }, err => {
        res.render(`create_${modelName}`, {
            session: req.session,
            title: "建立新想法",
            ENUMS: global.ENUMS,
            data : req.body,
            error: err
        })
    })

}

