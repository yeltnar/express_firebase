const requestP = require("request-promise-native");

async function darkSkyRequest({base_url, query_type, secret_key, lat, lon}){

    if(base_url===undefined){throw new Error(`base_url===${base_url}`);}
    if(query_type===undefined){throw new Error(`query_type===${query_type}`);}
    if(secret_key===undefined){throw new Error(`secret_key===${secret_key}`);}
    if(lat===undefined){throw new Error(`lat===${lat}`);}
    if(lon===undefined){throw new Error(`lon===${lon}`);}

    const url = `${base_url}/${query_type}/${secret_key}/${lat},${lon}`

    return await requestP(url)
    .then((result)=>{
        return JSON.parse(result);
    });
}

async function darkSkyForecast({base_url, secret_key, lat, lon}){
    const query_type = "forecast";
    return await darkSkyRequest({base_url, query_type, secret_key, lat, lon})
}

module.exports = {
    getForecast:darkSkyForecast
};
