const express = require("express");
const functions = require('firebase-functions');
const requestP = require("request-promise-native");

const router = express.Router();

router.all("/message",async(req, res, next)=>{

    const recipient_key = req.body.recipient_key || req.param.recipient_key || req.query.recipient_key;
    const message = req.body.message || req.param.message || req.query.message;

    const contact = getSlackContact( recipient_key, res.locals.person_id );

    const message_result = await sendMessage(contact.channel, contact.token, message);
    
    return res.json( message_result );
});

async function sendMessage(channel,token,message){

    const url = `https://slack.com/api/chat.postMessage?token=${token}&channel=${channel}&text=${message}&as_user=true&pretty=1`;

    const result = JSON.parse(await requestP( url ));

    return {message,result}
}

function getSlackContact( recipient_key, sender_key ){
    const {channel, token} = functions.config().persons[sender_key].contacts[recipient_key].slack;
    return {channel, token}
}

module.exports = {
    router
};