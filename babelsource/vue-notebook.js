const vueNotebook = {
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
            active_noteBook :this.default_block ,
            theme : {
                notebook : true,
                ...this.book_theme
            }
        }
    },
    methods:{
        switchTag(event,value){
            this.active_noteBook = value;
        }
    }
}