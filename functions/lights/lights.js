const hue = require("./hue");

const express = require("express");

const unprotected_router = express.Router();
const router = express.Router();

router.use("/hue",hue.router);
unprotected_router.use("/hue",hue.unprotected_router);

const database_watch_events = [];
database_watch_events.concat( hue.database_watch_events );

module.exports = {
    unprotected_router,
    router,
    database_watch_events,
};