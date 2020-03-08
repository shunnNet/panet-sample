const vueMedia = {
    template: `
        <div class="vue__media" v-if="now.media_type">
            <img v-if="now.media_type.includes('image')" 
                class="img--fluid" 
                :src="now.media_route" alt="">

            <pdf-vuer v-else-if="now.media_type==='application/pdf'"
                      ref="pdfvuer" 
                      :restrictVuerWidth="restrictVuerWidth"
                      :src="now.media_route"></pdf-vuer>
            
            <iframe v-else-if="now.media_type==='youtube'"
                    class="form__fileBox__youtube"
                    :src="now.media_route" frameborder="0"
                    :style=" 'height : '+ object_height"></iframe>         
            
            <div v-if="navigation_active" class="vue__media__navigation color-sub hover-lightup"
                 style="right:0"
                 @click="move_page(1)">
                <i class="material-icons"> chevron_right </i>
            </div>
            <div v-if="navigation_active" class="vue__media__navigation color-sub hover-lightup" 
                 style="left:0"
                 @click="move_page(-1)">
                <i class="material-icons"> chevron_left </i>
            </div> 
        </div>
    `,
    props: ["media_list","height","fit_box","navigation","restrictVuerWidth"],
    data(){
        return {
            object_height : this.fit_box ? 
                            "100%" : ( this.height ?  this.height : "450px" ),
            medias : this.media_list ? this.media_list : [],
            component_height : this.fit_box ? '100%' : 'auto',
            nowIndex : 0,
            navigation_active : this.navigation ? this.navigation : false,
        }
    },
    computed: {
        now(){
            return this.medias[this.nowIndex]
        },
    },
    methods: {
        move_index(indexMove){
            let nowIndex = this.nowIndex;
            let newIndex = nowIndex + indexMove;
            
            newIndex = newIndex >= this.medias.length ? 
                       0 : (newIndex < 0 ? this.medias.length-1 : newIndex)
            this.nowIndex = newIndex;
            this.$emit('mediachange',newIndex)
            
        },
    }
        
}


const match48em = window.matchMedia("(max-width : 48em)");

