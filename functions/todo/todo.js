const firebase = require("firebase");
const uuid_v4 = require("uuid/v4");

const getFBDB = firebase.database;

function getAllTodos(person_id){
    return getAllTodoItems(person_id);
}

async function createTodo(todo_obj, person_id){

    if(person_id===undefined){throw new Error(`person_id is ${person_id}`);}

    checkTodoObj(todo_obj);
    
    // always set by the server 
    todo_obj.id = uuid_v4();
    todo_obj.created = new Date().toISOString();
    todo_obj.last_modified = todo_obj.created;

    // defaults set by the server 
    todo_obj.due_date = todo_obj.due_date || undefined;

    // remove keys with undefined value
    Object.keys(todo_obj).forEach((cur)=>{
        if(todo_obj[cur]===undefined){
            delete todo_obj[cur];
        }
    });

    try{
        await setTodoItem(todo_obj, person_id);
    }catch(e){
        console.error(e);
        return e;
    }

    return todo_obj;
}

async function replaceTodo(todo_id, todo_obj, person_id){
    if(person_id===undefined){throw new Error(`person_id is ${person_id}`);}
    if(todo_obj===undefined){throw new Error(`todo_obj is ${todo_obj}`);}
    
    delete todo_obj.created

    const skip_arr = ["created"];
    const new_todo_obj = JSON.parse(JSON.stringify(await getTodo(todo_id, person_id)));
    console.log(Object.keys(new_todo_obj))
    console.log(JSON.stringify(new_todo_obj,null,2))

    for( let k in new_todo_obj ){
        if(!skip_arr.includes(k)){
            new_todo_obj[k] = todo_obj[k]===undefined ? new_todo_obj[k] : todo_obj[k];
        }
    }

    for( let k in todo_obj ){
        if(!skip_arr.includes(k)){
            new_todo_obj[k] = todo_obj[k];
        }
    }

    console.log(JSON.stringify(new_todo_obj,null,2))

    new_todo_obj.last_modified = new Date().toISOString();

    try{
        await setTodoItem(new_todo_obj, person_id);
        return new_todo_obj;
    }catch(e){
        console.error(e);
    }
}

function checkTodoObj(todo_obj){
    if(todo_obj===undefined){throw new Error(`todo_obj is ${todo_obj}`);}

    const keys_to_check = [
        "name"
    ];

    keys_to_check.forEach((cur)=>{
        if(todo_obj[cur] === undefined){
            throw new Error(`todo_obj.${cur} is undefined`);
        }
    });
}

function getThisDBLocation(person_id){
    if( person_id===undefined ){
        throw new Error("person_id===undefined");
    }
    return `${person_id}/todo`;
}

async function setTodoItem(todo_obj, person_id){  
    if( todo_obj.id===undefined ){throw new Error("todo_obj.id===undefined");}
    const ref = `${getThisDBLocation(person_id)}/${todo_obj.id}`;
    await getFBDB().ref(ref).set(todo_obj);
}
async function getAllTodoItems(person_id){  
    if( person_id===undefined ){throw new Error("person_id===undefined");}
    const ref = `${getThisDBLocation(person_id)}`;
    console.log(`ref is ${ref}`)
    return await getFBDB().ref(ref).once("value");
}
async function getTodo(todo_id, person_id){  
    console.log(todo_id, person_id);
    if( todo_id===undefined ){throw new Error("todo_id===undefined");}
    if( person_id===undefined ){throw new Error("person_id===undefined");}
    const ref = `${getThisDBLocation(person_id)}/${todo_id}`;
    return await getFBDB().ref(ref).once("value");
}

module.exports={
    getAllTodos,
    getTodo,
    createTodo,
    replaceTodo,
};