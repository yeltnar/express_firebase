const express = require("express");

const unprotected_router = express.Router();

unprotected_router.get("/",(req,res)=>{
    res.json({result:"security_hole"});
});

unprotected_router.post('/call',(req, res)=>{

    const body = req.body;

    let from_number = (body||{}).From || "no `From` number";

    console.log(from_number);
    console.log({twilio_body:body});

    const call_msg =    
    `<Response>`+
        `<Pause length="3"/>`+
        // `<Say>${req.body.From}</Say>`+
        // `<Dial>xxx xxx xxx</Dial>`+
        // `<Say>${req.body.From}</Say>`+
        `<Hangup></Hangup>`+
    `</Response>`;
    
    res.type('text/xml');
    // res.end(call_msg); // remove this so I just get a call log
});

module.exports = {
    unprotected_router,
    router: unprotected_router
};