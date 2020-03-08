const Account = require("../models/account");
const User = require("../models/user");
const async = require("async");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const validator = require("express-validator");
const grecaptcha = require("../controller/grecaptcha");
const mailer = require("../controller/sendMail");
const FB = require("../controller/FB")
const customUtil = require("../controller/customUtil");
const fs = require("fs")


/* account資訊 分成兩種
    1.這次req結束後消滅 req.account
    2.持續存在 session
*/

module.exports.ifLogin = function (req, res, next) {

    if (req.session.account) {
        console.log(`登入狀態 : ${req.session.account}`)
        res.redirect("/index")
    } else {
        console.log(`登入狀態 : ${req.session.account}`)
        next()
    }
}

module.exports.login_validation = [
    (req, res, next) => {
        req.data = {};
        next()
    },
    validator.body("account", "帳號或是密碼錯誤!").if(validator.body("type").matches("normal")).custom((value, { req }) => {
        console.log(`verify account :${value}`)
        return Account.findOne({ account: value }).populate('user').then(function (Account) {
            console.log("findone over.")
            if (!Account) {
                console.log("didn;t find accouint")
                req.data.password = "";
                return Promise.reject()
            } else {
                console.log(" find accouint")
                req.data = Account
            }
        })
    }),
    (req, res, next) => {
        if (req.session.resetPass && req.data.account) {
            console.log(req.data.id)
            console.log(req.session.resetPass)
            bcrypt.compare(req.data.id, req.session.resetPass).then(same => {
                console.log(req.data.ifOverRestTime())
                req.data.checkTempPassword = same && req.data.ifOverRestTime() ? false : true;
                next()
            })
        }else{
            next()
        }

    },
    validator.body("password", "帳號或是密碼錯誤!").if(validator.body("type").matches("normal")).custom((value, { req }) => {
        let checkPassword = req.data.checkTempPassword ? req.data.temp_password : req.data.password;

        console.log(`verify password :${value}`)
        return bcrypt.compare(value, checkPassword)
            .then(match => {
                if (!match) {
                    return Promise.reject()
                } else {
                    console.log("match")
                }
            })

    }),
    validator.body("fb_id", "帳號或是密碼錯誤!").if(validator.body("type").matches("fb")).custom((value, { req }) => {
        console.log(`verify FB account :${value}`)
        return Account.findOne({ fb_id: value }).then(function (Account) {
            if (!Account) {
                req.data.new_fb = true;
            } else {
                req.data = Account;
                return true
            }
        })
    }),

    validator.body("gr", "請再試一次").custom((value, { req }) => {

        return grecaptcha.verifyRecaptcha(value)
    }),
    //.catch(function (err) { res.send(err) })
    (req, res, next) => {
        const errors = validator.validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array())

            let accountData = req.session.login ? req.session.account : { name: "anonymous" };

            res.render('login', {
                title: "登入",
                errors: errors.array(),
                login: req.session.login,
                account: accountData,
                ENUMS: global.ENUMS
            })

        } else {
            if (req.data.new_fb) {
                //need verify fb account width fb api
                res.redirect("/account/registry")
            } else {
                next()
            }
        }
    }
];

function login_process(req) {
    req.session.account = {
        id: req.data.id,
        name: req.data.name,
        image_url: req.data.image_url,
        user : req.data.user
    }
}

module.exports.login = function (req, res, next) {
    login_process(req)
    next()
}

module.exports.track_referer = function (req,res,next) {

    if (String(req.headers.referer).includes(global.hostname)){
        req.session.referer = req.headers.referer
    }
    next()
}

module.exports.login_distribution = function (req, res, next) {
    console.log(`resetPass:${req.session.resetPass}`)

    if (req.session.activationHash) {
        res.redirect("/account/activate");
    } else if (req.session.resetPass) {
        deleteResetPasswordProcess(req,req.session.account.id).then(result =>{
            console.log(result)
            res.redirect("/account/resetpassword");
        })
    }
    else {
        console.log("session.redirectAfterLogin", req.session.referer)
        if (req.session.referer) {
            res.redirect(req.session.referer);
        }else{
            res.redirect('/index')
        }
        
    }
}

