
const SIDE_MENU = document.getElementById("js-side-menu") ;
const MENU_QUERY = document.getElementById("js-menu-query");
const OVERLAY = document.getElementById("js-overlay");

function closeAllMenus() {
    hideMenuQuery()
    hideSideMenu()
    openNavToolScene(false)
}

function toggleMenu() {
    let isShow = SIDE_MENU.classList.toggle("show-side-menu")
    if (isShow){
        hideMenuQuery()
    }
    openNavToolScene(isShow)
}

function toggleNavSearch(event){
    let isShow = MENU_QUERY.classList.toggle("menu__query--slideIn");
    if (isShow){
        hideSideMenu()
    }
    openNavToolScene(isShow)
}

function hideSideMenu() {
    SIDE_MENU.classList.remove("show-side-menu")
}

function hideMenuQuery() {
    MENU_QUERY.classList.remove("menu__query--slideIn")
}

function openNavToolScene(toOpen){
    openOverlay(toOpen)
    //openWindowScroll(!toOpen)
    //openScrollPlaceholder(toOpen)

}

function openScrollPlaceholder(toOpen) {
    const newStatus = toOpen ? "block" : "none";
    document.getElementById("js-scrollbarPlaceholder").style.display = newStatus ;
    document.getElementById("js-scrollbarPlaceholder-nav").style.display = newStatus ;
    
}

function openOverlay(toOpen) {
    const target = OVERLAY.classList;
    if (toOpen){
        target.add("d-block")
    }else{
        target.remove("d-block")
    }
    return target
}

function openWindowScroll(toOpen) {
    const el = document.scrollingElement || document.documentElement 
    const newStatus = toOpen ? "auto" : "hidden";
    
    el.style.overflow = newStatus;
}

function scrollToTop(){
    return scrollYTo(0);
}

function scrollToNode(node,offsetY=0,duration){
    let nodeHeadFromVpTop = node.getBoundingClientRect().top
    let scrollTop = getBodyScrollTop()
    scrollYTo(offsetY + scrollTop + nodeHeadFromVpTop,duration)
}

function scrollYTo(pos,duration=1000) {
    return new Promise(resolve =>{
        const scrollEle = document.scrollingElement || document.documentElement ;
        let startScrollTop = scrollEle.scrollTop;
        let maxScrollTop = scrollEle.scrollHeight - window.innerHeight;
        let minScrollTop = 0;
        pos = pos >= maxScrollTop ? maxScrollTop : pos;
        pos = pos <= minScrollTop ? minScrollTop : pos;

        let distance = pos - startScrollTop;
        let direction = distance >= 0 ? 1 : 0; // 1 is pos go up , 0 is go down
        let startTime = null;

        const errorRange = 1; // 誤差 (tolerance?)
        const targetPos = pos;
        const totalTime = duration;
        window.requestAnimationFrame(scrollToTopAnimate);
        
        function scrollToTopAnimate(timestamp) {
            if(!startTime){
                startTime = timestamp;
            }
            let progress = timestamp - startTime; // y-axis progress
            let nextPos = startScrollTop + distance * easeOutQuart(progress / totalTime) ;
            
            // 1. scale progress/1500 to range 0~1 
            // 2. distance is total scroll Length
            // 3. nextPos will 0 when progress/totalTime is 1
            scrollEle.scrollTo(0,nextPos);
            let haventInErrorRange = direction ? nextPos < targetPos - errorRange :
                                                 nextPos > targetPos + errorRange
            
            if(haventInErrorRange){ 
                window.requestAnimationFrame(scrollToTopAnimate);
            }else{
                scrollEle.scrollTo(0,targetPos);
                resolve(true);
            }
        }
    })
    
}

function easeOutQuart(t){// https://gist.github.com/gre/1650294
    return  1-(--t)*t*t*t
}

function getBodyScrollTop() { 
    const el = document.scrollingElement || document.documentElement 
    return el.scrollTop 
}

function getBodyScrollEle(){
    return document.scrollingElement || document.documentElement 
}

function historyDontTrackScrollStatus(){
    if (history.scrollRestoration){
        history.scrollRestoration = "manual"
    }
}

