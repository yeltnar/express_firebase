const requestP = require("request-promise-native");
const {getPerson} = require("./person_manager/person_manager")

const ONE_SEC = 1000;
const ONE_MIN = ONE_SEC*60;
const ONE_HR = ONE_MIN*60;
const ONE_DAY = ONE_HR*24;

// const interval_list = [
//     {
//         time:ONE_HR,
//         f:async()=>{
//             const person_id = "drew";
//             const person = getPerson(person_id);
//             console.log("setting new wallpaper");
//             await requestP(`https://node.andbrant.com/phone/new_wallpaper?person_id=${person_id}&token=${person.key}`);
//             console.log("set new wallpaper");
//         }
//     }
// ];

// interval_list.forEach((cur)=>{
//     setInterval(cur.f, cur.time);
// });

