const express = require("express");
const {sendJoinMessage} = require('../join/join')

const router = express.Router();
const unprotected_router = express.Router();

router.get("/",(req,res)=>{
    res.json({result:"security_hole"});
});

router.post('/call',async (req, res)=>{

    // return res.json(res.locals);

    const body = req.body;

    sendJoinCallNotification(res.locals.person.join.apikey, body.From, res.locals)

    const results = await processCall(body);

    if( results.message!==undefined ){
        res.type('text/xml');
        res.end(results.message); // remove ths so I just get a call log
    }
});

async function processCall(call_body){

    const to_return = {};

    if( call_body===undefined ){
        console.log(`call_body is ${call_body}`);
        return to_return;
    }else if(call_body.From===undefined){
        console.log(`call_body.From is ${call_body.From}`);
        return to_return;
    }
    
    const from_number = call_body.From;
    const action = getAction(from_number);

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
    }else if( action===ACTION_LIST.NOT_FOUND ){
        const call_msg =    
        `<Response>`+
            `<Reject/>` +
        `</Response>`;
        to_return.message = call_msg;
    }

    return to_return;
}

function getAction(phone_number){
    phone_number = simplifyPhoneNumber(phone_number);
    // return {PHONE_ACTION_TABLE,phone_number,found:PHONE_ACTION_TABLE[phone_number]}
    return PHONE_ACTION_TABLE[phone_number] || ACTION_LIST.NOT_FOUND;
}

function simplifyPhoneNumber(phone_number){
    phone_number = /\+1([0-9]{10})/.exec(phone_number)[1];
    return phone_number;
}

const ACTION_LIST = {
    OPEN_GATE:"OPEN_GATE",
    NOT_FOUND:"NOT_FOUND",
};

const PHONE_ACTION_TABLE = {
    '9726850799':ACTION_LIST.OPEN_GATE,
};

function sendJoinCallNotification(apikey, from_number, locals){

    if( apikey===undefined ){
        throw new Error(`apikey is ${apikey}`);
    }

    const extra_info = (()=>{

        const tmp_extra_info = getAction(from_number);
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