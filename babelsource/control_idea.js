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


historyDontTrackScrollStatus()

const page_data_default = {
    title:"",
    type:"",
    start_time:"",
    end_time:"",
    location:"",
    description:"",
    cover_image:"",
    cover_image_offset_y:"0%",
    publish_status:false,
    demand: []
}
Vue.component("cue0",components.cue0);
Vue.component("cue1",components.cue1);

const app = new Vue({
    el: "#content",
    data: {
        ...page_data,
        vue_mounted : false
    },
    mounted() {
        this.vue_mounted = true
    },
    methods: {
        scrollToBlockByHash(event){
            if(event.target.hash){
                const selector = event.target.hash;
                const targetBlock = document.querySelector(selector)
                const stickBlockHeight = 120;
                scrollToNode(targetBlock,-stickBlockHeight,700)
            }
        }
    },  
})

