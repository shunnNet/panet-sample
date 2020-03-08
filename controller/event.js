const Event = require("../models/event");
const User = require("../models/user");
const async = require("async");
const validator = require("express-validator");
const customUtil = require("../controller/customUtil");
const fs = require("fs");

const Sanitizer = require("./sanitizer")

const modelName = "event";
const base_route = `/${modelName}/`;


const form_sanitize_option = [{
    field : "publish_status",
    funcs : [Sanitizer.toBoolean]
}]

module.exports.sanitize_form = function (req,res,next) {
    
    for (const option of form_sanitize_option) {
        Sanitizer.sanitize(req.body, option)

    }
    
   next()
}

module.exports.isOwner = function (req, res, next) {
    if (req.session.login) {
        req.data.isOwner = req.session.account.user.events.find(event => event._id === req.params.id)
      
    }
    next()
}

module.exports.getPage = function (req, res, next) {
    // type: public
    Event.findOne({ _id: req.params.id}).populate("owner.user").then(doc => {
        if (doc && (doc.publish_status || req.data.isOwner)){
            res.render(`${modelName}`, {
                session: req.session,
                isOwner: req.data.isOwner,
                data: doc,
                title : `活動 - ${doc.title}`,
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
    Event.findById(req.params.id).lean().then(doc => {
        res.render(`edit_${modelName}`, {
            session: req.session,
            data: doc,
            title : "編輯活動",
            ENUMS: global.ENUMS
        })

    }, err => customUtil.sys_msg(res, "頁面不存在或是不公開"))
}
module.exports.validateEditPage = function (req, res, next) {
    next()
}

module.exports.postEditPage = function (req, res, next) {
    
    updateEvent(req).then(result => {
        res.redirect(`${base_route}${req.params.id}`)
    }, err => {
        res.render(`edit_${modelName}`, {
            session: req.session,
            data: req.body,
            title : "編輯活動",
            ENUMS: global.ENUMS,
            error: err
        })
    })
}

async function updateEvent(req) {
    const eventId = req.params.id;//req.params.id
    try {
        let event = await Event.findOne({ _id: eventId })
                               .then(event => event, err => { throw err })
        await event.customUpdate(req)
    } catch (err) {
        throw err
    }
}

module.exports.validateDelete = function (req, res, next) {
    next()
}

module.exports.delete = function (req, res, next) {
    Event.findOne({ _id: req.params.id }).populate("owner.user").then(event => {
        event.customDelete(req).then(result =>{
            res.redirect(`/user/${req.session.account.user._id}`) // FIX ME : to all media page
        },err =>{
            console.log("error occured")
            customUtil.sys_msg(res, err)
        })

    }, err => {  customUtil.sys_msg(res, err) })
}

module.exports.getCreatePage = function (req, res, next) {
    res.render(`create_${modelName}`, {
        session: req.session,
        title: "建立新活動",
        ENUMS: global.ENUMS,
        data : null
    })
}

module.exports.validateCreate = function (req, res, next) {
    next()
}

module.exports.postCreate = function (req, res, next) {
    let newEvent = new Event(req.body)

    newEvent.customCreate(req).then(event => {
        res.redirect(`${base_route}${event._id}`)
    }, err => {
        res.render(`create_${modelName}`, {
            session: req.session,
            title: "建立新活動",
            ENUMS: global.ENUMS,
            data : req.body,
            error: err
        })
    })
}



