const express = require("express");
const {getForecast, goodToFly} = require("./weather");

const unprotected_router = express.Router();
const router = express.Router();

router.get("/forecast/:lat_lon", async(req, res, next)=>{

    const {lat, lon} =  (()=>{
        const {lat_lon} = req.params;
        const regex_res = /(.*),(.*)/.exec(lat_lon)
        const lat = regex_res[1];
        const lon = regex_res[2];
        return {lat,lon};
    })();

    const {base_url,secret_key} = res.locals.person.darksky;

    const forecast_result = await getForecast({base_url, secret_key, lat, lon})

    res.json({
        forecast_result,
    });
});
router.get("/:time_key/:info_keys/:lat_lon", async(req, res, next)=>{

    let {time_key,info_keys} = req.params;

    info_keys = info_keys.split(",")

    const {lat, lon} =  (()=>{
        const {lat_lon} = req.params;
        const regex_res = /(.*),(.*)/.exec(lat_lon)
        const lat = regex_res[1];
        const lon = regex_res[2];
        return {lat,lon};
    })();

    const {base_url,secret_key} = res.locals.person.darksky;

    const forecast_result = await getForecast({base_url, secret_key, lat, lon})

    const data_arr = forecast_result[time_key].data.map((cur)=>{

        const to_return = {};

        info_keys.forEach((cur_info_key)=>{
            to_return[cur_info_key] = cur[cur_info_key];
        });

        to_return.time_sec = cur.time;

        return to_return;

    });

    

    res.json(data_arr);
});
router.post("/good_to_fly/:lat_lon",async(req, res, next)=>{

    const {lat, lon} =  (()=>{
        const {lat_lon} = req.params;
        const regex_res = /(.*),(.*)/.exec(lat_lon)
        const lat = regex_res[1];
        const lon = regex_res[2];
        return {lat,lon};
    })();
    
    const time_key = "hourly";
    const {base_url,secret_key} = res.locals.person.darksky;

    const good_to_fly = await goodToFly({base_url, secret_key, lat, lon, time_key});
    res.json(good_to_fly);
});

unprotected_router.all("/t",(req, res, next)=>{
    res.end("hi");
});

module.exports = {
    unprotected_router,
    router,
    database_watch_events:[],
};