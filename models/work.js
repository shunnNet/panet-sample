const mongoose = require("mongoose")
const customUtil = require("../controller/customUtil");
const modelName = "work";
const cover_dir = `./public/cover/${modelName}`;
const cover_dir_route = `./static/cover/${modelName}`;
const default_cover_path = `${cover_dir}/default.jpg`;

const workSchema = new mongoose.Schema({
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
    demand: [{
        name: { //職務名稱
            type: String,
            require: true,
            validate: function (value) { return global.ENUMS.SKILLS.includes(value) }
        },
        count: { // 需求數量
            type: Number
            // FIX: "不限" ?
        },
        form: { // pay by hour/day/month or case ?
            type: String,
            require: true,
            validate: function (value) { return global.ENUMS.WORK_PAY_FORM.includes(value) }
        },
        per: { // more description for form , pay by $per hour/day/month
            type: Number,
            require: true
        },
        per_amount: Number, // 每單位時段工資
        currency: {
            type: String,
            default: "新台幣"
        }, // 貨幣別
        total_period: Number, // 總時段數(單位: period / $per $form)
    }],
    start_time: {
        type: Date,
        required: true,
        //min: new Date()
    },
    end_time: {
        type: Date,
        //min: new Date()
    },
    location: {
        type: String,
        validate: function (value) { return global.ENUMS.CITY.includes(value) }
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
    update_time: {
        type: Date,
        default: new Date()
    },
    page_url : String
})

workSchema.virtual("start_time_literal").get(() => customUtil.transTimeformat(this.start_time))
workSchema.virtual("end_time_literal").get(() => customUtil.transTimeformat(this.start_time))
// make these literal be the normal data, or it will increase the cost of query.

workSchema.methods.customUpdate = async function (req) {
    let update = req.body;
    const upload = req.file;
    let fileInfo;
    // FIX : reset if failed.
    try {
        if (upload) {
            fileInfo = customUtil.handleUpload(req, req.file, this, "works");
            if (!fileInfo.fileType){
                throw new Error("不接受的檔案格式")
            }
            update.cover_image = fileInfo.route;
        }
        this.populate("owner.user", err => console.log(err))  // FIX : havent handle it.
            .set(update)
        const titleModified = this.modifiedPaths().includes("title");
        let savedThis = await this.save();
        

        if (titleModified) {
            const user = this.owner.user;
            const savedUser = await user.modifySubDoc("works", savedThis)
                .save()
            const index = req.session.account.user.works.findIndex((ele, i) => ele._id == savedThis._id);
            req.session.account.user.works[index].title = savedThis.title
        }
        if (upload) {
            await customUtil.copyFile(fileInfo.temp_path, fileInfo.path);
        }

    } catch (error) {
        throw error
    }
}

workSchema.methods.customCreate = async function (req) {
    const user_id = req.session.account.user._id;
    const user_name = req.session.account.user.name;
    this.owner.user = user_id;
    this.owner.name = user_name;
    this.publish_status = true; // FIX : add to form ;

    try {
        let newThis = await this.save();
        newThis.page_url = `/work/${newThis._id}`

        let fileInfo = req.file ? customUtil.handleUpload(req, req.file, newThis, "works") :
            customUtil.useDefault(req, "cover", newThis, "works");
        if (!fileInfo.fileType){
            throw new Error("不接受的檔案格式")
        }
        
        await customUtil.copyFile(fileInfo.temp_path, fileInfo.path);

        newThis.cover_image = fileInfo.route;
        newThis.populate({ path: "owner.user" }).execPopulate(); // FIX : need populate before save , why?;
        newThis = await newThis.save();

        const user = newThis.owner.user;
        const newThisInfo_simple = { _id: newThis._id, title: newThis.title ,page_url: newThis.page_url};
        user.works.push(newThisInfo_simple);
        await user.save();

        req.session.account.user.works.push(newThisInfo_simple);
        return newThis
    } catch (error) {
        throw error;
    }
}

workSchema.methods.customDelete = async function (req) {
    try {
        let user = this.owner.user;
        user.works.pull(this._id);
        user = await user.save();
        let doc = await this.remove();

        const index = req.session.account.user.works.findIndex(ele => ele._id == doc.id);
        req.session.account.user.works.splice(index, 1);

        let cover_path = "." + doc.cover_image.replace("static", "public");
        await customUtil.unlink(cover_path)

    } catch (err) {
        throw err
    }
}

const Work = new mongoose.model("work", workSchema)


module.exports = Work;
