const express = require("express");

const {
    getCurrentWallpaper,
    getNewWallpaper,
    setCurrentWallpaper,
    getDebugGlobal,
    database_watch_events
} = require("./phone_manager_logic");

const unprotected_router = express.Router();
const router = express.Router();

unprotected_router.all("/unprotected_test",(req,res,next)=>{
    res.json({"msg":"phone unprotected_test 200"});
});

// TODO remove
unprotected_router.all("/getDebugGlobal",(req, res)=>{
    res.json(getDebugGlobal());
})

router.all("/protected_test",(req,res,next)=>{
    res.json({"msg":"phone protected_test 200"});
});

router.get("/current_wallpaper",async(req,res,next)=>{
    const person = res.locals.person_id;
    const current_wallpaper = await getCurrentWallpaper(person);
    res.json({current_wallpaper});
});
router.get("/new_wallpaper",async(req,res,next)=>{
    const person = res.locals.person_id;
    const current_wallpaper = await getNewWallpaper(person) || "no wallpaper result";
    res.json({current_wallpaper});
});
router.post("/current_wallpaper",async(req,res,next)=>{
    const person_id = res.locals.person_id;
    const img_url = encodeURIComponent(getBodyParamQueryData( req, "img_url" ));
    const reddit_post = getBodyParamQueryData( req, "reddit_post" );

    if(img_url===undefined){
        return res.status(500).json({err:"img_url===undefined"});
    }

    const current_wallpaper = await setCurrentWallpaper({person_id, img_url, reddit_post});
    return res.json({current_wallpaper});
});

// setup all firebase functions to be exported
const custom_firebase_functions = {
    getNewWallpaper
};

module.exports = {
    unprotected_router,
    router,
    custom_firebase_functions,
    database_watch_events
}

function getBodyParamQueryData( req, key ){
    return req.body[key] || req.param[key] || req.query[key];
}