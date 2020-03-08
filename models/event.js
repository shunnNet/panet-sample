
// 放在node.js的global中，定時跟mongoDB更新
// enum 寫成 custom validator，在呼叫function時存取全域變數enum

const mongoose = require("mongoose");
const customUtil = require("../controller/customUtil");
const default_cover_path = "./public/cover/events/default.jpg";

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim:true, // add Setter always trim value.
        minlength: 1,
        maxlength: 50
    },
    description: {
        type: String
    },
    desc_literal: String,
    type: {
        type: String,
        required: true,
        validate : function(value){ return global.ENUMS.TYPES.includes(value)}
    },
    owner: { 
        user : {        
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'user',
            required: true
        },
        name : String
    },
    start_time: {
        type: Date,
        required: true,
        //min : new Date()
    },
    end_time: { 
        type: Date,
        //min : new Date()
    },
    location: {
        type: String,
        validate : function(value){ return global.ENUMS.CITY.includes(value)}
    },
    cover_image: {
        type: String
    },
    cover_image_offset_y:{
        type: String
    },
    publish_status: {
        type: Boolean,
        required: true
    },
    FB_link: String,
    update_time : {
        type: Date, 
        default: new Date()
    },
    page_url: String
})

// make these literal be the normal data, or it will increase the cost of query.

eventSchema.methods.customUpdate = async function (req) {   
    let update = req.body;
    const upload = req.file;
    let fileInfo ;
    // FIX : reset if failed.
    try {
        if (upload){
            fileInfo = customUtil.handleUpload(req,req.file,this,"events");
            if (!fileInfo.fileType){
                throw new Error("不接受的檔案格式")
            }
            update.cover_image = fileInfo.route;
        }
        this.populate("owner.user",err => console.log(err))
            .set(update)
        
        const titleModified = this.modifiedPaths().includes("title") //modifiedPaths cleared after save()
        let savedEvent = await this.save()
        
        if (titleModified){
            const user = this.owner.user;
            const savedUser = await user.modifySubDoc("events",savedEvent).save()
            const index = req.session.account.user.events.findIndex(event => {
                return event._id == savedEvent._id  //for savedEvent._id is typeof Object, so compare with == for literal
            })
            req.session.account.user.events[index].title = savedEvent.title
        }
        if(upload){
            await customUtil.copyFile(fileInfo.temp_path, fileInfo.path);
        }
    }catch(error){
        throw error
    }
}

eventSchema.methods.customCreate = async function (req) {
    const user_id = req.session.account.user._id;
    const user_name = req.session.account.user.name;
    this.owner.user = user_id;
    this.owner.name = user_name;
    this.publish_status = true; // FIX : add to form ;

    try{
        let newThis = await this.save();
        newThis.page_url = `/event/${newThis._id}`

        let fileInfo = req.file ? customUtil.handleUpload(req,req.file,newThis,"events") : 
                                  customUtil.useDefault(req,"cover",newThis,"events");
        if (!fileInfo.fileType){
            throw new Error("不接受的檔案格式")
        }
        await customUtil.copyFile(fileInfo.temp_path, fileInfo.path)
        
        newThis.cover_image = fileInfo.route;
        newThis.populate({path:"owner.user"}).execPopulate() ; // FIX : need populate before save , why?;
        newThis = await newThis.save();
        console.log(newThis);
        
        const user = newThis.owner.user
        const newThisInfo_simple = { _id: newThis._id, title: newThis.title ,page_url: newThis.page_url};
        user.events.push(newThisInfo_simple)
        await user.save()

        req.session.account.user.events.push(newThisInfo_simple)
        return newThis
    }catch(error){
        throw error
    }
}

eventSchema.methods.customDelete = async function (req) {
    try{
        let user = this.owner.user;
        user.events.pull(this._id);
        user = await user.save();
        let event = await this.remove();

        const index = req.session.account.user.events.findIndex(ele => ele._id == event.id);
        req.session.account.user.events.splice(index, 1);

        let cover_path = "." + event.cover_image.replace("static","public");
        await customUtil.unlink(cover_path)
        
    }catch(err){
        throw err
    }
}

const Event = new mongoose.model("event", eventSchema);

module.exports = Event;