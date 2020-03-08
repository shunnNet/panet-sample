
let form_body = initQueryForm(submitted);
let search_field = submitted.field;
let search_option = {
    "user" : {
        template_id: "user_search",
        skill : ENUMS.SKILLS,
        area : ENUMS.CITY
    },
    "event" : {
        template_id : "event_search",
        location : ENUMS.CITY,
        type    : ENUMS.TYPES
    },
    "idea" : {
        template_id : "idea_search",
        demand : ENUMS.SKILLS,
        type    : ENUMS.TYPES
    },
    "work" : {
        template_id : "work_search",
        demand : ENUMS.SKILLS,
        location : ENUMS.CITY,
        type    : ENUMS.TYPES
    },
    "media" : {
        template_id : "media_search",
        type    : ENUMS.TYPES
    }
};

const queryComponents = {
    card : {
        template:
            `<article class=" pure-u-xl-1-3 pure-u-1-4 pure-u-lg-1-2 pure-u-sm-1">
                <a class="card bg-contrast spreadBorder spreadBorder--hover spreadBorder--focus" :href="link_url">
                    <header class="card__imageContainer">
                        <div class="card__imageFilter" v-bind:style="{backgroundImage:'url('+cover_img+')'}"></div>
                        <div class="card__image" v-bind:style="{backgroundImage:'url(' + cover_img + ')'}"></div>
                    </header>
                    <section class="card__content">
                        <slot name="body"></slot>
                    </section>
                    <footer class="card__foot">
                        <slot name="footer"></slot>
                    </footer>
                    
                </a>
            </article>
            `,
        props : ["link_url","cover_img"],
        
    },
    card__info : {
        template:`
        <article class="pure-u-md-1 pure-u-1-2">
            <a class="card__info bg-contrast spreadBorder spreadBorder--hover spreadBorder--focus" :href="link_url">
                <header class="card__head">
                    <slot name="header"></slot>
                </header>
                
                <section class="card__content">
                    <slot name="body"></slot>
                </section>
                
                <footer class="card__foot">
                    <slot name="footer"></slot>
                </footer>
                
            </a>
        </article>
        `,
        props : ["link_url"]
    },
    user_search : {
        template: `
        <div>
            <div class="form__line">
                <multiselect
                    v-model="form_body.skill"
                    placeholder="請選擇技能"
                    :options="options.skill"
                    :multiple="true"
                    :close-on-select="false">
                </multiselect>
            </div>
            
            <div class="form__line">
                
                    <select name="skill" class="form__select" multiple v-model="form_body.skill" hidden>
                        <option v-for="skill in options.skill" :value="skill">{{skill}}</option>
                    </select>
                    
                
                <div class="form__line__inputBox">
                    <select name="area" class="form__select" v-model="form_body.area">
                        <option value="" selected>--所在區域--</option>
                        <option v-for="area in options.area" :value="area">{{area}}</option>
                    </select>
                    <div class="form__line__inputBox__activeBorder"></div>
                </div>
            </div>
            <div class="form__line">
                <label class="form__checkBlock form__checkBlock--contrast" title="要有影音">
                    <input type="checkbox" name="q_showHaveMedia" v-model="form_body.q_showHaveMedia">
                    <span class="form__checkBlock__content">要有影音</span>
                </label>
            </div>
        </div>
            `,
        props:["options","form_body"]
    },
    media_search : {
        template: `
    
        <div class="form__line">
            <div class="form__line__inputBox">
                <select name="type" class="form__select" v-model="form_body.type">
                    <option value="" selected class="color-sub">--請選擇影音類型--</option>
                    <option v-for="type in options.type" :value="type">{{type}}</option>
                </select>
                <div class="form__line__inputBox__activeBorder"></div>
            </div>
            
        </div>
            `,
        props:["options","form_body"]
    },
    work_search : {
        template: `
        <div>
            <div class="form__line">
                <multiselect
                    v-model="form_body.demand"
                    placeholder="請選擇需求類型"
                    :options="options.demand"
                    :multiple="true"
                    :close-on-select="false">
                </multiselect>
            </div>
            <div class="form__line">
                <span class="form__subject">日期範圍：</span>
                <vue-datetime type='date' 
                              v-model="form_body.start_time"
                              input-class="form__input--sub"
                              hidden-name="start_time">
                </vue-datetime>
                <span> ~ </span>
                <vue-datetime type='date' 
                                v-model="form_body.end_time"
                                input-class="form__input--sub"
                                hidden-name="end_time">
                </vue-datetime>
                
            </div>
    
            <div class="form__line">
                <select name="demand" class="form__input--sub" v-model="form_body.demand" multiple hidden>
                    <option v-for="demand in options.demand" :value="demand">{{demand}}</option>
                </select>
                <span class="form__subject">工作地點：</span>
    
                <div class="form__line__inputBox">
                    <select name="location" class="form__select" v-model="form_body.location">
                        <option value="" selected>--不限--</option>
                        <option v-for="location in options.location" :value="location">{{location}}</option>
                    </select>
                    <div class="form__line__inputBox__activeBorder"></div>
                </div>
    
            </div>
            <div class="form__line">
                <label class="form__checkBlock form__checkBlock--contrast" title="顯示已結束的工作">
                    <input type="checkbox" name="q_showHaventEnd" v-model="form_body.q_showHaventEnd">
                    <span class="form__checkBlock__content">顯示已結束的工作</span>
                </label>
            </div>
        </div>
            `,
        props:["options","form_body"]
    },
    idea_search : {
        template: `
        <div>
            <div class="form__line">
                <multiselect
                    v-model="form_body.demand"
                    placeholder="請選擇需求"
                    :options="options.demand"
                    :multiple="true"
                    :close-on-select="false">
                </multiselect>
            </div>
            <div class="form__line">
                <select name="demand" class="form__input--sub" v-model="form_body.demand" multiple hidden >
                    <option v-for="demand in options.demand" :value="demand">{{demand}}</option>
                </select>
                <div class="form__line__inputBox">
                    <select name="type" class="form__select" v-model="form_body.type">
                        <option value="" selected>--點子類型--</option>
                        <option v-for="type in options.type" :value="type">{{type}}</option>
                    </select>
                    <div class="form__line__inputBox__activeBorder"></div>
                </div>
                
            </div>
        </div>
            `,
    
        props:["options","form_body"]
    },
    event_search : {
        template: `
        <div>
            <div class="form__line">
                <span class="form__subject">日期範圍：</span>
                <vue-datetime type='date' 
                            v-model="form_body.start_time"
                            input-class="form__select"
                            hidden-name="start_time">
                </vue-datetime>
                <span> ~ </span>
                <vue-datetime type='date' 
                            v-model="form_body.end_time"
                            input-class="form__select"
                            hidden-name="end_time">
                </vue-datetime>
            </div>
            <div class="form__line">
                <div class="form__line__inputBox mg-b-10-phone">
                    <select name="type" class="form__select" v-model="form_body.type">
                        <option value="" selected>--活動類型--</option>
                        <option v-for="type in options.type" :value="type">{{type}}</option>
                    </select>
                    <div class="form__line__inputBox__activeBorder"></div>
                </div>
    
                <div class="form__line__inputBox mg-l-10 mg-l-0-phone">
                    <select name="location" class="form__select" v-model="form_body.location">
                        <option value="" selected>--活動地點--</option>
                        <option v-for="location in options.location" :value="location">{{location}}</option>
                    </select>
                    <div class="form__line__inputBox__activeBorder"></div>
                </div>
            </div>
            <div class="form__line">
                <label class="form__checkBlock form__checkBlock--contrast" title="顯示已結束的活動">
                    <input type="checkbox" name="q_showHaventEnd" v-model="form_body.q_showHaventEnd">
                    <span class="form__checkBlock__content">顯示已結束的活動</span>
                </label>
            </div>
        </div>
    
            `,

        props:["options","form_body"]
    }
}

