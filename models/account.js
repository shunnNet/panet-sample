const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema({
    account : String,
    email : String,
    password: String,
    fb_id : String ,
    fb_access_token : String,
    isActive : Boolean,
    temp_password : String,
    reset_pass_time : { type: Date},
    user : {type: mongoose.Schema.Types.ObjectId, ref:"user" }
})

accountSchema.methods.ifOverRestTime = function () {
    let limit = 5*5000000000000
    if (this.reset_pass_time){
        return Date.now() - this.reset_pass_time.getTime() > limit
    }else{
        return false
    }
}

accountSchema.methods.log = function (params) {
    console.log("OK")
}

const Account = new mongoose.model("account",accountSchema)


module.exports = Account