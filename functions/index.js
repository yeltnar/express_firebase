const functions = require('firebase-functions');
const firebase = require('firebase');
// const admin = require('firebase-admin');
const express = require("express");
require("./interval_file");

const {
    router:person_manager_router,
    checkRequestObject:checkRequestObjectPersonManager
} = require("./person_manager/person_manager");
const {
    router:slack_router
} = require("./slack/slack");
const {
    unprotected_router:unprotected_automatic_router
} = require("./automatic/automatic");
const {
    unprotected_router:unprotected_phone_manager_router,
    router:phone_manager_router,
    database_watch_events:phone_manager_database_watch_events
} = require("./phone_manager/phone_manager.js");
const {
    unprotected_router:unprotected_join_router,
    router:join_router,
    database_watch_events:join_database_watch_events
} = require("./join/join.js");

var config = {
    // apiKey: "apiKey",
    authDomain: "express-firebase-1aa17.firebaseapp.com",
    databaseURL: "https://express-firebase-1aa17.firebaseio.com",
    // storageBucket: "bucket.appspot.com"
};
// console.log(functions.config().firebase);
// process.exit();
// firebase.initializeApp(functions.config().firebase);
firebase.initializeApp(config);

const fb_db = firebase.database();
const app = express();

// add database watchers
(()=>{
    let watch_events = [];
    watch_events = watch_events.concat(phone_manager_database_watch_events);
    watch_events = watch_events.concat(join_database_watch_events);
    
    // console.log({phone_manager_database_watch_events});
    // console.log({watch_events});
    // process.exit();

    console.log("adding database watchers");
    watch_events.forEach((event)=>{
        console.log(`adding '${event.export_name}' cloud function event`);
        module.exports[event.export_name] = 
        functions.database
        .ref(event.ref_str)[event.watchFunctionType](event.watchFunction)
    });
})();

// module.exports.onMessageWrite = functions.database
// .ref("/date")
// .onWrite((snapshot, context)=>{
//     return new Promise((resolve, reject)=>{

//         console.log(snapshot);
//         console.log(context);
//         console.log("date changed!!!");

//         resolve();
//     });
// })

const ON_CLOUD = process.env.X_GOOGLE_ENTRY_POINT !== undefined;

let last_date = "undefined";
const start_date = new Date().toString();

app.use( "/automatic",  unprotected_automatic_router);
app.use( "/phone",  unprotected_phone_manager_router);
app.use( "/join",  unprotected_join_router);

app.get("/timestamp",(req, res, next)=>{
    const date = new Date().toString();
    res.json({
        date,
        last_date,
        start_date,
    });
    last_date = date;
});

// everything after this will be protected
app.use( checkRequestObjectPersonManager );

app.use( "/person_manager", person_manager_router );
app.use( "/slack", slack_router );
app.use( "/phone",  phone_manager_router);
app.use( "/join",  join_router);

app.get("/runtime_vars", (req, res, next)=>{

    const to_send = {
        config: functions.config(),
        // env: process.env,
        ON_CLOUD,
        should_crash: functions.config().system.should_crash,
    };

    console.log("hello there ");

    if( functions.config().system.should_crash===true || functions.config().system.should_crash==="true" ){

        to_send.err = "You haven't done this yet silly! Also, this can't exist in new SW so I'll crash now.";
        
        delete to_send.config;
        delete to_send.env;
        
        res.json(to_send);

        process.exit();
        console.log("crashing");

    }else{
        res.json(to_send);
    }

    
});

app.get("/database", async(req, res, next)=>{

    console.log("running /database");

    try{

        await fb_db.ref("/date").set(new Date().toString());

        const snapshot = await fb_db.ref('/').once('value');

        res.json({
            snapshot
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({"err_bool":true,err});
    }
    return;
})

// app.get("/stupid",(req, res, next)=>{
//     res.json({r:admin.credential.applicationDefault()});
// });

app.get("/env",(req, res)=>{
    res.json( process.env );
});

// module.exports.helloWorld = functions.https.onRequest((request, response) => {
//     const date = new Date();
//     response.json({date});
// });
module.exports.app = functions.https.onRequest( app );