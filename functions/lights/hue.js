const express = require("express");
const requestP = require('request-promise-native');
const md5 = require('md5');

const personManager = require("../person_manager/person_manager");

const unprotected_router = express.Router();
const router = express.Router();

unprotected_router.use("/oauth2_callback",async(req, res, next)=>{

    // state _should_ contain the 'user' that has the app being authenticated to
    const {state, code:nonce} = req.query;

    const person = personManager.getPerson( state );

    const {clientid, clientsecret} = person.hue;

    const verb = req.method; 

    const oauth_result = await doOauth2Callback(clientid, clientsecret, nonce)
    .then((oauth_result)=>{
        return JSON.parse(oauth_result);
    })
    .catch((err)=>{
        return "err!!!";
    });

    res.json({
        status:200,
        info:{clientid, clientsecret, verb, nonce},
        oauth_result:oauth_result||"no oauth_result"
    });
});

async function doOauth2Callback(clientid, clientsecret, nonce) {

    const path='/oauth2/token';
    const verb = "POST";

    const basic_token = Buffer.from(`${clientid}:${clientsecret}`).toString('base64');

    const options = {
        method: verb,
        url: 'https://api.meethue.com'+path,
        qs: { 
            code: nonce, 
            grant_type: 'authorization_code' 
        },
        headers: { 
            Authorization: `Basic ${basic_token}`
        }
    };

    // !!! most after this is for the digest method of authentication  

    // console.log("doOauth2Callback "+path);

    // const realm=`oauth2_client@api.meethue.com`;

    // const hash1 = md5(`${clientid}:${realm}:${clientsecret}`);
    // const hash2 = md5(`${verb}:${path}`);
    // const response = md5(`${hash1}:${nonce}:${hash2}`);

    // const options = {
    //     method: verb,
    //     url: 'https://api.meethue.com'+path,
    //     qs: { 
    //         code: nonce, 
    //         grant_type: 'authorization_code' 
    //     },
    //     headers: { 
    //         Authorization: `Digest `+
    //         `username="${clientid}", `+
    //         `realm="${realm}", `+
    //         `nonce="${nonce}", `+
    //         `uri="${path}", `+
    //         `response="${response}"`
    //     }
    // };

    // console.log(JSON.stringify({hash1,hash2,response}))

    return await requestP(options).catch((error)=>{
        // console.log({error});
        return "err in doOauth2Callback";
    });
}

router.get("/start_setup",(req,res,nest)=>{

    const {clientid, clientsecret:appid, deviceid, devicename, state} = res.locals.person.hue;
    const response_type = `code`;

    const url = `https://api.meethue.com/oauth2/auth?clientid=${clientid}&`+
    `appid=${appid}&`+
    `deviceid=${deviceid}&`+
    `devicename=${devicename}&`+
    `state=${state}&`+
    `response_type=${response_type}`

    res.redirect(url);
});

router.get("/add_user",async(req,res,nest)=>{

    // TODO remove
    const authorization_token = ;
    const appid = ;

    try{

        const button_options = {
            method: 'PUT',
            url: "https://api.meethue.com/bridge/0/config",
            headers:
            {
                Authorization: `Bearer ${authorization_token}`,
                'Content-Type': 'application/json'
            },
            body: { linkbutton: true },
            json: true 
        };
        const button_result = await requestP(button_options);

        const add_user_options = {
            method: 'POST',
            url: "https://api.meethue.com/bridge/",
            headers:
            {
                Authorization: `Bearer ${authorization_token}`,
                'Content-Type': 'application/json'
            },
            body: { 
                devicetype: appid 
            },
            json: true 
        };
        const add_user_result = await requestP(add_user_options);
        res.json({add_user_result});
    }catch(e){
        res.json({err});
    }
});

function testToken(){
    return false;
}

// console.log({huejay});
// console.log(Object.keys(huejay));

module.exports = {
    unprotected_router,
    router,
    database_watch_events:[],
};