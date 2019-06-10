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

    let s = `https://joinjoaomgcd.appspot.com/_ah/api/messaging/v1/sendPush?`;
    if( deviceNames!==undefined ){ s+=`deviceNames=${deviceNames}&`}
    if( deviceId!==undefined ){ s+=`deviceId=${deviceId}&`}
    if( text!==undefined ){ s+=`text=${text}&`}
    if( title!==undefined ){ s+=`title=${title}&`}
    if( icon!==undefined ){ s+=`icon=${icon}&`}
    if( smallicon!==undefined ){ s+=`smallicon=${smallicon}&`}
    if( url!==undefined ){ s+=`url=${url}&`}
    if( image!==undefined ){ s+=`image=${image}&`}
    if( sound!==undefined ){ s+=`sound=${sound}&`}
    if( group!==undefined ){ s+=`group=${group}&`}
    if( category!==undefined ){ s+=`category=${category}&`}
    if( notificationId!==undefined ){ s+=`notificationId=${notificationId}&`}
    if( clipboard!==undefined ){ s+=`clipboard=${clipboard}&`}
    if( file!==undefined ){ s+=`file=${file}&`}
    if( callnumber!==undefined ){ s+=`callnumber=${callnumber}&`}
    if( smsnumber!==undefined ){ s+=`smsnumber=${smsnumber}&`}
    if( smstext!==undefined ){ s+=`smstext=${smstext}&`}
    if( mmsfile!==undefined ){ s+=`mmsfile=${mmsfile}&`}
    if( wallpaper!==undefined ){ s+=`wallpaper=${wallpaper}&`}
    if( lockWallpaper!==undefined ){ s+=`lockWallpaper=${lockWallpaper}&`}
    if( mediaVolume!==undefined ){ s+=`mediaVolume=${mediaVolume}&`}
    if( ringVolume!==undefined ){ s+=`ringVolume=${ringVolume}&`}
    if( alarmVolume!==undefined ){ s+=`alarmVolume=${alarmVolume}&`}
    if( say!==undefined ){ s+=`say=${say}&`}
    if( language!==undefined ){ s+=`language=${language}&`}
    if( app!==undefined ){ s+=`app=${app}&`}
    if( appPackage!==undefined ){ s+=`appPackage=${appPackage}&`}
    s+=`apikey=${apikey}`

    const result = await requestP(s);

    return result;
}

module.exports = {
    database_watch_events: [],
    unprotected_router,
    router,
    sendJoinMessage
};

