const mongoose = require("mongoose");
const async = require("async");
const validator = require("express-validator");
const customUtil = require("../controller/customUtil");
const Idea = require("../models/idea");
const User = require("../models/user");
const Event = require("../models/event");
const Media = require("../models/media");
const Work = require("../models/work");
const Sanitizer = require("../controller/sanitizer");


const Model = {
    user: User,
    idea: Idea,
    event: Event,
    media: Media,
    work: Work
}


const q_func_accessor = {
    "q_showHaventEnd": q_showHaventEnd,
    "q_showHaveMedia": q_showHaveMedia
}

function q_showHaveMedia() {
    return {
        "medias.0": { $exists: true }
    }
}

function q_showHaventEnd() {
    return {
        end_time: { $gt: new Date() }
    }
}

const modelQuerySetting = {
    event: {
        components: ["event-card","event-card__info"],
        or: ["title", "desc_literal"],
        and: [{
            db_field: "location",
            form_field: "location",
            query: isEqual
        },
        {
            db_field: "type",
            form_field: "type",
            query: isIn
        },
        {
            db_field: "start_time",
            form_field: "start_time",
            query: gte_date
        },
        {
            db_field: "end_time",
            form_field: "end_time",
            query: lte_date
        }],
        spec: ["q_showHaventEnd"],
        sort: [// less to more
            {
                form_field: "sort_start_time",
                sort: generSort("start_time")
            }
        ], 
        sanitizer :[{
            field: "q_showHaventEnd",
            funcs : [Sanitizer.toBoolean]
        }]
    },
    work: {
        components: ["work-card","work-card__info"],
        or: ["title", "desc_literal"],
        and: [{
            db_field: "location",
            form_field: "location",
            query: isEqual
        },
        {
            db_field: "demand.name",
            form_field: "demand",
            query: isIn
        },
        {
            db_field: "start_time",
            form_field: "start_time",
            query: gte_date
        },
        {
            db_field: "end_time",
            form_field: "end_time",
            query: lte_date
        }],// add date
        spec: ["q_showHaventEnd"],
        sort: [
            {
                form_field: "sort_start_time",
                sort: generSort("start_time")
            }
        ],// less to more
        sanitizer :[
            {
                field: "demand",
                funcs : [Sanitizer.toArray,
                         Sanitizer.emptyArrayToFalse]
            },
            {
                field: "q_showHaventEnd",
                funcs : [Sanitizer.toBoolean]
            }
        ]
    },
    idea: {
        components: ["idea-card","idea-card__info"],
        or: ["title", "desc_literal"],
        and: [
            {
                db_field: "demand.name",
                form_field: "demand",
                query: isIn
            },
            {
                db_field: "type",
                form_field: "type",
                query: isIn
            }
        ],
        spec: [],
        sort: [],
        sanitizer :[
            {
                field: "demand",
                funcs : [Sanitizer.toArray,
                         Sanitizer.emptyArrayToFalse]
            }
        ]
    },
    user: {
        components: ["user-card","user-card__info"],
        or: ["skill","desc_literal", "concerned_topic", "hobits"], // q string effect with array ?
        and: [
            {
                db_field     : "area",
                form_field: "area",
                query     : isEqual
            },
            {
                db_field     : "skill",
                form_field: "skill",
                query     : isIn
            }
        ],
        spec: ["q_showHaveMedia"],
        sort: [],
        sanitizer :[
            {
                field: "skill",
                funcs : [Sanitizer.toArray,
                         Sanitizer.emptyArrayToFalse]
            },
            {
                field: "q_showHaveMedia",
                funcs : [Sanitizer.toBoolean]
            }
        ]
    },
    media: {
        components: ["media-card","media-card__info"],
        or: ["title", "desc_literal"], // q string effect with array ?
        and: [
            {
                db_field: "type",
                form_field: "type",
                query: isIn
            }
        ],
        spec: [],
        sort: [],
        sanitizer:[]
    }
}

function sortGenerator(modelName, req) {
    const sortObjs = modelQuerySetting[modelName].sort;
    let result = {}
    for (const sortObj of sortObjs) {
        const direction =  Number(Boolean(req.query[sortObj.form_field]));
        result = sortObj.sort(direction)
    }
    return result
    //FIX : SORT need to return multiple Query.prototype.sort()
    //so , although it is array now, need modify in future.
    //return sortObj
}

function andSpecQueryGenerator(modelName, req) {
    const params = modelQuerySetting[modelName].spec;
    let result = [];
    params.forEach(param => {
        if (req.query[param]) {
            let func = q_func_accessor[param];
            result.push(func())
        }
    })
    return result;
}

function andQueryGenerator(modelName, req) {
    const andQueryInfos = modelQuerySetting[modelName].and;
    let result = [];
    andQueryInfos.forEach(queryInfo => {
        
        
        let value = req.query[queryInfo.form_field]
        console.log(value);
        if (value) {
            result.push({ [queryInfo.db_field]: queryInfo.query(value) })
        }
    })
    return result;
}

function orQueryGenerator(modelName, queryString) {
    let queryFields = modelQuerySetting[modelName].or;
    let result = [];
    if (queryString) {
        queryFields.forEach(field => {
            result.push({ [field]: { $regex: queryString, $options: "im" } })
            // FIX : is there any better idea not use regex ? 
        });
    }
    return result
}

