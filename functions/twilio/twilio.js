const express = require("express");

const unprotected_router = express.Router();

unprotected_router.get("/",(req,res)=>{
    res.json({result:"security_hole"});
});

unprotected_router.post('/call',async (req, res)=>{

    const body = req.body;

    const results = await processCall(body);

    if( results.message!==undefined ){
        res.type('text/xml');
        res.end(results.message); // remove this so I just get a call log
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
            `<Hangup></Hangup>`+
        `</Response>`;
        to_return.message = call_msg;
    }

    return to_return;
}

function getAction(phone_number){
    phone_number = simplifyPhoneNumber(phone_number);
    // return {PHONE_ACTION_TABLE,phone_number,found:PHONE_ACTION_TABLE[phone_number]}
    return PHONE_ACTION_TABLE[phone_number]
}

function simplifyPhoneNumber(phone_number){
    phone_number = /\+1([0-9]{10})/.exec(phone_number)[1];
    return phone_number;
}

const ACTION_LIST = {
    OPEN_GATE:"OPEN_GATE"
};

const PHONE_ACTION_TABLE = {
    '9726850799':ACTION_LIST.OPEN_GATE,
};

module.exports = {
    unprotected_router,
    router: unprotected_router
};