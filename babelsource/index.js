let APP ;
let NAV ;
const MAIN_NAV_HEIGHT = 70;
let mediaWatcher48 = window.matchMedia("(max-width: 48em)");
let mediaWatcher64 = window.matchMedia("(max-width: 64em)");


// word cloud preset
const WORD_CLOUD_TARGET_SELECTOR = '#d3'; 
const clouds = [
    [
        { word: "講座", em: 40 },
        { word: "生活", em: 40 },
        { word: "分享", em: 30 },
        { word: "身體記憶", em: 30 },
        { word: "身體", em: 30 },
        { word: "台灣人", em: 30 },
        { word: "史坦尼", em: 20 },
        { word: "演員", em: 20 },
        { word: "強制性", em: 20 },
        { word: "跨界", em: 20 },
        { word: "表演者", em: 20 },
        { word: "網路空間", em: 20 },
        { word: "生活化", em: 20 },
        { word: "回憶", em: 20 },
        { word: "在地歷史", em: 20 },
        { word: "空間性", em: 15 },
        { word: "訓練方法", em: 15 },
        { word: "網路與平面", em: 15 },
        { word: "導演的參與", em: 15 },
        { word: "地點", em: 10 },
        { word: "在地結合", em: 10 },
        { word: "性別", em: 10 },
        { word: "革命", em: 10 },
        { word: "平面設計", em: 10 },
        { word: "展示性", em: 10 }
    ],
    [
        { word: "戶外演出", em: 40 },
        { word: "游擊", em: 40 },
        { word: "直播", em: 40 },
        { word: "App", em: 30 },
        { word: "事件", em: 30 },
        { word: "任務", em: 30 },
        { word: "音樂", em: 30 },
        { word: "舞蹈", em: 30 },
        { word: "戲劇", em: 20 },
        { word: "總體藝術", em: 20 },
        { word: "城市地圖", em: 20 },
        { word: "網路空間", em: 20 },
        { word: "生活化", em: 20 },
        { word: "裝置", em: 20 },
        { word: "社會現象", em: 20 },
        { word: "城市", em: 15 },
        { word: "風景", em: 15 },
        { word: "網路", em: 15 },
        { word: "台北市", em: 15 },
        { word: "沒有注意", em: 15 },
        { word: "手機", em: 10 },
        { word: "環狀線", em: 10 },
        { word: "各區特色", em: 10 },
        { word: "社區再生", em: 10 },
        { word: "藝術推廣", em: 10 }
    ],
];
const fill = d3.scaleLinear().domain([10, 15, 20, 30, 40]).range(["#8c564b", "#1f77b4", "#d62728", "#2ca02c", "#ff7f0e"]);
const size = d3.scaleLinear().domain([10, 40]).range([16, 80]) ;

// process

bindEventListener();
historyDontTrackScrollStatus()


function bindEventListener(){
    window.addEventListener('DOMContentLoaded', initVueApp)
    window.onload = showVueApp;

    mediaWatcher48.addListener(closeMenusIfMediaNotMatch)
    mediaWatcher64.addListener(closeMenusIfMediaNotMatch)
    window.onscroll = updateVueScrollData;
    window.onresize = makeIntroFullWindow;
}

function closeMenusIfMediaNotMatch(watcher) {
    if (!watcher.matches){
        closeAllMenus() 
    }
}

function updateVueScrollData(event) { 
    APP.updateVpData()
}

function showVueApp(event){
    updateVueScrollData(event)
    APP.showPage()
}

function makeIntroFullWindow(event) {
    document.getElementById("js-full-window").style.height = `${window.innerHeight - 70}px`;
}

function initCloudContainer(){
    d3.select(WORD_CLOUD_TARGET_SELECTOR)
     .append("svg")
     .attr("width", "100%")
     .attr("height", "100%")
     .append("svg")
     .attr("x", "50%")
     .attr("y", "50%")
     .attr("overflow", "visible")
     .append("g")
     .selectAll("text")
     .data(Array(25))
     .enter().append("text")
}

function updateCloudProcess(data) {
    const container = document.querySelector(WORD_CLOUD_TARGET_SELECTOR);

    const cloud = data.map(function (item, i) {
        return {
            text: item.word,
            em: item.em,
            size: size(item.em)
        }
    })
    d3.layout.cloud()
             .size([container.clientWidth, container.clientHeight])
             .words(cloud)
             .font("Noto Sans TC")
             .fontSize(function (d) { return d.size; })
             .rotate(0)
             .padding(0)
             .on('end', drawCloud)
             .start()
}

