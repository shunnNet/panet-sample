const checkMedia = window.matchMedia("(max-width:375px)");

Vue.component('validation-provider', VeeValidate.ValidationProvider);
Vue.component('validation-observer', VeeValidate.ValidationObserver);
Vue.component('note-book',{
    ...components.vueNotebook,
    watch:{
        active_noteBook(){
            setRecaptcha()
        }
    }
    
})

const app = new Vue({
    el : "#content",
    data : {
        account : "",
        password: "",
        password_check: "",
        email: "",
        name: "",
    
        noteBlocks : [
            {
                value : "local",
                name : "一般註冊"
            },
            {
                value : "other",
                name : "其他註冊"
            }
        ],
        isSoSmallSize : checkMedia.matches
    },
    methods:{
        submitIfPassed(event,observer) {
            observer.validate(event).then(passed =>{
                if (passed){
                    if (document.querySelector('[name="gr"]').value){
                        this.submit(event.currentTarget)
                    }
                }
            }).catch(err => { console.log(err) })

        },
        fb_login(event){
            if (document.querySelector('[name="gr"]').value){
                FB.login(function(result) {
                    console.log(result.authResponse)
                    if (result.authResponse){
                        document.querySelector('[name="fb_id"]').value = result.authResponse.userID
                        document.querySelector('[name="fb_token"]').value = result.authResponse.accessToken
                        document.querySelector('[name="type"]').value = "fb"
                        document.querySelector('[action="registry"]').submit()
                    }
                })
            }
        },
        submit(form){
            form.submit()
        }
    },
    mounted() {
        setRecaptcha()
    }
})

