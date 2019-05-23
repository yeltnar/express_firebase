const functions = require('firebase-functions');
const firebase = require('firebase');
const express = require("express");

var config = {
    // apiKey: "apiKey",
    authDomain: "express-firebase-1aa17.firebaseapp.com",
    databaseURL: "https://express-firebase-1aa17.firebaseio.com",
    // storageBucket: "bucket.appspot.com"
};
firebase.initializeApp(config);


const fb_db = firebase.database();

const app = express();

let last_date = "undefined";

const start_date = new Date();

app.get("/timestamp",(req, res, next)=>{
    const date = new Date().toString();
    res.json({
        date,
        last_date,
        start_date,
    });
    last_date = date;
});

app.get("/runtime_vars", (req, res, next)=>{
    res.json({
        err:"You haven't done this yet silly! Also, this can't exist in new SW so I'll crash now.",
    });
    process.exit();
});

app.get("/database", async(req, res, next)=>{

    await fb_db.ref("/").set({
        "date":new Date().toString()
    });

    const snapshot = await fb_db.ref('/').once('value');

    res.json({
        snapshot
    });
})

// exports.helloWorld = functions.https.onRequest((request, response) => {
//     const date = new Date();
//     response.json({date});
// });
exports.app = functions.https.onRequest( app );