module.exports.registry = function (req, res, next) {
    var new_account = new Account({
        account: req.body.account,
        email: req.body.email,
        password: req.body.password,
        fb_id: req.body.fb_id,
        fb_access_token: req.body.fb_token,
        isActive: false
    })
    switch (req.body.type) {
        case "normal":
            let new_user = new User({
                name: req.body.name
            })
            let data = { new_account, new_user }
            registry_process(req, res, next, data);
            break;
        case "fb":

            FB.getUserPicture(req.body.fb_id, req.body.token).then(pic_url => {
                console.log(`get FB picture : ${result}`);
                console.log(`new Account ${new_account}`)
                let new_user = new User({
                    name: req.body.name,
                    cover_image: pic_url, // FIX : if error , make this undefined
                    publish_status: true,
                    show_email: false
                })
                let data = { new_account, new_user }
                registry_process(req, res, next, data);
            })
            break;
        default:
            throw new Error("something broken.")
            break;
    }
}

function registry_process(req, res, next, data) {
    async.waterfall([
        callback => {
            data.new_account.save(err =>{
                if (err){ throw new Error(err)}
                callback(null,data.new_account._id)
            })
        },
        (account_id,callback) =>{
            data.new_user.account = account_id
            data.new_user.save(err =>{
                if (err){ throw new Error(err)}
                data.new_user.page_url = `/user/${data.new_user._id}`
                data.new_user.save(err =>{
                    callback(null,data.new_user._id)
                })
            })
        },
        (user_id, callback) =>{ // handle cover_img
            if (!data.new_user.cover_image){
                const cover_img_route = `./public/cover/users/${user_id}.jpg`;
                const cover_img_url   = `/static/cover/users/${user_id}.jpg`;
                let ws = fs.createWriteStream(cover_img_route)
                ws.on('finish',()=>{ 
                    data.new_user.cover_image = cover_img_url;
                    data.new_user.save(err=>{
                        callback(null,user_id) 
                    })
                })

                fs.createReadStream("./public/cover/users/default.jpg")
                  .pipe(ws)
            }else{ callback(null,user_id) }
        },

        (user_id, callback) =>{
            data.new_account.user = user_id
            data.new_account.save(err =>{
                if (err){ throw new Error(err)}
                callback(null,data.new_account)
            })
        },
    ]
    , (err, newAccount) => {
        // error handling
        // need fix , if error , delete account and User
        if (err) {
            console.log(err);
            throw err;
            return
        }
        
        console.log("async OK. Data create successfully.")
        console.log(newAccount)
        console.log(newAccount._id)

        // send email
        bcrypt.hash(newAccount.id, saltRounds, (err, hash) => {
            if (err) { console.log(error) }
            console.log(`hash : ${hash}`)
            let activateUrl = `${global.hostname}/account/activate?h=${hash}`;
            mailer.sendActivation(req.body.email, activateUrl)
        })

        let accountData = req.session.login ? req.session.account : { name: "anonymous" }

        res.render("sys_msg", {
            title: "系統提示",
            msg: `系統已經寄了一封郵件到${req.body.email}，請點擊信件中的連結以啟用帳號。`,
            login: req.session.login,
            account: accountData,
            ENUMS: global.ENUMS
        })
    })
}

