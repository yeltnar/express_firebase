const express = require("express");
const requestP = require("request-promise-native");
const {getPerson} = require("../person_manager/person_manager.js");

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

    const options = {
        'method': 'POST',
        'url': 'https://joinjoaomgcd.appspot.com/_ah/api/messaging/v1/sendPush',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            deviceNames,
            deviceId,
            text,
            title,
            icon,
            smallicon,
            url,
            image,
            sound,
            group,
            category,
            notificationId,
            clipboard,
            file,
            callnumber,
            smsnumber,
            smstext,
            mmsfile,
            wallpaper,
            lockWallpaper,
            mediaVolume,
            ringVolume,
            alarmVolume,
            say,
            language,
            app,
            appPackage,
            apikey
        })

    };

    const result = await requestP(options);

    return result;
}

const database_watch_events = [];

database_watch_events.push({
    export_name:"notificationChangeWatcher",
    ref_str:"/{person_id}/phone/notifications",
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
        const new_val = change.after.val();
        console.log(`${person_id} notification ${JSON.stringify(new_val,null,2)}`);
        await callUpdateNotifications( person_id );
    },
});

async function callUpdateNotifications( person_id ){
    const {apikey} = getPerson( person_id ).join;
    
    const deviceId = "group.android";
    const text = `=:=update_notifications`;

    if( apikey===undefined ){
        return "apikey===undefined";
    }

    const join_obj = {
        deviceId,
        text
    };

    console.log({join_obj});

    return await sendJoinMessage( join_obj, apikey ).then((r)=>{
        return {
            join_response:JSON.parse(r)
        }
    });
}

module.exports = {
    database_watch_events: database_watch_events,
    unprotected_router,
    router,
    sendJoinMessage
};

