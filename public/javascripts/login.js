const checkMedia = window.matchMedia("(max-width:375px)");


Vue.component('note-book',{
    ...components.vueNotebook,
    
    watch:{
        active_noteBook(){
            setRecaptcha()
        }
    },
    
})

const app = new Vue({
    el : "#content",
    data : {
        noteBlocks : [
            {
                value : "local",
                name : "一般登入"
            },
            {
                value : "other",
                name : "其他登入"
            }
        ],
        isSoSmallSize : checkMedia.matches
    },
    methods:{
        exeGre(event){
            grecaptcha.execute(1)
        },
        fb_login(event){
            if (document.querySelector('[name="gr"]').value){
                FB.login(function(result) {
                    if (result.authResponse){
                        document.querySelector('[name="fb_id"]').value = result.authResponse.userID
                        document.querySelector('[name="fb_token"]').value = result.authResponse.accessToken
                        document.querySelector('[name="type"]').value = "fb"
                        document.querySelector('[action="/account/login"]').submit()
                    }
                })
            }
        },
        submitIfPassed(event) {
            if (document.querySelector('[name="gr"]').value){
                event.currentTarget.submit()
            }
            //
        }
    },
    mounted() {
        setRecaptcha()
    }
})