function drawCloud(cloud) {
    let protoSelection = d3.select("#d3")
                           .select("svg")
                           .select("svg")
                           .select("g")
                           .selectAll("text");

    protoSelection.transition()
                  .duration(700)
                  .attr("transform", function (d) {
                      return "translate(0,0)";
                  })
                  .style("fill-opacity", 0)
                  .end()
                  .then(() => {
                      let updateSelection = protoSelection.data(cloud);
                      updateSelection.exit().remove()
                      updateSelection.enter()
                                     .append("text")
                                     .merge(protoSelection)
                                     .style("fill", (d, i) => { return fill(d.em) })
                                     .style("font-size", function (d) { return d.size + "px"; })
                                     .style("font-family", "Noto Sans TC")
                                     .attr("text-anchor", "middle")
                                     .text(function (d) { return d.text; })
                                     .transition()
                                     .duration(700)
                                     .attr("transform", function (d) {
                                         return `translate( ${d.x} , ${d.y} )`;
                                     })
                                     .style("fill-opacity", 1)
                    })
}

function initVueApp(){
    Vue.component("cue0", components.cue0)

    APP = new Vue({
        el: "#vue-content",
        data: {
            vp : {
                height : 0,
                scrollTop : 0,
                fake_search_top : 0,
                work_cards_top  : 0,
                idea_banner_top : 0,
                media_banner_top: 0,
                event_banner_top: 0,
                welcome_banner_top: 0,
                join_number_has_ran: false,
                background_normal_line_top: 71
            },
            documentLoaded: false,
            fake_search: {
                list: {
                    "演員": [
                        {
                            title: "吳曉萱 / 自由工作者",
                            tags: ["演員", "彈吉他"]
                        },
                        {
                            title: "張小明 / 導演",
                            tags: ["導演", "音樂設計", "演員"]
                        },
                        {
                            title: "張曉芬 / 演員",
                            tags: ["演員", "表演教學"]
                        },

                    ],
                    "舞者": [
                        {
                            title: "潘小維 / 自由工作者",
                            tags: ["舞者", "舞蹈教學"]
                        },
                        {
                            title: "曾欣欣 / 演員",
                            tags: ["演員", "舞者"]
                        },
                        {
                            title: "李鴻 / 舞者",
                            tags: ["舞者"]
                        },

                    ]
                },
                qs: "舞者",
                qs_list: ["演員", "舞者"],
                result: [
                    {
                        title: "潘小維 / 自由工作者",
                        tags: ["舞者", "舞蹈教學"]
                    },
                    {
                        title: "曾欣欣 / 演員",
                        tags: ["演員", "舞者"]
                    },
                    {
                        title: "李鴻 / 舞者",
                        tags: ["舞者"]
                    },

                ],
                qs_iter: [],
                now : null,
                active : false,
                loop : Promise.resolve(true)
            },
        },
        mounted() {
            document.querySelector(".backgroundFilter").style.height = window.screen.availHeight + "px"
            NAV = document.querySelector(".mainNav") ; // need refer after vue mounted, for proto ele will replace by v-ele
            this.openNavIndexLayout(true) ;
            
            makeIntroFullWindow() ;
            initCloudContainer() ;
            updateCloudProcess(clouds[0]) ;

            this.setNewFakeSearchIter() 
                .startFakeSearchLoop() ;
             //document.getElementById("js-top-box").style.visibility = "visible";
            //document.getElementById("js-top-box").style.opacity = "1";
        },
        computed:{
            fake_search_hide(){
                return this.vp.fake_search_top > (this.vp.height / 2) ;
            },
            work_cards_hide(){
                return this.vp.work_cards_top > (this.vp.height / 1.5) ;
            },
            idea_banner_hide(){
                return this.vp.idea_banner_top > (this.vp.height / 2.5) ;
            },
            /*
            media_banner_hide(){
                return this.vp.media_banner_top > (this.vp.height / 1.5) ;
            },*/
            event_cards_hide(){
                return this.vp.event_banner_top > (this.vp.height / 2.5) ;
            },
            media_bg(){
                const boxHeight = document.getElementById("js-media_banner").clientHeight;
                const topWhenBoxCenterAtVpCenter = (this.vp.height - boxHeight ) / 2 ;
                const boxOffset =  this.vp.media_banner_top - topWhenBoxCenterAtVpCenter; 
                const customOffsetY = -50; 
                // boxOffset is 0 when banner center at Vp center
                // customOffset adjust position when container at center
                return {
                    //front : `${ boxOffset * 0.62}px`,
                    far   : `${ -50 + boxOffset * 0.2}px`
                }
                
            },
            join_number_active(){
                return this.vp.welcome_banner_top <= (this.vp.height / 1.2);
            },
            reach_normal_background_line(){
                return this.vp.background_normal_line_top <= 0;
            },
        },
        watch: {
            join_number_active(newValue,oldValue){
                let needRun = this.join_number_active && !this.vp.join_number_has_ran;
                if (needRun){
                    d3.select("#js-join_number")
                      .transition()
                      .duration(1500)
                      .style("opacity",1)
                      .textTween(function() {
                            return d3.interpolateRound(1000, 5566);
                      })
                    this.vp.join_number_has_ran = true;
                }
            },
            reach_normal_background_line(isReach,oldValue){
                this.openNavIndexLayout(!isReach);
            },

        },
        methods: {
            openNavIndexLayout(toOpen){
                if (toOpen){
                    NAV.classList.add("nav--indexPage");
                }else{
                    NAV.classList.remove("nav--indexPage");
                }
                return this
            },

            updateVpData(){
                this.vp.height = window.innerHeight;
                this.vp.scrollTop = getBodyScrollTop();
                this.vp.fake_search_top = document.getElementById("js-fake_search").getBoundingClientRect().top ;
                this.vp.work_cards_top = document.getElementById("js-work_cards").getBoundingClientRect().top;
                this.vp.idea_banner_top = document.getElementById("js-idea_banner").getBoundingClientRect().top;
                this.vp.media_banner_top = document.getElementById("js-media_banner").getBoundingClientRect().top ;
                this.vp.event_banner_top = document.getElementById("js-event_banner").getBoundingClientRect().top;
                this.vp.welcome_banner_top = document.getElementById("js-welcome_banner").getBoundingClientRect().top;
                this.vp.background_normal_line_top =  document.getElementById("js-background_normal_line").getBoundingClientRect().top - MAIN_NAV_HEIGHT;
            },

            showPage(){
                this.documentLoaded = true;
                document.getElementById("curtain").addEventListener("transitionend",(event)=>{
                    event.currentTarget.remove()
                })
            },
            setNewFakeSearchIter() {
                this.fake_search.qs_iter = this.fake_search.qs_list.values() ;
                return this
            },
            startFakeSearchLoop: async function () {
                this.fake_search.now = this.clearFakeSearch();
                
                let needContinue = true;
                while (needContinue) {
                    var result = await this.fake_search.now.then(status => {
                        if (status === "clear end") {
                            const nextWord = this.iterSearchWord()
                            return this.newFakeSearch(nextWord);
                        } else {
                            return this.clearFakeSearch();
                        }
                    })
                    
                    // needContinue = !this.fake_search_hide;
                    this.fake_search.now = Promise.resolve(result)
                }
                return true
            },

            iterSearchWord() {
                var next = this.fake_search.qs_iter.next();
                if (next.done) {
                    this.setNewFakeSearchIter()
                    next = this.fake_search.qs_iter.next()
                }
                return next.value
            },

            newFakeSearch(target) {
                return new Promise((resolve, reject) => {
                    const after = 1500;
                    const perChar = 500;
                    for (let i = 0; i < target.length; i++) {
                        const char = target[i];
                        const isLastChar = i === target.length - 1;

                        setTimeout(() => {
                            this.fake_search.qs += char
                            if (isLastChar) {
                                this.show_fake_search(this.fake_search.qs)
                                resolve("input end")
                            }
                        }, after + i * perChar);

                    }
                })
            },

            clearFakeSearch() {
                return new Promise((resolve, reject) => {
                    const after = 3000;
                    const perChar = 500;
                    if (!this.fake_search.qs.length){
                        resolve("clear end");
                        return
                    }
                    for (let i = this.fake_search.qs.length - 1; i >= 0; i--) {
                        const char = this.fake_search.qs[i];
                        const isLastChar = i === 0;
                        setTimeout(() => {
                            this.fake_search.qs = this.fake_search.qs.replace(char, "")
                            if (isLastChar) {
                                resolve("clear end")
                            }
                        }, after + (this.fake_search.qs.length - 1 - i) * perChar);
                    }
                    
                })
            },
            show_fake_search(value) {
                this.fake_search.result = this.fake_search.list[value]
            }
        }
    })

}

// OVERWRITE global function
function openScrollPlaceholder(toOpen) {
    const newStatus = toOpen ? "block" : "none";
    document.getElementById("js-scrollbarPlaceholder").style.display = newStatus ;
    document.getElementById("js-scrollbarPlaceholder-nav").style.display = newStatus ;
    // only when index page
    if(toOpen){
        document.querySelector(".fixButtonGroup").classList.add("fixButtonGroup--addPlaceholder")
        document.querySelector(".backgroundFilter").classList.add("backgroundFilter--addPlaceholder")
    }else{
        document.querySelector(".fixButtonGroup").classList.remove("fixButtonGroup--addPlaceholder")
        document.querySelector(".backgroundFilter").classList.remove("backgroundFilter--addPlaceholder")
    }
}
