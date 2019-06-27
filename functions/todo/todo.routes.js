const express = require("express");

const unprotected_router = express.Router();
const router = express.Router();

const {
    getAllTodos,
    getTodo,
    createTodo,
    replaceTodo,
} = require("./todo");

router.get("/all", async(req, res, next)=>{
    const {person_id} = res.locals;
    const to_dos = await getAllTodos(person_id);
    res.json(to_dos);
});
router.get("/item/:item_id", async(req, res, next)=>{    
    const {person_id} = res.locals;
    const {item_id} = req.params;
    const to_do = await getTodo(item_id, person_id);
    res.json(to_do);
});

router.put("/item", async(req, res, next)=>{
    const {todo_obj} = req.body;
    const {person_id} = res.locals;
    await createTodo(todo_obj, person_id);
    res.json(todo_obj);
});
router.put("/item/:id", async(req, res, next)=>{
    const {todo_obj} = req.body;
    const {id} = req.params;
    const {person_id} = res.locals;
    const saved_obj = await replaceTodo(id, todo_obj, person_id);
    res.json(saved_obj);
});

module.exports = {
    unprotected_router,
    router,
    database_watch_events:[],
};