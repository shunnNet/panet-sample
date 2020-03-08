function openScrollPlaceholder(toOpen) {
    const newStatus = toOpen ? "block" : "none";
    document.getElementById("js-scrollbarPlaceholder").style.display = newStatus ;
    document.getElementById("js-scrollbarPlaceholder-nav").style.display = newStatus ;
    // only when index page
    if(toOpen){
        document.querySelector(".fixButtonGroup").classList.add("fixButtonGroup--addPlaceholder")
    }else{
        document.querySelector(".fixButtonGroup").classList.remove("fixButtonGroup--addPlaceholder")
    }
}

const page_data_default = {
    name:"",
    email:"",
    sex:"",
    birthday:"",
    skill:[],
    habits:[],
    cover_image:"",
    area:[],
    concerned_topic:[],
    experience:[],
    now_job:"",
    want_to_try:[],
    description:"",
    desc_literal:"",
    fb_pages:"",
    show_email:"",
    publish_status:"",
    medias: [],
    ideas: [],
    works: [],
    events:[]
}
page_data = page_data ? page_data : page_data_default;

const userComponents = {
    info : {
        template : `
        <article class="infoBlock block raised" style="overflow:hidden">
            <header class="block__head">
                <h3 class="block__head__title">{{ datas.name }}</h3>
                <span class="block__head__subDesc">{{ datas.now_job }}</span>
            </header>
            <section class="block__body">
                <div class="block__item__article">
                    <p v-if="datas.email && datas.show_email">Email： {{ datas.email }}</p>
                    <p v-if="datas.sex">性別： {{ datas.sex }}</p>
                    <p v-if="datas.birthday">年齡： {{ moment().diff(moment(datas.birthday),'years') }}</p>
        
                    <p v-if="datas.skill.length > 0">技能：</p>
                    <p>
                        <span class="tag" v-for="skill in datas.skill">{{skill}}</span>
                    </p>
                    <p v-if="datas.habits.length > 0">嗜好：</p>
                    <p>
                        <span class="tag" v-for="habit in datas.habits">{{habit}}</span>
                    </p>
                    <p v-if="datas.area.length > 0">活動區域：</p>
                    <p>
                        <span class="tag" v-for="area in datas.area">{{area}}</span>
                    </p>
                    
                    <p v-if="datas.experience.length > 0">經歷：</p>
                    <div v-for="exp in datas.experience" class="block lh-1-5 mg-b-5">
                        <div class="block__mobile inlineBlock__desktop pd-h-sm fw-bolder">
                            {{exp}}
                        </div>
                    </div>
                    <p v-if="datas.concerned_topic.length > 0">關注的議題：</p>
                    <p>
                        <span class="tag" v-for="issue in datas.concerned_topic">{{issue}}</span>
                    </p>
                    <p v-if="datas.want_to_try.length > 0">想嘗試：</p>
                    <p>
                        <span class="tag" v-for="want_to_try in datas.want_to_try">{{want_to_try}}</span>
                    </p>
                    
                </div>
                <article v-html="datas.description" class="block__item__userCustomDesc"></article>
            </section>
            <footer class="block__foot">
            </footer>
        </article>
        
        `,
        props:["datas"],
        methods:{
            moment(arg){
                return moment(arg)
            }
        }
    },
    medias : {
        template: `
        <section class="block raised" style="overflow:hidden">
            <header class="block__head">
                <i class="material-icons block__head__icon">list</i>
                <h4 class="block__head__title">影音</h4>
            </header>
            <section class="block__body" v-if="datas.length > 0">
                <div class="listBlock__list spreadBorderBottom spreadBorder--hover" v-for="data in datas">
                    <a :href="'/media/' + data._id" 
                        class="a__block hover-lightup">
                            {{data.title}}
                    </a>
                </div>
            </section>
            
            <section class="block__body" v-else>
                <div class="block__item__noData">沒有可檢視的影音</div>
            </section>
        
            <footer class="block__foot" v-if="datas.length > 0">
                共建立了 {{ datas.length }} 個影音
            </footer>
        </section>
        `,
        props: ["datas"]
    },
    events : {
        template: `
        <section class="block raised" style="overflow:hidden" >
            <header class="block__head">
                <i class="material-icons block__head__icon">list</i>
                <h4 class="block__head__title">活動</h4>
            </header>
            <section class="block__body" v-if="datas.length > 0">
                <div class="listBlock__list spreadBorderBottom spreadBorder--hover" v-for="data in datas">
                    <a :href="'/event/' + data._id" 
                        class="a__block hover-lightup">
                            {{data.title}}
                    </a>
                </div>
            </section>
            
            <section class="block__body" v-else>
                <div class="block__item__noData">沒有可檢視的活動</div>
            </section>
            <footer class="block__foot" v-if="datas.length > 0">
                共建立了 {{ datas.length }} 個活動
            </footer>
        </section>
        `,
        props: ["datas"]
    },
    works  : {
        template: `
        <section class="block raised" style="overflow:hidden">
            <header class="block__head">
                <i class="material-icons block__head__icon">list</i>
                <h4 class="block__head__title">工作</h4>
            </header>
            <section class="block__body" v-if="datas.length > 0">
                <div class="listBlock__list spreadBorderBottom spreadBorder--hover" v-for="data in datas">
                    <a :href="'/work/' + data._id" 
                        class="a__block hover-lightup">
                            {{data.title}}
                    </a>
                    
                </div>
            </section>
            
            <section class="block__body" v-else>
                <div class="block__item__noData">沒有可檢視的工作</div>
            </section>
            <footer class="block__foot" v-if="datas.length > 0">
                共建立了 {{ datas.length }} 個工作
            </footer>
        </section>
        `,
        props: ["datas"]
    },
    ideas  : {
        template: `
        <section class="block raised" style="overflow:hidden">
            <header class="block__head">
                <i class="material-icons block__head__icon">list</i>
                <h4 class="block__head__title">想法</h4>
            </header>
            <section class="block__body" v-if="datas.length > 0">
                <div class="listBlock__list spreadBorderBottom spreadBorder--hover" v-for="data in datas">
                    <a :href="'/idea/' + data._id" 
                        class="a__block  hover-lightup">
                            {{data.title}}
                    </a>
                
                    
                </div>
            </section>
            
            <section class="block__body" v-else>
                <div class="block__item__noData">沒有可檢視的想法</div>
            </section>
            <footer class="block__foot" v-if="datas.length > 0">
                共建立了 {{ datas.length }} 個想法
            </footer>
        </section>
        `,
        props: ["datas"]
    }
}

Vue.component("info", userComponents.info )
Vue.component("works", userComponents.works )
Vue.component("ideas", userComponents.ideas )
Vue.component("medias", userComponents.medias )
Vue.component("events", userComponents.events )
Vue.component("cue0",components.cue0);
Vue.component("cue1",components.cue1);


var app = new Vue({
    el: "#content",
    data: {
        util:{
            active_block : "info"
        },
        user: {
            info:{
                ...page_data
            },
            medias: page_data.medias,
            ideas: page_data.ideas,
            works: page_data.works,
            events:page_data.events,
        },
        max_height_active : false,
        vue_mounted : false
    },
    mounted() {
        this.vue_mounted = true
    },
    methods:{
        block_grow(ele){
            let padding_top = parseFloat( window.getComputedStyle(ele, null).getPropertyValue('padding-top') )
            ele.style['max-height'] = `${ele.scrollHeight + padding_top}px`
        },

        block_scroll(ele){
            ele.style['max-height'] = "500px"
        }
    }

})


/*
<script>
        FB.XFBML.parse(document.getElementById("js-fb-page"))
    </script>*/

