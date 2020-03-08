const page_data_default = {
    title: "",
    type:  option_type[0],
    description: "",
    desc_literal: "",
    upload: "",
    publish_status: true,
    media_storage_type: "local",
    media_type: "",
    media_route: "",
    youtube_url: ""
}

// media_type and route will not exist in req.body when turn back data
page_data = page_data ? page_data : page_data_default;
page_data.media_type = page_data.media_type ? page_data.media_type : "";
page_data.media_route = page_data.media_route ? page_data.media_route : "";

let default_cover_url = page_data.default_cover_url ? 
                        page_data.default_cover_url : page_data.cover_image ? 
                        page_data.cover_image : "/static/cover/medias/default.jpg" 


Vue.component('validation-provider', VeeValidate.ValidationProvider);
Vue.component('validation-observer', VeeValidate.ValidationObserver);
Vue.component("vue-media",vueMedia)
Vue.component("pdf-vuer",pdfVuer)


const app = new Vue({
    el: "#content",
    data: {
        form: {
            ...page_data,
            default_cover_url: default_cover_url,
            youtube_url: page_data.media_type === "youtube" ? 
                         generateYoutubeUrl(page_data.media_route) : ""         
        },
        media_block : "local",
        vue_mounted : false,
        medium: MEDIUM_SETTING
    },
    mounted() {
        this.vue_mounted = true;
    },
    computed:{
        storage_type(){
            return this.form.media_storage_type
        }
    },
    watch: {
        storage_type(newValue,oldValue){
            this.clearMedia()
            this.media_block = newValue
        }
    },
    methods: {
        clearMedia(){
            this.form.media_type = "";
            this.form.media_route= "";
            this.form.youtube_url= "";
        },
        preview_youtube() {
            if (this.form.media_storage_type === "youtube" &&
                this.form.youtube_url) {
                let youtubeId = this.form.youtube_url.match(/v=([^&]+)/)[1]
               
                this.form.media_route = `https://www.youtube.com/embed/${youtubeId}`;
                this.form.media_type = "youtube";
            }
        },
        processEditOperation(operation,vee) {
            vee.validate()
            this.form.description = operation.api.origElements.innerHTML;
            this.form.desc_literal = operation.api.origElements.innerText;
        },
        set_media(event,vee) {
            var files = event.currentTarget.files
            if (files.length !== 0) {
                var file = files[0]
                var url = window.URL.createObjectURL(file)
                this.form.media_type = file.type;
                this.form.media_route = url;
            }else{
                this.form.media_type = "";
                this.form.media_route = "";
            }
            
            vee.validate(event)
        },
        onSubmit(event,observer){
            observer.validate()
                    .then(passed => {
                        if (passed){
                            this.submit(event.currentTarget)
                        }else{
                            let target = document.querySelector(`.form__line--invalid`)
                            const nav_bar_height = 70;
                            const padding = 10;
                            const offset = nav_bar_height + padding;
                            scrollToNode(target,-offset,300)
                        }
                    }).catch(err => console.log(err));
            
        },
        submit(form){
            form.submit()
        }
    },
    components: {
        'medium-editor': vueMediumEditor.default
    },
})


function generateYoutubeUrl(url) {
    let youtubeId = url.replace("https://www.youtube.com/embed/","")
    return `https://www.youtube.com/watch?v=${youtubeId}`
}