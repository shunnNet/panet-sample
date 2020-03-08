
var onerrorCallback , onloadCallback;

function recaptchaPrepared() {
    return new Promise( (resolve,reject) =>{
        onerrorCallback = function(){
            reject(false)
        }
        onloadCallback = function () {
            resolve(true)
        }
    })
}

let recaptchaResponse = recaptchaPrepared()

function setRecaptcha(params) {
    recaptchaResponse.then(res => {
        const recaptchContainer = document.querySelector('.g-recaptcha')
        const recaptchContent = document.querySelector('.g-recaptcha iframe')
        if (recaptchContainer && !recaptchContent){
            grecaptcha.render(recaptchContainer,{
                class:"g-recaptcha",
                sitekey:'********************************',
                callback:'recapCallback'
            })
        }
    },res => console.log(res))
}

function recapCallback(token) {
    console.log("OK");
    
    document.querySelector('[name="gr"]').value = token
}