module.exports.registry_validation = [
    /*  ------------------------------------------------------------fix me 
       account,password : 移除惡意字元、只能輸入英文及數字。
       email,name : 移除惡意字元
    */
    validator.body("type").isIn(["fb", "normal"]),
    validator.body("fb_id", "fb帳號錯誤").if(validator.body("type").matches("fb")).custom(( fb_id, { req }) => {
        console.log(`verify fb_id:${fb_id}`);
        return async.series([
            callback =>{
                FB.getInfo(fb_id, req.body.fb_token,{fields:"id,name,email"}).then(res => {
                    callback(null, res)
                },err => { throw new Error(err) })
            },
            callback => {
                Account.findOne({ fb_id }).then(Account => {
                    callback(null, Account)
                })
            }
        ]).then(result => {
            let Account = result[1];
            let fb_user = result[0];

            if (Account) {
                red.data.is_exist_fb_account = true
                req.data.account = Account;

            } else {
                //req.session.fb_email = fb_res.body.email
                // fb_name never been use?
                req.session.fb_name = fb_user.name
            }
        }, err => Promise.reject("無法連線到Facebook"))
    }),

    validator.body('account', "帳號名稱錯誤").if(validator.body("type").matches("normal")).trim().isLength({ min: 8 })
        .custom((value, { req }) => {
            console.log(`verify account:${value}`)
            return Account.findOne({ account: value }).then(Account => {
                if (Account) {
                    return Promise.reject("使用者名稱已存在")
                }
            })
        }),
    validator.body('password', "密碼錯誤").if(validator.body("type").matches("normal")).trim().isLength({ min: 6 }).if((value, { req }) => {
        return value === req.body["password_check"] // need trim [password_check]
    }).customSanitizer(value => bcrypt.hashSync(value, saltRounds)),

    validator.body('email', "email錯誤").trim().notEmpty().isEmail(), // when empty ,show error*2
    validator.body('name', "顯示名稱錯誤").if(validator.body("type").matches("normal")).trim().notEmpty(),
    validator.body("gr", "請再試一次").custom((value, { req }) => {
        return grecaptcha.verifyRecaptcha(value)
    }),
    (req, res, next) => {
        console.log("registry_validation_result :")
        // 有無錯誤? 有就redirect回去。
        const errors = validator.validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array())

            let accountData = req.session.login ? req.session.account : { name: "anonymous" }
            res.render('registry',
                {
                    title: "註冊",
                    errors: errors.array(),
                    login: req.session.login,
                    account: accountData,
                    ENUMS: global.ENUMS
                }
            )
        } else {
            next()
        }
    }
];

module.exports.registry_distribution = function (req, res, next) {
    if (!req.data.is_exist_fb_account) { 
        next()
    } else {
        login_process(req)
        res.redirect("/account/activate")
    }
}

module.exports.get_registry = function (req, res, next) {
    let accountData = req.session.login ? req.session.account : { name: "anonymous" };
    res.render("registry", {
        title: "註冊",
        errors: false,
        login: req.session.login,
        account: accountData,
        ENUMS: global.ENUMS
    });
}

module.exports.get_login = function (req, res, next) {
    //res.sendFile(process.cwd() + "/public/login.html")
    let accountData = req.session.login ? req.session.account : { name: "anonymous" };
    res.render("login",
        {
            title: "登入",
            errors: false,
            login: req.session.login,
            account: accountData,
            ENUMS: global.ENUMS
        }
    )
}

module.exports.logout = function (req, res, next) {
    console.log("------------------------登出----------------------")
    req.session.account = undefined;
    res.redirect("/index");
}

module.exports.activate = function (req, res, next) {
    async.waterfall([function (callback) {
        console.log(`compare id : ${req.session.account.id}`)
        bcrypt.compare(req.session.account.id, req.session.activationHash, (err, same) => {
            console.log(`compare result : ${same}`)
            callback(null, same)
        })
    }, function (same, callback) {
        if (same) {
            Account.updateOne({ _id: req.session.account.id }, { isActive: true }, (err, result) => {
                console.log("update successfully.")
                console.log(result)
                callback(null, true)
            })
        } else {
            callback(null, false)
        }
    }
    ], (err, success) => {
        console.log(err)
        console.log(`activate result : ${success}`);
        delete req.session.hash;
        if (success) {
            res.redirect("/index")
        } else {
            res.redirect(`/user/edit/my`)
            console.log(`result : Id and Hash not the same,activate failed.`)
        }
    }
    )
}

module.exports.activate_distribution = function (req, res, next) {
    // need verify isLogin
    req.session.activationHash = req.query.h ? req.query.h : req.session.activationHash
    console.log("activate.")
    console.log(req.session.account)

    if (req.session.activationHash && req.session.account) {
        console.log(`active account ID : ${req.session.account.id} `)
        next()
    } else {
        console.log(`you are not login.can't active`)
        res.redirect("/account/login")
    }

}

module.exports.get_forgetps = function (req, res, next) {
    let accountData = req.session.login ? req.session.account : { name: "anonymous" };
    res.render("forget_password",
        {
            title: "忘記密碼",
            errors: false,
            login: req.session.login,
            account: accountData,
            ENUMS: global.ENUMS
        }
    )
}

