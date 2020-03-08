
const mongoose = require("mongoose");
const customUtil = require("../controller/customUtil");
const modelName = "media";
const cover_dir = `./public/cover/${modelName}`;
const cover_dir_route = `./static/cover/${modelName}`;
const default_cover_path = `${cover_dir}/default.jpg`;

const mediaSchema = new mongoose.Schema({
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
    media_storage_type: {
        type: String,
        //required: true,
        validate: function (value) { return global.ENUMS.MEDIA_FILE_STORAGE_TYPE.includes(value) }
    },
    media_type: { // mimeType
        type: String
    },
    media_route: {
        type: String,
        //required: true 
    },
    owner: { 
        user : {        
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'user',
            required: true
        },
        name : String
    },
    cover_image: String,
    update_time: { type: Date, default: new Date() },
    publish_status: {
        type: Boolean,
        required: true
    },
    page_url: { type: String }
})


mediaSchema.methods.customUpdate = async function (req) {
    let update = req.body;
    const upload = req.file;
    let fileInfo ;
    // FIX : reset if failed.
    try {
        if (upload){
            fileInfo = customUtil.handleUpload(req,upload,this,"medias"); // FIX : wouldn't accept media modified when update.
            if (!fileInfo.fileType){
                throw new Error("不接受的檔案格式")
            }
            update.cover_image = fileInfo.route;
        }
        this.populate("owner.user",err => console.log(err))
            .set(update)
        const titleModified = this.modifiedPaths().includes("title")
        let savedThis = await this.save()
        

        if (titleModified){
            const user = this.owner.user;
            const savedUser = await user.modifySubDoc("medias",savedThis)
                                        .save()
            const index = req.session.account.user.medias.findIndex(media => media._id == savedThis._id)
            req.session.account.user.medias[index].title = savedThis.title
        }
        if(upload){
            await customUtil.copyFile(fileInfo.temp_path, fileInfo.path);
        }
    } catch (error) {
        throw error
    }
}

// FIX : don't need cover image.
mediaSchema.methods.customCreate = async function (req) {
    const isLocal = this.media_storage_type === "local";
    const uploadFields = isLocal ? ["cover", "medias"] : ["cover"];
    const user_id = req.session.account.user._id;
    const user_name = req.session.account.user.name;
    this.owner.user = user_id;
    this.owner.name = user_name;
    this.publish_status = true; // FIX : add to form ;

    try {
        let newThis = await this.save();
        newThis.page_url = `/media/${newThis._id}`

        let fileInfos = {};
        for (const field of uploadFields) {
            let upload = req.files[field];
            let fileInfo = upload ? customUtil.handleUpload(req, upload[0], newThis, "medias") :
                                    customUtil.useDefault(req, field, newThis, "medias")
            if (!fileInfo.fileType){
                throw new Error("不接受的檔案格式")
                // FIX : if cover passed but medias failed , cover will be saved in server.
            }
            if (fileInfo) {
                fileInfos[field] = fileInfo;
                await customUtil.copyFile(fileInfo.temp_path, fileInfo.path);
            } else {
                throw new Error(`Field ${field} is required.`)
            }
        }
        if (!isLocal){
            let youtube_id = req.body.youtube_url.match(/v=([a-zA-Z0-9]+)/)[1]
            //https://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api

            if (youtube_id){
                fileInfos["medias"] = {
                    route : "https://www.youtube.com/embed/" + youtube_id,
                    mimetype : "youtube"
                }
            }else{
                throw new Error("Youtube 影片不存在")
            }
        }
        
        newThis.cover_image = fileInfos["cover"].route;
        newThis.media_route = fileInfos["medias"].route;
        newThis.media_type = fileInfos["medias"].mimetype;

        newThis.populate({ path: "owner.user" }).execPopulate(); // FIX : need populate before save , why?;
        newThis = await newThis.save();

        const user = newThis.owner.user;
        const newThisInfo_simple = {
            _id: newThis._id,
            doc: newThis._id,
            title: newThis.title,
            media_route: newThis.media_route,
            cover_image: newThis.cover_image,
            page_url : newThis.page_url
        };
        user.medias.push(newThisInfo_simple);
        await user.save();

        req.session.account.user.medias.push(newThisInfo_simple);
        return newThis
    } catch (error) {
        throw error;
    }
}

mediaSchema.methods.customDelete = async function (req) {
    
    try {
        let user = this.owner.user;
        user.medias.pull(this._id);
        user = await user.save();
        let media = await this.remove();

        const index = req.session.account.user.medias.findIndex(ele => ele._id == media.id);
        req.session.account.user.medias.splice(index, 1);
        
        let cover_path = "."+media.cover_image.replace("static", "public");
        await customUtil.unlink(cover_path);

        if (this.media_storage_type === "local"){
            let media_path = "."+media.media_route.replace("static", "public");
            await customUtil.unlink(media_path)
        }

    } catch (err) {
        throw err
    }
}



const Media = new mongoose.model("media", mediaSchema)


module.exports = Media