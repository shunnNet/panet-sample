const mongoose = require("mongoose");
const customUtil = require("../controller/customUtil");
const modelName = "ideas";
const cover_dir = `./public/cover/${modelName}`;
const cover_dir_route = `./static/cover/${modelName}`;
const default_cover_path = `${cover_dir}/default.jpg`;

const ideaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true, // add Setter always trim value.
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
        validate: function (value) { return global.ENUMS.TYPES.includes(value) }
    },
    owner: { 
        user : {        
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'user',
            required: true
        },
        name : String
    },
    concerner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }, //FIX : Can't modified by Owner.
    distributer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }], // FIX : when update , it need to modify user.

    demand: [{
        name: {
            type: String,
            require: true,
            validate: function (value) { return global.ENUMS.SKILLS.includes(value) }
        },
        count :{
            type: Number
            // FIX: "不限" ?
        }
    }],
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
    update_time : {
        type: Date, 
        default: new Date()
    },
    page_url : String
})

ideaSchema.methods.customUpdate = async function (req){
    let update = req.body;
    const upload = req.file;
    let fileInfo ;
    // FIX : reset if failed.
    try {
        if (upload){
            fileInfo = customUtil.handleUpload(req,req.file,this,"ideas");
            if (!fileInfo.fileType){
                throw new Error("不接受的檔案格式")
            }
            update.cover_image = fileInfo.route;
        }
        this.populate("owner.user",err => console.log(err))  // FIX : havent handle it.
            .set(update)
        
        const titleModified = this.modifiedPaths().includes("title");
        let savedThis = await this.save();
        

        if (titleModified){
            const user = this.owner.user;
            const savedUser = await user.modifySubDoc("ideas",savedThis)
                                        .save()
            const index = req.session.account.user.ideas.findIndex(idea => idea._id == savedThis._id)
            req.session.account.user.ideas[index].title = savedThis.title
        }
        if(upload){
            await customUtil.copyFile(fileInfo.temp_path, fileInfo.path);
        }

    } catch (error) {
        throw error
    }
}

ideaSchema.methods.customCreate = async function (req){
    const user_id = req.session.account.user._id;
    const user_name = req.session.account.user.name;
    this.owner.user = user_id;
    this.owner.name = user_name;
    this.publish_status = true; // FIX : add to form ;
    
    try {
        let newThis = await this.save();
        newThis.page_url = `/idea/${newThis._id}`

        let fileInfo = req.file ? customUtil.handleUpload(req,req.file,newThis,"ideas") : 
                                  customUtil.useDefault(req,"cover",newThis,"ideas");
        if (!fileInfo.fileType){
            throw new Error("不接受的檔案格式")
        }
        
                                  await customUtil.copyFile(fileInfo.temp_path, fileInfo.path);
        
        newThis.cover_image = fileInfo.route;
        newThis.populate({path:"owner.user"}).execPopulate() ; // FIX : need populate before save , why?;
        newThis = await newThis.save();

        const user = newThis.owner.user;
        const newThisInfo_simple = { _id: newThis._id, title: newThis.title ,page_url: newThis.page_url};
        user.ideas.push(newThisInfo_simple);
        await user.save();

        req.session.account.user.ideas.push(newThisInfo_simple);
        return newThis
    } catch (error) {
        throw error;
    }
}

ideaSchema.methods.customDelete = async function (req) {
    try{
        let user = this.owner.user;
        user.ideas.pull(this._id);
        user = await user.save();
        let idea = await this.remove();

        const index = req.session.account.user.ideas.findIndex(ele => ele._id == idea.id);
        req.session.account.user.ideas.splice(index, 1);

        let cover_path = "." + idea.cover_image.replace("static","public");
        await customUtil.unlink(cover_path)
        
    }catch(err){
        throw err
    }
}

const Idea = new mongoose.model("idea", ideaSchema)


module.exports = Idea

