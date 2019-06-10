const firebase = require("firebase");
const functions = require('firebase-functions');
const requestP = require("request-promise-native");
const {sendJoinMessage} = require("../join/join");

const {
    getPerson
} = require("../person_manager/person_manager.js");

const getFBDB = firebase.database;

const WALLPAPER_KEY = "current_wallpaper";

// setup function
(async()=>{
    setImmediate(()=>{
        // setupPhoneWallpaperDBWatcher();
    });
})()

function getWallpaperDBLocation(person){
    if( person===undefined ){
        throw new Error("person===undefined");
    }
    return `${person}/phone/wallpaper`;
}

async function getCurrentWallpaper( person_id ){

    if( person_id===undefined ){
        throw new Error("person===undefined");
    }

    // TODO change how this works... I don't know why I have to parse this like it is
    const wallpaper_obj = JSON.parse(JSON.stringify(await getFBDB().ref( getWallpaperDBLocation(person_id) ).once('value')))

    if(wallpaper_obj===undefined){
        return "undefined";
    }

    const current_wallpaper = decodeURIComponent(wallpaper_obj[WALLPAPER_KEY]) || "undefined";
    return current_wallpaper;
}

async function getNewWallpaper(person_id){

    if( person_id===undefined ){
        throw new Error("person_id===undefined");
    }

    const reddit_post = await getNewRedditPost();

    const {current_wallpaper,success} = await setCurrentWallpaper({person_id, reddit_post})
    return current_wallpaper;
}

async function setCurrentWallpaper({person_id, reddit_post, img_url}){

    if( person_id===undefined ){
        throw new Error("person_id===undefined");
    }
    if( reddit_post===undefined && img_url===undefined ){
        throw new Error("reddit_post===undefined && img_url===undefined");
    }

    let final_img_url = img_url;

    if( reddit_post!==undefined ){
        console.log(`reddit_post is ${JSON.stringify(reddit_post)}`);
        final_img_url = getRedditImage(reddit_post);
    }

    let success = "undefined";
    let error = "undefined";
    try{

        const promise_array = [];

        promise_array.push( setDBCurrentWallpaper( person_id, final_img_url ) );
        promise_array.push( updateRecentWallpaperArray( person_id, final_img_url ) );

        await Promise.all();

        success = true;
        error = false;
        console.log("setting/saving reddit image success!");
    }catch(e){
        success = false;
        error = e;
        console.error("error in setting/saving reddit image");
    }

    console.log("setCurrentWallpaper done");

    const toReturn = {
        current_wallpaper: await getCurrentWallpaper(person_id),
        success,
        error
    };

    console.log({toReturn});

    return toReturn ;
}

const debug_global = {};

async function callJoinSetWallpaper( person_id, img_url ){
    const {apikey} = getPerson( person_id ).join;
    
    const deviceId = "group.android";
    const wallpaper = img_url;
    const lockWallpaper = img_url;

    if( apikey===undefined ){
        return "apikey===undefined";
    }

    const join_obj = {
        deviceId,
        wallpaper,
        lockWallpaper
    };

    return await sendJoinMessage( join_obj, apikey ).then((r)=>{
        return {
            join_response:JSON.parse(r)
        }
    });
}

module.exports = {
    getCurrentWallpaper,
    getNewWallpaper,
    setCurrentWallpaper,
    getDebugGlobal:()=>{return debug_global}
};

async function getNewRedditPost(){

    const reddit_posts =  await(async()=>{

        const promise_array = [];

        promise_array.push( getRedditPosts({sub:"mostbeautiful"}) );
        promise_array.push( getRedditPosts({sub:"earthporn"}) );

        const [mostbeautiful_posts,earthporn_posts] = await Promise.all(promise_array);

        return mostbeautiful_posts.concat(earthporn_posts);
    })();

    console.warn("blindly returning top post at the moment");

    const index = parseInt(Math.random()*reddit_posts.length);

    console.log(`reddit_posts.length=${JSON.stringify(reddit_posts.length)}`)
    console.log(`index=${index}`)
    
    return reddit_posts[index] || "undefined";
}

async function getRedditPosts({sub,sort,count,time}){

    sub = sub!==undefined ? sub : "earthporn";
    sort = sort!==undefined ? sort : "top";
    count = count!==undefined ? count : 20;
    time = time!==undefined ? time : "day";

    const reddit_url = `https://www.reddit.com/r/${sub}/${sort}.json?count=${count}&t=${time}`;
    console.log(JSON.stringify({reddit_url}));
    let result = await requestP(reddit_url);
    result = JSON.parse(result);
    return result.data.children;
}

function getRedditImage( reddit_post ){

    let toReturn;
    
    if( reddit_post==="undefined" || reddit_post===undefined ){
        throw new Error("reddit_post can not be undefined");
    }else if( typeof reddit_post === "object" ){
        toReturn = reddit_post.data.url;
        console.log("got reddit post object");
    }else{
        throw new Error("getRedditImage can not handle post links yet");
        // const post_obj = getRedditPostFromUrl(reddit_post);
        // toReturn = getRedditImage( post_obj );
        // console.log("got reddit post url");
    }

    return toReturn;
}

async function setDBCurrentWallpaper( person_id, final_img_url ){
    await getFBDB().ref(`${getWallpaperDBLocation(person_id)}/${WALLPAPER_KEY}`).set(final_img_url);
}

async function updateRecentWallpaperArray( person_id, final_img_url ){
    console.warn("updateRecentWallpaperArray is in development ");
}

module.exports.database_watch_events= [
    {
        export_name:"phoneWallpaperChangeWatcher",
        ref_str:"/{person_id}/phone/wallpaper/current_wallpaper",
        watchFunctionType:"onWrite",
        watchFunction:async function(change, context){
            console.log(change);
            console.log(context);

            // Exit when the data is deleted.
            if (!change.after.exists()) {
                console.log("!data_snapshot.after.exists()");
                return null;
            }

            const {person_id} = context.params;
            const final_img_url = change.after.val();
            console.log(`${person_id} wallpaper updated to ${final_img_url}`);
            await callJoinSetWallpaper( person_id, final_img_url );
            console.log("set wallpaper request made");
        },
    }
];