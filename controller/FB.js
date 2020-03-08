const request = require('request');
const util = require('util')
const fs = require('fs');

const GET = util.promisify(request.get)
const user_picture_route = "../public/cover/users/"


module.exports.getUserPicture = getUserPicture;
module.exports.getInfo = getInfo;
module.exports.getUsersEvents = getUsersEvents;


function generateFBUrl(node, token, query) {
    let t = token
    let n = node ? "/" + node : "";
    var q = "";
    for (let field in query) {
        q += `&${field}=${query[field]}`
    };

    return `https://graph.facebook.com/v5.0${n}?access_token=${t}${q}`
}
function getUserPicture(user_id_fb, token) {
    const node = `${user_id_fb}/picture`
    const url = generateFBUrl(node, token, {
        width: 320,
        height: 320,
        redirect: false
    })
    return requestPicture(url)
}

function requestPicture(url){
    return new Promise( (resolve,reject) => {
        request.get({url:url,json:true},(err,res,body) =>{
            if(!body.error){
                resolve(body.data.url)
            }else{
                reject(body.error.message)
            }
        })
    })
}

function getInfo(node, token, query){
    const url = generateFBUrl(node, token, query)
    const option = { url:url , json:true}
    return new Promise((resolve, reject) =>{
        request.get(option,(err,res,body) =>{
            if (!body.error){
                resolve(body.data)
            }else{
                console.log(err)
                reject(err)
            }
        })
    })
}

function getUsersEvents(user_id, token){
    const node = `${user_id}/events`;
    const query =  {
        fields : "description,name,place,start_time,id,rsvp_status,cover",
        limit : 10
    } ;
    return getInfo(node, token, query)
    //FIX : recursive
}


/*
getUserPicture("2401704350096966", token,"123456789").then(file_path =>{
    console.log(file_path);
},err => console.log(err))

getUsersEvents("2401704350096966", token).then( res =>{
    console.log(res[0].place.location);
})

//getInfo("2401704350096966", token,{fields:"id,name,email"}).then(res => console.log(res))
*/


/* download User Picture version
function getUserPicture(user_id_fb, token,user_id) {
    const node = `${user_id_fb}/picture`
    const url = generateFBUrl(node, token, {
        width: 320,
        height: 320,
        redirect: true
    })

    return requestPicture(url,user_id).then( response =>{
        return new Promise( resolve =>{
            let file_path = `${user_picture_route}${user_id}.jpg`
            fs.writeFile(file_path,response, () =>{
                resolve(file_path)
            })
        })
    }, err => Promise.reject(false))
}

function requestPicture(url,user_id){
    let buffers = [];
    return new Promise( (resolve,reject) => {
        request.get({url:url,json:true})
            .on('response', response => {
                response.on('data', buffer =>{ buffers.push(buffer)})
            })
            .on('error', err => reject(err))
            .on("close", () => {
                try {
                    let result = JSON.parse(buffers)
                    reject(result.error.message)
                }catch(err){
                    resolve( Buffer.concat(buffers) ) 
                }
            })
    })
}
*/