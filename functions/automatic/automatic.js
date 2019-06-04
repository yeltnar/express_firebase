const functions = require('firebase-functions');
const express = require("express");
const requestP = require("request-promise-native");

const unprotected_router = express.Router();

unprotected_router.get("/login",(req,res,next)=>{
    const oauth_authorize_url = functions.config().persons.drew.automatic.oauth_authorize_url;
    res.redirect(oauth_authorize_url);
});

unprotected_router.get("/oauth_callback",(req,res,next)=>{
    code = req.body.code;
    client_id = req.body.client_id;
    client_secret = req.body.client_secret;

    const body = req.body;
    oauth_callback_called = true;

    res.json({
        body,
        oauth_callback_status:200
    });
});

// get request from browser after oauth is done 
unprotected_router.get("/oauth_confirm",async(req,res,next)=>{

    const {code} = req.query

    const result = await getToken( {code} );

    res.json({
        // code,
        result,
        oauth_confirm_status:200
    });
});

async function getToken( {code, refresh_token, refresh=false} ){

    const grant_type = refresh===true ? "refresh_token" : "authorization_code";
    
    if( refresh_token===undefined && code===undefined ){
        throw new Error("refresh_token and code are undefined");
    }

    const {client_id,secret:client_secret,oauth_access_token_url} = functions.config().automatic;

    const options = {
        method: 'POST',
        url: oauth_access_token_url,
        form:{
            code,
            client_id,
            client_secret,
            refresh_token,
            grant_type
        }
    };

    let result;

    try {
        result = await requestP(options);
        result = 200;
    }catch(e){
        result = JSON.stringify(e) || "error";
    }

    return result;
}

module.exports = {
    unprotected_router
};