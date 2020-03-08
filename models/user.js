const mongoose = require("mongoose")
const customUtil = require("../controller/customUtil");
const modelName = "users";
const cover_dir = `./public/cover/${modelName}`;
const cover_dir_route = `/static/cover/${modelName}`;
const default_cover_path = `${cover_dir}/default.jpg`;
const Idea = require("../models/idea");
const Event = require("../models/event");
const Media = require("../models/media");
const Work = require("../models/work");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, // add Setter always trim value.
        minlength: 1,
        maxlength: 15
    },
    email: {
        type: String,
        //required: true,
        trim: true // add Setter always trim value.
    },
    sex: { // new , haven't process it
        type: String,
        //required: true,
        validate: function (value) { return global.ENUMS.SEX.includes(value) }
    },
    birthday: { // new , haven't process it
        type: Date,
        //required: true
    },
    page_url: { type: String },
    skill: [
        {
            type:String,
            validate: function (value) { return global.ENUMS.SKILLS.includes(value)}
        }
    ],
    habits: [String], // FIX : is HABITS
    cover_image: String,
    cover_image_offset_y: String,
    area: [
        {
            type:String,
            validate: function (value) { return global.ENUMS.CITY.includes(value)}
        }
    ],
    concerned_topic: [String],
    experience: [{ type: String, minlength: 1, maxlength: 50 }],
    now_job: { type: String, minlength: 0, maxlength: 50 }, // new , haven't process it
    want_to_try: [{ type: String, minlength: 1, maxlength: 30 }],
    description: String,
    desc_literal: String, // new , haven't process it
    fb_pages: String,
    show_email: Boolean,
    publish_status: Boolean,
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
    medias: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId},
            title: String,
            media_route: String,
            cover_image: String
        }
    ],
    ideas: [{ _id: { type:mongoose.Schema.Types.ObjectId , ref : "idea" }, title: String }],
    works: [{ _id: { type:mongoose.Schema.Types.ObjectId , ref : "work" }, title: String }],
    events: [{ _id:{ type: mongoose.Schema.Types.ObjectId , ref : "event"}, title: String }]
})

userSchema.methods.modifySubDoc = function (path, doc) {
    let subDocs = this[path]
    subDocs.id(doc._id).set(doc)
   
    return this
}

userSchema.methods.customUpdate = async function (req) {
    let update = req.body;
    const upload = req.file;
    let fileInfo ;

    try {
        if (upload) {
            fileInfo = customUtil.handleUpload(req,req.file,this,modelName);
            if (!fileInfo.fileType){
                throw new Error("不接受的檔案格式")
            }
            update.cover_image = fileInfo.route;
        }
        const nameModified = update.name != this.name

        this.set(update)
        

        let savedThis = await this.save();
        req.session.account.user = savedThis; //update session data
        if (nameModified){
            await this.updateNameInSubDocs(this.name)
        }
        // FIX : if name modified , need to update concerning idea / event ...etc
        if(upload){
            await customUtil.copyFile(fileInfo.temp_path, fileInfo.path);
        }
        req.session.account.user = savedThis
    } catch (error) {
        throw error
    }
}

userSchema.methods.updateNameInSubDocs = async function(name){
    const targets =[
        { ids: this.medias.map(doc => String(doc._id)), model:Media },
        { ids: this.events.map(doc => String(doc._id)), model:Event },
        { ids: this.ideas.map(doc => String(doc._id)), model:Idea },
        { ids: this.works.map(doc => String(doc._id)), model:Work }
    ]
    
    for (const target of targets) {
        target.model.find({ _id: target.ids}).then(docs =>{

            for (const doc of docs){
                doc.owner.name = name
                doc.save(err=>{})
            }
        })
    }

    /*
    for (const docName of targets) {
        for (var i=0,l=this[docName].length;i<l; i++) {
            
            subdoc.set("owner.name") = name;
            await subdoc.save(err => Promise.resolve())
        }
    }*/
    

    return 
}

const User = new mongoose.model("user", userSchema)



module.exports = User;

