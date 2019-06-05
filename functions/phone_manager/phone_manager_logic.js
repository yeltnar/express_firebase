const firebase = require("firebase");
const functions = require('firebase-functions');
const requestP = require("request-promise-native");

const {
    getPerson
} = require("../person_manager/person_manager.js");

const getFBDB = firebase.database;

const WALLPAPER_KEY = "current_wallpaper";

// setup function
(async()=>{
    setImmediate(()=>{
        setupPhoneWallpaperDBWatcher();
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
        final_img_url = getRedditImage(reddit_post);
    }

    let success = "undefined";
    let error = "undefined";
    try{
        await callJoinSetWallpaper( person_id, final_img_url );
        // save set wallpaper to DB, if success 
        await getFBDB().ref(`${getWallpaperDBLocation(person_id)}/${WALLPAPER_KEY}`).set(final_img_url);
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

// TODO use this to watch DB for change then reflect that change on phone 
async function setupPhoneWallpaperDBWatcher(){
    console.warn("setupPhoneWallpaperDBWatcher is not done yet");

    const person_id = "drew";

    try{
        console.log("setupPhoneWallpaperDBWatcher try");
        console.log(`${getWallpaperDBLocation(person_id)}/${WALLPAPER_KEY}`);

        // console.log(JSON.parse(JSON.stringify(await getFBDB().ref( getWallpaperDBLocation(person_id) ).once('value'))));

        // const ref = functions.database.ref( getWallpaperDBLocation(person_id) );
        const ref = functions.database.ref( "/date" );
        console.log("setupPhoneWallpaperDBWatcher after set ref");
        // console.log(ref);
        ref.onWrite(async(snapshot, context)=>{
            debug_global.snapshot = snapshot;
            debug_global.context = context;
            console.log("\n\n\nworked");
            console.log(debug_global);
            console.log("\n\n\n");
        });
    }catch(e){
        console.log("setupPhoneWallpaperDBWatcher catch!!!!!!!!!!!!!!!!!");
        console.log(e);
    }

    console.log("setupPhoneWallpaperDBWatcher end");
}

async function callJoinSetWallpaper( person_id, img_url ){
    const {apikey} = getPerson( person_id ).join;
    
    const deviceId = "group.android";
    const wallpaper = img_url;
    const lockWallpaper = img_url;

    if( apikey===undefined ){
        return "apikey===undefined";
    }

    const url = 
    `https://joinjoaomgcd.appspot.com/_ah/api/messaging/v1/sendPush`
    +`?deviceId=${deviceId}`
    +`&wallpaper=${wallpaper}`
    +`&lockWallpaper=${lockWallpaper}`
    +`&apikey=${apikey}`

    return await requestP(url).then((r)=>{
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
    const reddit_posts = await getRedditPosts();

    console.warn("blindly returning top post at the moment");

    // return reddit_posts!==undefined ? reddit_posts : "undefined";
    // return reddit_posts.length || "undefined";
    return reddit_posts[0] || "undefined";
}

async function getRedditPosts(){
    let result = await requestP(`https://www.reddit.com/r/earthporn/top/.json?count=20&t=day`);
    result = JSON.parse(result);
    return result.data.children;
}


function getRedditImage( reddit_post ){

    let toReturn;
    
    if( typeof reddit_post === "object" ){
        toReturn = reddit_post.data.url;
        console.log("got reddit post object");
    }else{
        const post_obj = getRedditPostFromUrl(reddit_post);
        toReturn = getRedditImage( post_obj );
        console.log("got reddit post url");
    }

    return toReturn;
}


/*

await fb_db.ref("/").set({
    "date":new Date().toString()
});

const snapshot = await fb_db.ref('/').once('value');

res.json({
    snapshot
});

*/