const express = require("express");
const {sendJoinMessage} = require('../join/join')
const firebase = require("firebase");

const router = express.Router();
const unprotected_router = express.Router();

const getFBDB = firebase.database;

async function getPhoneActionTable(locals){

    console.log(locals);

    let database_phone_action_table = JSON.parse(JSON.stringify(
        await getFBDB().ref( `${locals.person_id}/twilio` ).once('value')
    ));

    const {phone_action_table} = locals.person.twilio

    const final_phone_action_table = phone_action_table.reduce((acc,cur,i,arr)=>{
        acc[cur.number] = cur.action;
        return acc;
    },database_phone_action_table);

    return final_phone_action_table;

};

router.get("/",(req,res)=>{
    res.json({result:"security_hole"});
});

router.post('/call',async (req, res)=>{

    // return res.json(res.locals);

    const body = req.body;

    sendJoinCallNotification(res.locals.person.join.apikey, body.From, res.locals)

    const phone_action_table = await getPhoneActionTable(res.locals);

    const results = await processCall(body, phone_action_table);

    if( results.message!==undefined ){
        res.type('text/xml');
        res.end(results.message); // remove ths so I just get a call log
    }
});

async function processCall(call_body, phone_action_table){

    const to_return = {};

    if( call_body===undefined ){
        console.log(`call_body is ${call_body}`);
        return to_return;
    }else if(call_body.From===undefined){
        console.log(`call_body.From is ${call_body.From}`);
        return to_return;
    }
    
    const from_number = call_body.From;
    const action = getAction(from_number, phone_action_table);

    // return {action,from_number}

    console.log(`from_number = ${from_number}`);
    console.log(`action = ${action}`);
    console.log({twilio_body:call_body});

    if( action===ACTION_LIST.OPEN_GATE ){
        const call_msg =    
        `<Response>`+
            `<Pause length="1"/>`+
            // `<Say>${req.body.From}</Say>`+
            // `<Dial>xxx xxx xxx</Dial>`+
            `<Play digits="9w9w9w9"></Play>`+
            `<Hangup/>`+
        `</Response>`;
        to_return.message = call_msg;
    }else if( action===ACTION_LIST.NOT_FOUND || action===ACTION_LIST.WEBEX || action===ACTION_LIST.DREW ){
        const call_msg =    
        `<Response>`+
            `<Reject/>` +
        `</Response>`;
        to_return.message = call_msg;
    }

    return to_return;
}

function getAction(phone_number, phone_action_table){
    phone_number = simplifyPhoneNumber(phone_number);
    // return {PHONE_ACTION_TABLE,phone_number,found:PHONE_ACTION_TABLE[phone_number]}
    return phone_action_table[phone_number] || ACTION_LIST.NOT_FOUND;
}

function simplifyPhoneNumber(phone_number){
    phone_number = /\+1([0-9]{10})/.exec(phone_number)[1];
    return phone_number;
}

const ACTION_LIST = {
    OPEN_GATE:"OPEN_GATE",
    NOT_FOUND:"NOT_FOUND",
    WEBEX:"WEBEX",
    DREW:"DREW",
    JULIE:"JULIE",
};

async function sendJoinCallNotification(apikey, from_number, locals){

    if( apikey===undefined ){
        throw new Error(`apikey is ${apikey}`);
    }

    const phone_action_table = await getPhoneActionTable(locals);

    const extra_info = (()=>{

        const tmp_extra_info = getAction(from_number, phone_action_table);
        // TODO find contact if ya want to
        // if( tmp_extra_info===ACTION_LIST.NOT_FOUND ){
        //     locals.person.contacts.
        // }

        return tmp_extra_info;
    })();

    const join_obj = {
        deviceId:"group.android",
        title:"New call",
        text:`${extra_info} ${from_number}`,
    };

    sendJoinMessage(join_obj, apikey);
}

module.exports = {
    unprotected_router,
    router
};