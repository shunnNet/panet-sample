VeeValidate.extend("required",{
    ...VeeValidate.Rules.required,
    message: "{_field_} 為必填"
})

VeeValidate.extend("email",{
    ...VeeValidate.Rules.Email,
    message: "{_field_} 需是電子信箱的地址"
})

VeeValidate.extend("ext",{
    ...VeeValidate.Rules.ext,
    message: "{_field_} 需為合法的檔案格式"
})

VeeValidate.extend("min_trim",{
    validate: function(value,args){
        return value.trim().length >= args.length
    },
    params:["length"],
    message: "{_field_} 字數至少 {length} 字"
})

VeeValidate.extend("max_trim",{
    validate: function(value,args){
        return value.trim().length <= args.length
    },
    params:["length"],
    message: "{_field_} 字數最多 {length} 字"
})

VeeValidate.extend("date_later",{
    params:["target",'target_name'],
    validate: function(value,args){
        return args.target ? new Date(value) > new Date(args.target) : true
    
        //return value.trim().length <= args.target
    },
    message: '時間需晚於 {target_name}'
})

VeeValidate.extend("date_earlier",{
    params:["target",'target_name'],
    validate: function(value,args){
        return args.target ? new Date(value) < new Date(args.target) : true;
        //return value.trim().length <= args.target
    },
    
    message: '時間需早於 {target_name}'
})

VeeValidate.extend("isYoutube",{
    validate: function(value){
        return value.match(/www\.youtube\.com\/watch\?v=/) !== null
    },
    
    message: '{_field_} 必須是合法的youtube網址 ( https://www.youtube.com/watch?v= {影片ID} )'
})

VeeValidate.configure({
    classes: {
        invalid: 'form__line--invalid',
        valid : 'form__line--valid'
    }
})

VeeValidate.extend("isEqualTo",{
    params:["target"],
    validate: function(value,args){
        return value === args.target
    },
    message: '兩次輸入要相同'
})


/*
  VeeValidate.extend('required', {
    validate: (value,args) => {
       return {
           required : true,
           valid : !['', null, undefined].includes(value)
       }
        return args.includes(value)
    },
    message: '必填',
    computesRequired: true
  });*/

  /*
VeeValidate.extend('required',{
    ...required,
    message : Message.messages.required
})*/


/*
VeeValidate.extend('email',{
    ...email,
    message : "這不是email"
})

 VeeValidate.extend('secret', {
    validate: value => value === 'example',
    message: '{_field_} is not the magic word'
  });



  VeeValidate.extend('test', {
    validate: (value,args) => {
       
        return args.includes(value)
    },
    message: function (fieldName,placeholder,para) {  
       
        return `${placeholder}`
    }
  });


*/