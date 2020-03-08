const request = require('request');
const util = require('util');

const POST = util.promisify(request.post)

function verifyRecaptcha(token) {

    return POST('https://www.google.com/recaptcha/api/siteverify',{
        form: {
            secret: "*******************************************",
            response : token
        },
        json : true // or res.body will be String
    }).then(res =>{
        console.log("verify RECAPTCHA.")
        console.log(`statusCode: ${res.statusCode}`)
        console.log(res.body)
        if (!res.body.success){
            console.log("failed RECAPCHA.")
            return Promise.reject()
        }else{
            console.log("pass RECAPTCHA.")
        }
    })
}

module.exports.verifyRecaptcha = verifyRecaptcha