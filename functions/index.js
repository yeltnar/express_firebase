const functions = require('firebase-functions');
const express = require("express");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

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

// exports.helloWorld = functions.https.onRequest((request, response) => {
//     const date = new Date();
//     response.json({date});
// });
exports.app = functions.https.onRequest( app );
