const express = require("express");
const firebase = require("firebase");

// const STATIC_FOLDER = "../build";
const STATIC_FOLDER = "./show_some_shit/build";

const router = express.Router();
const unprotected_router = express.Router();

const getFBDB = firebase.database;

unprotected_router.use(express.static(STATIC_FOLDER));

module.exports = {
    unprotected_router,
    router
};