const express = require("express");
const firebase = require("firebase");

const unprotected_router = express.Router();
const router = express.Router();
const getFBDB = firebase.database;

router.post("/report/:device",async(req, res)=>{

    const body = req.body;
    const device = req.params.device;
    const {locals} = res;
    const report = body.report;

    const {person_id} = res.locals;

    await getFBDB()
    .ref(getDeviceReportLocation(person_id, device))
    .set(report);

    res.json({
        report,
    })
});

function getDeviceReportLocation(person_id, device){
    return `${person_id}/devices/${device}`
}

module.exports = {
    unprotected_router,
    router,
    database_watch_events: [],
}