Vue.component('multiselect', window.VueMultiselect.default);
Vue.component('vue-datetime', window.VueDatetime.Datetime);
Vue.component("cue0", components.cue0);
Vue.component("card",queryComponents.card);
Vue.component("card__info",queryComponents.card__info);
Vue.component("user_search", queryComponents.user_search);
Vue.component("media_search", queryComponents.media_search);
Vue.component("work_search",queryComponents.work_search);
Vue.component("idea_search", queryComponents.idea_search);
Vue.component("event_search",queryComponents.event_search);


const app = new Vue({
    el:"#content",
    data:{
        view_mode : "card",
        hasNextDatas ,
        form_body,
        search_field,
        search_option,
        nowPage : 1,
        datas : queryResult,
        isMounted : false

    },
    computed:{
        main_content_show(){
            return this.isMounted ? { visibility: "visible" , opacity : 1} : {}
        }
    },
    mounted() {
        // ISSUE : if didn't use setTimeout , will no transition
        // https://github.com/vuejs/vue/issues/7706
        // use setTimeout to turn it on right after all main task done.
        
        setTimeout(() => {
            document.getElementById("curtain").addEventListener("transitionend",(event)=>{
                event.currentTarget.remove()
            })
            this.isMounted = true;

        }, 0);
        
    },

    methods:{
        moment(value){
            return moment(value)
        },
        infinityScroll(event){
            if (this.hasNextDatas){
                const nextPageButton = document.querySelector("#js-infinity-scroll")
                let vpHeight = window.innerHeight;
                let buttonTop = nextPageButton.getBoundingClientRect().top
                let topReachVpQuater = buttonTop <= (vpHeight * 5/6) ;
                
                if (topReachVpQuater){
                    app.query();
                }
            }
        },
        query(){
            this.hasNextDatas = null; //make v-else-if to loading animation
            this.nowPage++
            const reqUrl = `${originalUrl}&page=${this.nowPage}`;

            fetch(reqUrl,{
                method : "get",
                headers : {
                    "x-requested-with" : "XMLHttpRequest"
                }
            }).then(res => res.json(), error => error.text())
              .then(datas =>{
                 if (datas.length === 0){
                    this.hasNextDatas = false;
                 }else{
                    this.hasNextDatas = true;
                    this.datas.push(...datas)
                 }
              })
        }
    }
});