const components = {
    cue0 : {
        template: `
        <div id="js-scroll-top" 
             class="iconButton"
             :class="{'iconButton--showCueText' : cue0.isShow}"
             :data-content="cue0.content"
             @click="cue0_scrollToTop()"
             @mouseenter="cue0_show(true)"
             @mouseleave="cue0_show(false)">
            <i class="material-icons"> expand_less </i>
        </div>
    
            `,
        data (){
            return {
                cue0: {
                    content : "Cue 0 : Go to top",
                    isShow : false
                },
                msg_finishing : "Cue 0 : 完成" ,
                msg_running : "Cue 0 : 走...",
                msg_standBy : "Cue 0 : Go to top"

            }
        },
        methods: {
            cue0_show(newStatus){
                this.cue0.isShow = newStatus;
                return this
            },
            cue0_msg(content){
                this.cue0.content = content;
                return this
            },
            cue0_scrollToTop(event) {
                
                this.cue0_msg(this.msg_running)
                    .cue0_show(true);
    
                scrollToTop().then(r => {
                    this.cue0_msg(this.msg_finishing);
    
                    setTimeout(()=>{ 
                        this.cue0_msg(this.msg_standBy)
                            .cue0_show(false);
                        
                    },1200)
                })
            },
        },
    },
    cue1 : {
        template: `
        <a  :href="this.href"
             class=" reset-a iconButton iconButton--lightup "
             :class="{'iconButton--showCueText' : cue1.isShow}"
             :data-content="cue1.content"
             @click="cue1_edit()"
             @mouseenter="cue1_show(true)"
             @mouseleave="cue1_show(false)">
            <i class="material-icons"> edit </i>
        </a>
    
            `,
        data (){
            return {
                cue1: {
                    content : "Cue 1 : Edit Page",
                    isShow : false
                },
                msg_running : "Cue 1 : 走...",
                msg_standBy : "Cue 1 : Edit Page"
            }
        },
        props : ["href"],
        methods: {
            cue1_show(newStatus){
                this.cue1.isShow = newStatus;
                return this
            },
            cue1_msg(content){
                this.cue1.content = content;
                return this
            },
            cue1_edit(event) {
                this.cue1_msg(this.msg_running)
                    .cue1_show(true);
            },
        },
    },
    vueNotebook : {
        template : `
        <div :class="theme">
            <div class="notebook__tagBox">
                <div v-for="noteblock in note_blocks" class="notebook__tagBox__tag" 
                     @click="switchTag($event,noteblock.value)" 
                     :class="{'notebook__tagBox__tag--active' : active_noteBook == noteblock.value}">
                     {{noteblock.name}}
                </div>
            </div>
            <div class="notebook__unit">
                <slot></slot>
                <slot v-for="noteblock in note_blocks" 
                :name="noteblock.value" 
                v-if="active_noteBook === noteblock.value "></slot>
                
    
            </div>
        </div>
        `,
        props: ['default_block','note_blocks','book_theme'],
        data (){
            return {
                active_noteBook :this.default_block,
                theme : {
                    notebook : true,
                    "notebook--contrast" : this.book_theme === "contrast"
                }
            }
        },
        methods:{
            switchTag(event,value){
                this.active_noteBook = value;
            }
        }
    }
}

const MEDIUM_SETTING = {
    options: {
        toolbar: {
            buttons: ['bold', 'italic', 'underline', 'anchor','h3',
                'strikethrough', 'unorderedlist', 'orderedlist',
                'justifyLeft', 'justifyCenter', 'justifyRight'//,
                //'image' (字數問題)
            ],
            /*
            static: true,
            align : 'left'
            */
        },
        placeholder: {
            text: '請在這裡輸入內容',
        }
    }
    
}

function getFilesUrl(files){
    let results = [];
    files.forEach((file)=>{
        var url = getFileUrl(file)
        results.push(url)
    })
    return results
}

function getFileUrl(file) {
    return window.URL.createObjectURL(file)
}

function getEmptyDragImg(){
    const dragging_img = new Image();
    dragging_img.src = '/static/images/transparent.png';
    return dragging_img
}