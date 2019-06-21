const express = require("express");
const requestP = require("request-promise-native");

const unprotected_router = express.Router();
const router = express.Router();

unprotected_router.all("/test",(req, res, next)=>{

    const body = req.body;
    const params = req.params;
    const query = req.query;

    res.json({
        body,
        params,
        query,
        test:200,
    });
});

router.all("/api",async(req, res, next)=>{

    const body_param_query = {...req.query, ...req.param, ...req.body};

    const {apikey} = res.locals.person.join;
    
    const result = await sendJoinMessage(body_param_query, apikey);

    res.json({
        result
    });
});

async function sendJoinMessage(join_obj, apikey){

    const {deviceNames,deviceId,text,title,icon,smallicon,url,image,sound,group,category,notificationId,clipboard,file,callnumber,smsnumber,smstext,mmsfile,wallpaper,lockWallpaper,mediaVolume,ringVolume,alarmVolume,say,language,app,appPackage} = join_obj;

    let join_url = `https://joinjoaomgcd.appspot.com/_ah/api/messaging/v1/sendPush?`;
    if( deviceNames!==undefined ){ join_url+=`deviceNames=${deviceNames}&`}
    if( deviceId!==undefined ){ join_url+=`deviceId=${deviceId}&`}
    if( text!==undefined ){ join_url+=`text=${text}&`}
    if( title!==undefined ){ join_url+=`title=${title}&`}
    if( icon!==undefined ){ join_url+=`icon=${icon}&`}
    if( smallicon!==undefined ){ join_url+=`smallicon=${smallicon}&`}
    if( url!==undefined ){ join_url+=`url=${url}&`}
    if( image!==undefined ){ join_url+=`image=${image}&`}
    if( sound!==undefined ){ join_url+=`sound=${sound}&`}
    if( group!==undefined ){ join_url+=`group=${group}&`}
    if( category!==undefined ){ join_url+=`category=${category}&`}
    if( notificationId!==undefined ){ join_url+=`notificationId=${notificationId}&`}
    if( clipboard!==undefined ){ join_url+=`clipboard=${clipboard}&`}
    if( file!==undefined ){ join_url+=`file=${file}&`}
    if( callnumber!==undefined ){ join_url+=`callnumber=${callnumber}&`}
    if( smsnumber!==undefined ){ join_url+=`smsnumber=${smsnumber}&`}
    if( smstext!==undefined ){ join_url+=`smstext=${smstext}&`}
    if( mmsfile!==undefined ){ join_url+=`mmsfile=${mmsfile}&`}
    if( wallpaper!==undefined ){ join_url+=`wallpaper=${wallpaper}&`}
    if( lockWallpaper!==undefined ){ join_url+=`lockWallpaper=${lockWallpaper}&`}
    if( mediaVolume!==undefined ){ join_url+=`mediaVolume=${mediaVolume}&`}
    if( ringVolume!==undefined ){ join_url+=`ringVolume=${ringVolume}&`}
    if( alarmVolume!==undefined ){ join_url+=`alarmVolume=${alarmVolume}&`}
    if( say!==undefined ){ join_url+=`say=${say}&`}
    if( language!==undefined ){ join_url+=`language=${language}&`}
    if( app!==undefined ){ join_url+=`app=${app}&`}
    if( appPackage!==undefined ){ join_url+=`appPackage=${appPackage}&`}

    console.log(`join request: url:${join_url}`);

    join_url+=`apikey=${apikey}`


    const result = await requestP(join_url);

    return result;
}

module.exports = {
    database_watch_events: [],
    unprotected_router,
    router,
    sendJoinMessage
};