window.onscroll = app.infinityScroll;
bindEventFormToggleAdvOption();

function initQueryForm(submitted) {
    let init_form_body = {
        "user":{
            field : "user",
            qs : "",
            skill: [],
            area : "",
            q_showHaveMedia : false
        },
        "media":{
            field : "media",
            qs : "",
            type: ""
        },
        "work":{
            field : "work",
            qs : "",
            type: "",
            start_time : "",
            end_time : "",
            demand:[],
            location:"",
            q_showHaventEnd:false
        },
        "idea":{
            field : "idea",
            qs : "",
            type: "",
            demand : []
        },
        "event":{
            field : "event",
            qs : "",
            type: "",
            start_time : "",
            end_time : "",
            location:"",
            q_showHaventEnd:false
        },
    
    }
    let result = injectLastSubmittedForm(init_form_body)
    
    return result

    function injectLastSubmittedForm(init_form_body) {
        let submitted_field = submitted.field;
        for (let prop in submitted){
            init_form_body[submitted_field][prop] = submitted[prop]
        }
        return init_form_body
    }

}

function bindEventFormToggleAdvOption(){
    var toggleButtons = document.querySelectorAll(".toggle-button")
    for (var i=0,l=toggleButtons.length;i<l;i++){
        toggleButtons[i].addEventListener("click",toggleAdvOpts)
    }
}

function toggleAdvOpts(event){
    var toggleButton = event.currentTarget
    var advOptsBlock = document.getElementById("js-adv-opts")
    
    var isShow = advOptsBlock.classList.toggle("show");
    if (isShow){
        toggleButton.innerText = "隱藏進階選項"
    }else{
        toggleButton.innerText = "顯示更多選項"
    }

    
}
