const express = require("express");
const firebase = require("firebase");

const unprotected_router = express.Router();
const router = express.Router();
const getFBDB = firebase.database;

router.post("/report/:device",async(req, res)=>{

    const body = req.body;
    const device = req.params.device;
    const {locals} = res;
    const ips = req.ips;
    const server_found_ip = (()=>{
        return req.headers['x-forwarded-for'] || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    })();

    console.log(server_found_ip);

    const server_report = {
        server_timestamp: new Date().toString(),
        ips,
        ip: server_found_ip
    };

    const report = {...body.report, ...server_report};

    const {person_id} = res.locals;

    await getFBDB()
    .ref(getDeviceReportLocation(person_id, device))
    .set(report);

    res.json({
        report,
    })
});

router.get("/report/:device",async(req, res)=>{

    const {person_id} = res.locals;
    const device = req.params.device;

    const db_obj = JSON.parse(JSON.stringify(
        await getFBDB().ref( getDeviceReportLocation(person_id, device) ).once('value')
    ));

    res.json(db_obj);
});

router.get("/report",async(req, res)=>{

    const {person_id} = res.locals;
    const device = "all";

    const db_obj = JSON.parse(JSON.stringify(
        await getFBDB().ref( getDeviceReportLocation(person_id, device) ).once('value')
    ));

    res.json(db_obj);
});

function getDeviceReportLocation(person_id, device){

    if(device==="all"){
        return `${person_id}/devices`
    }else{
        return `${person_id}/devices/${device}`
    }
}

module.exports = {
    unprotected_router,
    router,
    database_watch_events: [],
}