function restrictVuerWidth(){
    const vuer = document.getElementById("pdfVuer")
    if (match48em.matches){
        vuer.style.width = document.documentElement.clientWidth + "px";
    }else{
        vuer.style.width = "100%";
    }
}
const pdfVuer = {
    template : `
    <div class="pdfVuer" id="pdfVuer" :class="{pdfVuer__fullScreen : fullScreenActive}">
        <div class="pdfVuer__toolBar" id="pdfVuer__toolBar">
            <div class="pdfVuer__toolBar__group">
                <button title="上一頁" class="pdfVuer__toolBar__button d-none-pad" @click="move_page(-1)">
                    <i class="material-icons"> chevron_left </i>
                </button>
                <button title="下一頁" class="pdfVuer__toolBar__button d-none-pad" @click="move_page(1)">
                    <i class="material-icons"> chevron_right </i>
                </button>
                <div title="跳頁" class="pdfVuer__toolBar__selectBox">
                    <select v-model="currentPageNum">
                        <option v-for=" (e,i) in Array(totalPage)" :value="i+1">{{i+1+"/"+totalPage}}</option>
                    </select>
                </div>
            </div>
            <div class="pdfVuer__toolBar__group">
                <div title="縮放" class="pdfVuer__toolBar__selectBox">
                    <select v-model="userSelectScale">
                        <option v-for=" option,i in userSelectScaleOptions " :value="option.value">{{option.title}}</option>
                    </select>
                </div>

                <button title="放大" class="pdfVuer__toolBar__button d-none-pad" @click="addScaleOptionIndex(1)">
                    <i class="material-icons""> add </i>
                </button>
                <button title="縮小" class="pdfVuer__toolBar__button d-none-pad" @click=" addScaleOptionIndex(-1)">
                        <i class="material-icons"> remove </i>
                </button>
            </div>
            <div class="pdfVuer__toolBar__group d-none-pad">
                <button class="pdfVuer__toolBar__button hover-lightup" @click="toggleFullScreen()">
                    <i title="全螢幕模式" class="material-icons" v-if="fullScreenActive"> fullscreen_exit </i>
                    <i title="視窗模式" class="material-icons" v-else> fullscreen </i>
                </button>
            </div>
        </div>
        
        <div class="pdfVuer__container" id="pdfVuer__container" 
             draggable 
             @dragstart="dragstart" 
             @click="onclick($event)">
            <canvas id="pdfVuer__canvas" class="form__fileBox__pdf"></canvas>
        </div>

    </div>
    `,
    props : ["src","restrictVuerWidth"]
    ,
    data (){
        return {
            viewer : null,
            toolBar: null,
            container : null,
            canvas : null,
            loadingTask : null,
            totalPage : 1,
            currentDocument : null,
            currentPageNum : 1,
            currentPage : null,
            currentScale : 1,
            userSelectScale : "fit_box",
            fullScreenActive: false,
            userSelectScaleOptions:[
                {  
                    value : 0.5,
                    title : "50%"
                },
                {  
                    value : 0.8,
                    title : "80%"
                },
                {  
                    value : 1,
                    title : "100%"
                },
                {  
                    value : 1.2,
                    title : "120%"
                },
                {  
                    value : 1.5,
                    title : "150%"
                },
                {  
                    value : 2,
                    title : "200%"
                },
                {  
                    value : "fit_box",
                    title : "容器大小"
                },
            ],
            dragging_img : getEmptyDragImg()
        }
    },
    watch:{
        src(){
            this.pdfPrepare()
        },
        pdfNowPage(newcurrentPageNum){
            if (this.canvas){
                this.pdfGetCurrentPage(this.currentDocument)
                    .then(page => this.pdfRenderPage(page))
            }
        },
        userSelectScale(newScale){
            if(this.canvas){
                let scale = 1;
                switch(newScale){
                    case "fit_box":
                        this.container.clientWidth
                        const viewportWidth = this.currentPage.getViewport({scale : 1}).width;
                        scale = this.container.clientWidth / viewportWidth
                    break;
                    default : 
                        scale = newScale
                    break;
                }

                this.scaleAndRerender(scale,this.currentPage)
            }
        },
        fullScreenActive(toActive){
            
            if (toActive){
                //this.container.style.height = window.screen.height - this.toolBar.clientHeight + "px"; // safari height 100% in fullscreen is eaqul to auto
                this.openFullScreen()
            }else{
                //this.container.style.height = "100%";
                this.exitFullScreen()
            }
        }
    },
    
    mounted() {
        const pdfVuer = this;
        this.pdfPrepare()
        //restrictVuerWidth()
        //window.onresize = restrictVuerWidth;
        
        document.body.ondragover = function(ev){
            const isTarget = ["pdfVuer__container","pdfVuer__canvas"].includes(ev.target.id);
            pdfVuer.dragging(ev.pageX,ev.pageY)
            ev.preventDefault()
            
        };
        document.body.ondrop = function(ev){ev.preventDefault()};
    },
    computed: {
        pdfNowPage(){
            return this.currentPageNum
        }
    },
    methods: {
        pdfPrepare(){
            this.viewer = document.getElementById("pdfVuer");
            this.canvas = document.getElementById("pdfVuer__canvas");
            this.container = document.getElementById("pdfVuer__container");
            this.toolBar = document.getElementById("pdfVuer__toolBar");
            
            if (this.canvas){
                this.pdfGetLoadingTask(this.src)
                    .then(pdf => this.pdfGetDocument(pdf))
                    .then(pdf => this.pdfGetTotalcurrentPageNum(pdf))
                    .then(pdf => this.pdfGetCurrentPage(pdf))
                    .then(page=> this.pdfSetPageFitBoxScale(page))
                    .then(page => this.pdfRenderPage(page))
            }
        },
        pdfGetLoadingTask(fileUrl){
            this.loadingTask = pdfjsLib.getDocument(fileUrl);
            return this.loadingTask.promise
        },
        async pdfGetDocument(pdf){
            this.currentDocument = pdf
            return this.currentDocument
        },

        async pdfGetCurrentPage(pdf){
            return pdf.getPage(this.currentPageNum).then(page => this.currentPage = page)
        },
        async pdfGetTotalcurrentPageNum(pdf){
            this.totalPage = pdf.numPages;
            return pdf
        },
        async pdfSetPageFitBoxScale(page){
            const desireWidth = this.container.clientWidth;
            const viewport = page.getViewport({scale: 1})
            const scaleValue = Math.floor(desireWidth / viewport.width * 100) / 100
            this.scale(scaleValue)
            return page
        },
        scale(value){
            this.currentScale = value
        },

        pdfRenderPage(page){
            //var CSS_UNITS = 96.0/ 72.0;
            var scaledViewport = page.getViewport({ scale: this.currentScale, });
            var context = this.canvas.getContext('2d');
            
            //canvas.width = scaledViewport.width * CSS_UNITS; 
            //canvas.height = scaledViewport.height* CSS_UNITS;
            this.canvas.width = scaledViewport.width ; 
            this.canvas.height = scaledViewport.height;
            
            var renderContext = {
                //transform: [CSS_UNITS, 0, 0, CSS_UNITS, 0, 0],
                canvasContext: context,
                viewport: scaledViewport
            };
            page.render(renderContext);
            
        },
        scaleAndRerender(newScale,page){
            this.scale(newScale)
            this.pdfRenderPage(page)
        },
        move_page(pageMove){
            let nowPage = this.currentPageNum;
            let newPage = nowPage + pageMove;
            
            newPage = newPage > this.totalPage ? 
                       1 : (newPage < 1 ? this.totalPage : newPage)
            this.currentPageNum = newPage;
        },
        addScaleOptionIndex(addNum){
            const nowIndex = this.userSelectScaleOptions.findIndex(option =>{
                return option.value == this.userSelectScale
            })

            let newIndex = nowIndex + addNum;
            newIndex = newIndex >= this.userSelectScaleOptions.length ? 0 : newIndex;
            newIndex = newIndex < 0 ? this.userSelectScaleOptions.length-1 : newIndex;
            this.userSelectScale = this.userSelectScaleOptions[newIndex].value
            
        },
        onclick(event){
            const xToContainer = event.offsetX;
            const containerWidthHalf = this.container.clientWidth / 2;
            const pageMove = containerWidthHalf - xToContainer >= 0 ? -1 : 1;
            this.move_page(pageMove)
        },
        dragstart(event) {
            event.dataTransfer.setDragImage(this.dragging_img, 0, 0);
            const target = event.currentTarget;
            const protoScrollLeft = target.scrollLeft;
            const protoMousePosX = event.pageX;
            
            const protoScrollTop = target.scrollTop;
            
            const protoWindowScrollTop = getBodyScrollEle().scrollTop
            const protoMousePosY = event.pageY;

            target.setAttribute("data-proto_mouse_pos_x", protoMousePosX)
            target.setAttribute("data-proto_scroll_left", protoScrollLeft)
            target.setAttribute("data-proto_mouse_pos_y", protoMousePosY)
            target.setAttribute("data-proto_scroll_top", protoScrollTop)
            target.setAttribute("data-proto_window_scroll_top", protoWindowScrollTop)

            target.setAttribute("data-til_last_mouse_y", 0)
        },
        dragging(nowMousePosX,nowMousePosY){ // firefox need get pageX on document dragover event
            const target = this.container;

            const protoWindowScrollTop = parseInt(target.dataset["proto_window_scroll_top"])
            const protoMousePosY = parseInt(target.dataset["proto_mouse_pos_y"]);

            const protoScrollTop = parseInt(target.dataset["proto_scroll_top"])
            
            const protoScrollLeft = parseInt(target.dataset["proto_scroll_left"])
            const protoMousePosX = parseInt(target.dataset["proto_mouse_pos_x"]);

            
            const moveX =  protoMousePosX - nowMousePosX;
            const nextLeft = protoScrollLeft + moveX;
            
            let moveY =  protoMousePosY - nowMousePosY;
            let nextWindowTop ;
            
            if (this.fullScreenActive){
                nextWindowTop = protoScrollTop + moveY;
                target.scrollTo(nextLeft,nextWindowTop)
            }else{
                // moveY will change when window scrollbar scroll, change value is last time scroll value's change
                moveY += parseInt(target.dataset["til_last_mouse_y"]);
                target.setAttribute("data-til_last_mouse_y", moveY)
                nextWindowTop = protoWindowScrollTop + moveY;
                
                target.scrollTo(nextLeft,0)
                getBodyScrollEle().scrollTo(0,nextWindowTop)

            }

        },

        toggleFullScreen(){
            this.fullScreenActive = !this.fullScreenActive
        },
        openFullScreen(){
            const elem = this.viewer;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
              } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
              } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
              } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
              }
        },
        exitFullScreen(){
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
              document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
              document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
              document.msExitFullscreen();
            }
        }

        
    
    },
}

