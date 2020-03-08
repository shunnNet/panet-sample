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
    title: "",
    type: "",
    description: "",
    cover_image: "",
    owner: { _id:"", name:""},
    update_time: "",
    publish_status: false,
    media_storage_type: "",
    mime_type: "",
    media_route: "",
}
page_data = page_data ? page_data : page_data_default;

Vue.component("vue-media", vueMedia)
Vue.component("pdf-vuer",pdfVuer)
Vue.component("cue0",components.cue0)
Vue.component("cue1",components.cue1);


const app = new Vue({
    el: "#content",
    data: {
        medias: [],
        now: [page_data],
        vue_mounted : false
    },
    mounted() {
        this.vue_mounted = true
    },
    methods:{
        scrollToBlockByHash(event){
            if(event.target.hash){
                const selector = event.target.hash;
                const targetBlock = document.querySelector(selector)
                const stickBlockHeight = 120;
                scrollToNode(targetBlock,-stickBlockHeight,700)
            }
        },
    }
})


