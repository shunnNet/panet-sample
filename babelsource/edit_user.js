//https://stackoverflow.com/questions/2068344/how-do-i-get-a-youtube-video-thumbnail-from-the-youtube-api
//https://developers.google.com/youtube/v3/getting-started

const dragging_img = getEmptyDragImg();

const userEditComponents = {
    events : {
        template: `
        <section class="block min-h-500" >
            <header class="block__head">
                <i class="material-icons block__head__icon">list</i>
                <h4 class="block__head__title">活動</h4>
                <a href="/event/create/new" class="button--sub float-r">新增</a>
            </header>
            <section class="block__body" v-if="datas.length > 0">
                <div class="listBlock__list spreadBorderBottom spreadBorder--hover" v-for="data in datas">
                    <a :href="'/event/' + data._id" 
                        class="reset-a hover-lightup">
                            {{data.title}}
                    </a>
                    <div class="listBlock__list__iconBox float-r">
                        <a :href="'/event/edit/' + data._id" 
                            class="reset-a clickIconBox hover-lightup">
                            <i class="material-icons">mode_edit</i>
                        </a>
                        <a :href="'/event/edit/' + data._id + '/delete'" 
                            class="reset-a clickIconBox hover-lightup">
                            <i class="material-icons">clear</i>
                        </a>
                    </div>
                    
                </div>
            </section>
            
            <div class="block__body" v-else>
                <div class="block__item__noData">沒有可檢視的活動</div>
            </div>
            <footer class="block__foot" v-if="datas.length > 0">
                共建立了 {{ datas.length }} 個活動
            </footer>
        </section>
        `,
        props: ["datas"]
    },
    works  : {
        template: `
        <section class="block min-h-500" >
            <header class="block__head">
                <i class="material-icons block__head__icon">list</i>
                <h4 class="block__head__title">工作</h4>
                <a href="/work/create/new" class="button--sub float-r">新增</a>
            </header>
            <section class="block__body" v-if="datas.length > 0">
                <div class="listBlock__list spreadBorderBottom spreadBorder--hover" v-for="data in datas">
                    <a :href="'/work/' + data._id" 
                        class="reset-a hover-lightup">
                            {{data.title}}
                    </a>
                    <div class="listBlock__list__iconBox float-r">
                        <a :href="'/work/edit/' + data._id" 
                            class="reset-a clickIconBox hover-lightup">
                            <i class="material-icons">mode_edit</i>
                        </a>
                        <a :href="'/work/edit/' + data._id + '/delete'" 
                            class="reset-a clickIconBox hover-lightup">
                            <i class="material-icons">clear</i>
                        </a>
                    </div>
                    
                </div>
            </section>
            
            <div class="block__body" v-else>
                <div class="block__item__noData">沒有可檢視的工作</div>
            </div>
            <footer class="block__foot" v-if="datas.length > 0">
                共建立了 {{ datas.length }} 個工作
            </footer>
        </section>
        `,
        props: ["datas"]
    },
    ideas  : {
        template: `
        <section class="block min-h-500" >
            <header class="block__head">
                <i class="material-icons block__head__icon">list</i>
                <h4 class="block__head__title">想法</h4>
                <a href="/idea/create/new" class="button--sub float-r">新增</a>
            </header>
            <section class="block__body" v-if="datas.length > 0">
                <div class="listBlock__list spreadBorderBottom spreadBorder--hover" v-for="data in datas">
                    <a :href="'/idea/' + data._id" 
                        class="reset-a hover-lightup">
                            {{data.title}}
                    </a>
                    <div class="listBlock__list__iconBox float-r">
                        <a :href="'/idea/edit/' + data._id" 
                            class="reset-a clickIconBox hover-lightup">
                        <i class="material-icons">mode_edit</i>
                        </a>
                        <a :href="'/idea/edit/' + data._id + '/delete'" 
                            class="reset-a clickIconBox hover-lightup">
                            <i class="material-icons">clear</i>
                        </a>
                    </div>
                    
                </div>
            </section>
            
            <div class="block__body" v-else>
                <div class="block__item__noData">沒有可檢視的想法</div>
            </div>
            <footer class="block__foot" v-if="datas.length > 0">
                共建立了 {{ datas.length }} 個想法
            </footer>
        </section>
        `,
        props: ["datas"]
    },
    medias : {
        template: `
        <section class="block min-h-500" >
            <header class="block__head">
                <i class="material-icons block__head__icon">list</i>
                <h4 class="block__head__title">影音</h4>
                <a href="/media/create/new" class="button--sub float-r">新增</a>
            </header>
            <section class="block__body" v-if="datas.length > 0">
                <div class="listBlock__list spreadBorderBottom spreadBorder--hover" v-for="data in datas">
                    <a :href="'/media/' + data._id" 
                        class="reset-a hover-lightup">
                            {{data.title}}
                    </a>
                    <div class="listBlock__list__iconBox float-r">
                        <a :href="'/media/edit/' + data._id" 
                            class="reset-a clickIconBox hover-lightup">
                            <i class="material-icons">mode_edit</i>
                        </a>
                        <a :href="'/media/edit/' + data._id + '/delete'" 
                            class="reset-a clickIconBox hover-lightup">
                            <i class="material-icons">clear</i>
                        </a>
                    </div>
                    
                </div>
            </section>
            
            <div class="block__body" v-else>
                <div class="block__item__noData">沒有可檢視的影音</div>
            </div>
            <footer class="block__foot" v-if="datas.length > 0">
                共建立了 {{ datas.length }} 個影音
            </footer>
        </section>
        `,
        props: ["datas"]
    },
    account: {
        template: `
        <div class="block min-h-500" >
            <div class="block__head">
                <h4 class="block__head__title">帳戶資訊</h4>
            </div>
            <div class="block__body">
                <p class="pd-v-lg"><a href="#">重設您的密碼</a></p>
                <p class="pd-v-lg"><a href="#">重設您註冊的電子信箱</a></p>
                <p class="pd-v-lg"><a href="#">刪除您的帳戶</a></p>
            </div>
        </div>
        `,
        props: ["datas"]
    }
}
const page_data_default = {
    name: "",
    email: "",
    show_email: false,
    publish_status: false,
    birthday: "",
    skill: [],
    habits: [],
    area: [],
    concerned_topic: [],
    experience: [],
    now_job: "",
    want_to_try: [],
    fb_pages: "",
    description: "",
    desc_literal: "",
    account: {
        _id: "",
        email: "",
        fb_id: "",
        isActive: false,
    },
    medias: [],
    ideas: [],
    works: [],
    events: [],
    works: [],
    cover_image: "",
    cover_image_offset_y: "0%",
}
page_data = page_data ? page_data : page_data_default;
let default_cover_url = page_data.default_cover_url ? 
                        page_data.default_cover_url : page_data.cover_image ? 
                        page_data.cover_image : "/static/cover/works/default.jpg" 

Vue.component("events",userEditComponents.events)
Vue.component("works", userEditComponents.works)
Vue.component("ideas", userEditComponents.ideas)
Vue.component("medias",userEditComponents.medias)
Vue.component("account",userEditComponents.account)
Vue.component('multiselect', window.VueMultiselect.default)
Vue.component('vue-datetime', window.VueDatetime.Datetime);
Vue.component('validation-provider', VeeValidate.ValidationProvider);
Vue.component('validation-observer', VeeValidate.ValidationObserver);


const app = new Vue({
    el: "#content",
    data: {
        active_block: "user",
        skills: ENUM_SKILLS,
        areas: ENUM_CITYS,
        form: {
            ...page_data,
            default_cover_url: default_cover_url,
        },
        experience_form_active: false,
        experience_form_index: undefined,
        experience_form: {
            desc: "",
            count: "1"
        },
        drag_box: null,
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
    },
    methods: {
        add_tag(tag,field){
            this.form[field].push(tag)
        },
        processEditOperation(operation,vee) {
            vee.validate()
            this.form.description = operation.api.origElements.innerHTML;
            this.form.desc_literal = operation.api.origElements.innerText;
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
        set_cover_image(url){
            this.form.cover_image = url
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


