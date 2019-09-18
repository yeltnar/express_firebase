const express = require("express");
const functions = require('firebase-functions');

const router = express.Router();

router.get("/all", (req, res, next)=>{
    res.json( getAllPersonsNames() );
});

router.get("/:person", (req, res, next)=>{

    const person_name = req.params.person;

    if( person_name!==undefined ){
        const person = getPerson( person_name );
        if(person===undefined){
            res.status(500).json( {err:"`/:person` no person found"} );
        }else{
            res.json( {
                name: `${person.first_name} ${person.last_name}`,
                err:false
            } );
        }
    }else{
        res.status(500).json( {err:"person_name is not provided"} );
    }

});

function getAllPersonsNames(){
    const persons = Object.keys( getAllPersons() );
    return persons;
}

function getAllPersons(){
    return functions.config().persons;
}

function getPerson( person_id ){

    let toReturn;
    if( person_id===undefined ){
        throw new Error(`${Object.keys({person_id})} is not defined`);
    }
    else if( getAllPersonsNames().includes(person_id) ){
        toReturn = functions.config().persons[person_id];
    }
    
    return toReturn;
}

function checkRequestObject( req, res, next  ){


    const [header_person_id, header_token] = Buffer.from(req.headers.authorization.split('Basic ')[1], 'base64').toString().split(":");

    const person_id = header_person_id || req.body.person_id || req.params.person_id || req.query.person_id;
    const token = header_token || req.body.token || req.params.token || req.query.token;

    if( person_id===undefined ){
        return res.status(500).json({person_id:"undefined"});
    }else if( token===undefined ){
        return res.status(500).json({token:"undefined"});
    }

    const person = getPerson( person_id );

    if( person===undefined ){
        return res.status(500).json( {err:"checkRequestObject no person found"} );
    }

    const check_token_result = checkToken( person, token );

    if( check_token_result===true ){
        res.locals.person_id = person_id;
        res.locals.person = person;
        res.locals.token_check = checkToken( person, token );
    }else{
        return res.status(500).json( {err:"checkToken failed"} );
    }


    return next();
}

function checkToken( person, token ){
    const regex = new RegExp(person.key);
    return regex.test(token);
}

module.exports = {
    router,
    checkRequestObject,
    getPerson,
};