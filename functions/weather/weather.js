const requestP = require("request-promise-native");

async function darkSkyRequest({base_url, query_type, secret_key, lat, lon, units="us"}){

    if(base_url===undefined){throw new Error(`base_url===${base_url}`);}
    if(query_type===undefined){throw new Error(`query_type===${query_type}`);}
    if(secret_key===undefined){throw new Error(`secret_key===${secret_key}`);}
    if(lat===undefined){throw new Error(`lat===${lat}`);}
    if(lon===undefined){throw new Error(`lon===${lon}`);}

    const url = `${base_url}/${query_type}/${secret_key}/${lat},${lon}?units=${units}`

    return await requestP(url)
    .then((result)=>{
        return JSON.parse(result);
    });
}

async function darkSkyForecast({base_url, secret_key, lat, lon}){
    const query_type = "forecast";
    return await darkSkyRequest({base_url, query_type, secret_key, lat, lon})
}

async function goodToFly({base_url, secret_key, lat, lon, time_key}){
    const forecast = await darkSkyForecast({base_url, secret_key, lat, lon});

    // return {
    //     keys:Object.keys(forecast),
    //     time_key,
    //     forecast,
    // }

    return forecast[time_key].data.map((data_point_obj)=>{

        const data_check_result = checkGoodToFly(data_point_obj)

        return data_check_result;
    });

    function checkGoodToFly(data_point_obj){

        const to_return = {};

        const to_check = {
            "windSpeed":{
                min:0,
                max:15,
            },
            "windGust":{
                min:0,
                max:15,
            },
            "precipProbability":{
                min:0,
                max:20,
            },
        }

        let over_all_result = true;
        for( let k in to_check ){

            const pass = data_point_obj[k]>=to_check[k].min && data_point_obj[k]<=to_check[k].max;

            if( pass===false ){
                over_all_result=false;
            }

            to_return[k] = {
                value: data_point_obj[k],
                pass,
            }
        }

        console.log(to_return);
        to_return.result = over_all_result
        to_return.time = data_point_obj.time

        return to_return;
    }
}

module.exports = {
    getForecast:darkSkyForecast,
    goodToFly,
};