module.exports.getQuery = function (req, res, next) {
    const docPerPage = 15;
    const queryString = req.query.qs;
    const modelName = req.query.field;
    const model = Model[modelName];
    const queryObj = {
        $or: orQueryGenerator(modelName, queryString),
        $and: [...andQueryGenerator(modelName, req),
        ...andSpecQueryGenerator(modelName, req)],
    }
    if (queryObj.$or.length === 0) { delete queryObj.$or }
    if (queryObj.$and.length === 0) { delete queryObj.$and }

    const sortObj = sortGenerator(modelName, req)
    
    let data = {
        body: req.query ? req.query : {},
        originalUrl: global.hostname + req.originalUrl,
        component: modelQuerySetting[modelName].components,
        result : []
    }
    console.log(queryObj,"queryObj");
    
    if (!req.xhr) {
        model.find(queryObj)
            .populate("owner.user","cover_image") // FIX : when user, may crash for not exist field.
            .sort(sortObj)
            .limit(docPerPage)
            .then(result => {
                extractDescSection(result,req.query.qs) // FIX
                data.result = result ? result : [];
                res.render('query', {
                    session: req.session,
                    title: "查詢",
                    field: modelName,
                    data,
                    ENUMS: global.ENUMS
                })
            }, err => {
                res.render('query', {
                    session: req.session,
                    title: "查詢",
                    field: modelName,
                    data,
                    ENUMS: global.ENUMS
                })
            })
    } else {
        let page = parseInt(req.query.page);
        const skip = (page - 1) * docPerPage;
        model.find(queryObj).populate("owner.user","cover_image").sort(sortObj).skip(skip).limit(docPerPage).then(result => {
            extractDescSection(result,req.query.qs) // FIX
            res.json(result)
        }, err => {
            res.json([])
        })
    }
}

function extractDescSection(docs,qs){
    // FIX : please use right way to extract substr of description.
    const desc_extract_offset = 10;
    for (const doc of docs) {
        if (!doc.desc_literal){ continue }
        var index = 0;
        if (qs){
            index = doc.desc_literal.indexOf(qs)
            index = index === -1 ? 0 : index - desc_extract_offset;
            index = index < 0 ? 0 : index;
        }
        
        
        var before = index == 0 ? "" : "...";
        var after  = doc.desc_literal.length <= index + 100 ? "" : "...";

        doc.desc_literal = `${before}${doc.desc_literal.substr(index,100)}${after}`
    }
}

module.exports.sanitize = function (req, res, next) {
    const modelName = req.query.field;
    const sanitizers = modelQuerySetting[modelName].sanitizer

    for (const sanitizerSetting of sanitizers) {
        Sanitizer.sanitize(req.query,sanitizerSetting)
    }
    next()
}

module.exports.getIndexPage = function (req, res, next) {
    getIndexInfo().then(result => {
        
        res.render('index',
            {
                title: "首頁",
                session: req.session,
                data: result,
                ENUMS: global.ENUMS,
                originalUrl : hostname + req.originalUrl
            }
        )
    }, err => customUtil.sys_msg(res, err))
}
module.exports.getCatagoriesPage = function (req, res, next) {
    getIndexInfo().then(result => {

        res.render('catagories',
            {
                title: "所有分類",
                session: req.session,
                ENUMS: global.ENUMS,
                host : global.hostname
            }
        )
    }, err => customUtil.sys_msg(res, err))
}


async function getIndexInfo() {
    try {
        let events = await Event.find({}).limit(5).then(docs => {
            return docs
        })
        let works = await Work.find({}).limit(5).then(docs => {
            return docs
        })
        let ideas = await Idea.find({}).limit(5).then(docs => {
            return docs
        })
        let medias = await Media.find({}).limit(5).then(docs => {
            return docs
        })

        return { events, works , ideas, medias}
    } catch (error) {
        throw error
    }
}

function gte_date(value) {
    return { $gte: new Date(value) }
}
function lte_date(value) {
    return { $lte: new Date(value) }
}

function gt(value) {
    return { $gt: value }
}
function lt(value) {
    return { $lt: value }
}

function gte(value) {
    return { $gte: value }
}
function lte(value) {
    return { $lte: value }
}

function isIn(value) {
    return { $in: value }
}

function isEqual(value) {
    return value
}

function generSort(field){
    return function(order=1){
        return { [field]: order }
    }
}

function sanitizeToArray(value){
    return Array.isArray(value) ? value : [value]
}

function sanitizeToBool(value){
    return Boolean(value)
}

// MAKE ME BE GOOD!!
function sanitizeProcess(req){
    const modelName = req.query.field;
    const sanitizers = modelQuerySetting[modelName].sanitizer

    for (const sanitizer of sanitizers) {
        sanitizeField(req,sanitizer)
    }
}

function sanitizeField(req,sanitizer) {
    let value = req.query[sanitizer.field]
    if (value){
        let funcs = sanitizer.funcs
        for (const func of funcs) {
            req.query[sanitizer.field] = func(value)
        }
    }
}

