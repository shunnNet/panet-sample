const checkMedia = window.matchMedia("(max-width:375px)");

Vue.component('validation-provider', VeeValidate.ValidationProvider);
Vue.component('validation-observer', VeeValidate.ValidationObserver);

const app = new Vue({
    el : "#content",
    data : {
        account: "",
        email: "",
        isSoSmallSize: checkMedia.matches
    },
    methods:{
        submitIfPassed(event,obs) {
            obs.validate().then(passed =>{
                if (passed){
                    this.submit(event.currentTarget)
                }
            }).catch(err => console.log(err));
        },
        submit(form){
            form.submit()
        }

    },
    mounted() {
        setRecaptcha()
    }
})

