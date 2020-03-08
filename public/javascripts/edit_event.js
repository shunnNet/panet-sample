
const dragging_img = getEmptyDragImg();
const page_data_default = {
    title: "",
    type: option_type[0],
    start_time: new Date().toISOString(),
    end_time: "",
    location: option_city[0],
    description: "",
    desc_literal: "",
    cover_image: "",
    cover_image_offset_y: "0%",
    publish_status: true
};

page_data = page_data ? page_data : page_data_default;
let default_cover_url = page_data.default_cover_url ? 
                        page_data.default_cover_url : page_data.cover_image ? 
                        page_data.cover_image : "/static/cover/works/default.jpg" 

Vue.component('vue-datetime', window.VueDatetime.Datetime);
Vue.component('validation-provider', VeeValidate.ValidationProvider);
Vue.component('validation-observer', VeeValidate.ValidationObserver);

const app = new Vue({
    el: "#content",
    data: {
        form: {
            ...page_data,
            default_cover_url: default_cover_url,

        },
        drag_box : null,
        vue_mounted : false,
        medium: MEDIUM_SETTING
    },
    mounted() {
        document.body.ondrop = function(ev){ev.preventDefault()};
        document.body.ondragover = function(event){
            if (event.target.id == "js-drag-box"){
                app.dragging(event.pageY)
            }
            event.preventDefault()
        };
        this.drag_box = document.getElementById("js-drag-box")
        this.vue_mounted = true;
    },

    methods: {
        processEditOperation(operation,vee) {
            vee.validate()
            this.form.description = operation.api.origElements.innerHTML;
            this.form.desc_literal = operation.api.origElements.innerText;
        },
        set_cover_image(url){
            this.form.cover_image = url
        },
        set_upload(event,vee_validator) {
            const files = event.currentTarget.files;
            const userHadUpload = files.length !== 0;
            let url = "";
            if (userHadUpload) {
                vee_validator(event)
                url = getFileUrl(files[0])
                document.getElementById("js-drag-box").style.top = "0%";
            }
            this.set_cover_image(url)
        },
        dragstart(event) {
            event.dataTransfer.setDragImage(dragging_img, 0, 0);

            const target = event.currentTarget;
            const parentHeight = target.parentElement.clientHeight;
            
            // transform top from percent to px
            const nowTargetTop = target.style.top ? 
                parseInt(target.style.top) / 100 * parentHeight : 0;
            
            const protoMousePosY = event.pageY;
            const imgHeight = target.clientHeight;
            const moveUpLimit = -(imgHeight - parentHeight);

            target.setAttribute("data-proto_mouse_pos_y", protoMousePosY)
            target.setAttribute("data-proto_top", nowTargetTop)
            target.setAttribute("data-limit_moveup", moveUpLimit)
            target.setAttribute("data-limit_movedown", 0)

        },

        dragging(nowMousePosY) {
            const target = this.drag_box;

            const protoTop = parseInt(target.dataset["proto_top"])
            const protoMousePosY = parseInt(target.dataset["proto_mouse_pos_y"]);
           
            const moveY = nowMousePosY - protoMousePosY;
            
            const nextTop = protoTop + moveY;
            
            const moveUpLimit = target.dataset["limit_moveup"];
            const moveDownLimit = target.dataset["limit_movedown"];

            if (nextTop > moveDownLimit) {
                this.form.cover_image_offset_y = "0%";
            }
            else if (nextTop < moveUpLimit) {
                return
            } else {
                const parentHeight = target.parentElement.clientHeight;
                const move_percent = nextTop / parentHeight * 100;
                this.form.cover_image_offset_y = move_percent + "%"
            }
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
