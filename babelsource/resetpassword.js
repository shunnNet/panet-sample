Vue.component('validation-provider', VeeValidate.ValidationProvider);
Vue.component('validation-observer', VeeValidate.ValidationObserver);

const app = new Vue({
    el : "#content",
    data : {
        password: "",
        password_check: ""
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

    }
})