module.exports.forgetps_validation = [
    (req, res, next) => {
        req.data = {};
        next()
    },
    validator.body("email").custom((value, { req }) => {
        let account = req.body.account

        return Account.findOne({ email: value, account: account }).then(result => {
            /*if (err) {
                console.log(err)
                return Promise.reject("發生錯誤")
            }*/
            if (!result) {
                return Promise.reject("帳號不存在")
            } else {
                req.data.account = result
            }
        })
    }),
    //validator.check_time_in_5_min,
    validator.body("gr", "請再試一次").custom((value, { req }) => {
        return grecaptcha.verifyRecaptcha(value)
    })
    , (req, res, next) => {
        const errors = validator.validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array())

            let accountData = req.session.login ? req.session.account : { name: "anonymous" }
            res.render('forget_password',
                {
                    title: "忘記密碼",
                    errors: errors.array(),
                    login: req.session.login,
                    account: accountData,
                    ENUMS: global.ENUMS
                }
            )
        } else {
            next()
        }

    }]

module.exports.forgetps = function (req, res, next) {
    let temp_password = Math.floor(Math.random() * 1000000).toString() // can't hash number
    async.waterfall([
        function (callback) {
            bcrypt.hash(temp_password, saltRounds, (err, hash) => {
                console.log(`encry : ${hash}`)
                callback(null, hash)
            })
        },
        function (hash, callback) {
            console.log("update temp pass")
            console.log(hash)
            Account.updateOne({ id: req.data.account.id })
                .set('temp_password', hash)
                .set('reset_pass_time', Date.now())
                .then(result => {
                    callback(null, hash)
                })
        }
    ], (err, hash) => {
        let url = "https://www.google.com"
        bcrypt.hash(req.data.account.id, saltRounds, (err, hash) => {
            if (err) { console.log(error) }
            console.log(`hash : ${hash}`)
            let url = `${global.hostname}/account/forgetpassword_active?h=${hash}`;
            mailer.sendResetPassword(req.data.account.email, temp_password, url)
        })
        let accountData = req.session.login ? req.session.account : { name: "anonymous" }
        res.render("sys_msg", {
            title: "系統提示",
            msg: `系統已經寄了一封郵件到${req.body.email}，請點擊信件中的連結以啟用帳號。`,
            login: req.session.login,
            account: accountData,
            ENUMS: global.ENUMS
        })
    })
}

module.exports.forgetpassword_active = function (req, res, next) {
    if (req.session.login) {
        deleteResetPasswordProcess(req, req.session.account.id).then(result => {
            
            console.log("reset reset_password process. complete.")
            console.log(result)
            res.redirect("/account/resetpassword")
        })

    } else {
        req.session.resetPass = req.query.h
        res.redirect("/account/login")
    }

}
module.exports.get_resetps = function (req, res, next) {
    let accountData = req.session.login ? req.session.account : { name: "anonymous" };
    res.render("reset_password",
        {
            title: "重設密碼",
            session:req.session,
            errors: false,
            login: req.session.login,
            account: accountData,
            ENUMS: global.ENUMS
        }
    )
}

module.exports.resetPassword = function (req, res, next) {
    async.waterfall([
        function (callback) {  
            bcrypt.hash(req.body.password,saltRounds).then( hash =>{
                callback(null,hash)
            })
        },
        function (hash,callback) {  
            Account.updateOne({_id : req.session.account.id}, {password : hash}).then(result =>{
                console.log(result)
                callback(null,result)
            })
        }
    ],(err ,result) =>{
        if (!err){
            res.redirect("/index")
        }
    })
}
module.exports.resetps_validation = [
    validator.body('password').custom((value , {req} ) =>{
        if (value === req.body.password_check){
            return true;
        }else{
            return false;
        }
    })
    ,(req,res,next) =>{
        let page = { name : "reset_password" , title : "重設密碼" }
        customUtil.returnIfFormError(req,page,next)
    }
]


function deleteResetPasswordProcess(req, id) {
    console.log("deleteResetPasswordProcess")
    console.log(`id : ${id}`)

    delete req.session.resetPass
    return Account.updateOne({ _id: id }, {
        $unset: {
            temp_password: "",
            reset_pass_time: ""
        }
    })
}