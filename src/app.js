import express from 'express';
import cors from 'cors';

import connection from './database.js';

const app = express();
app.use(express.json());
app.use(cors());

app.post("/login", async (req,res) => {

    const { email, password } = req.body
    try{
        const result = await connection.query('SELECT * FROM clients WHERE name = $1 AND password = $2', [email, password]);
        if(!result.rows.length){
            res.sendStatus(400)
        }
        res.send(result.rows);
    }catch(e){
        console.log(e);
        res.sendStatus(400);
    }
})

app.post("/sign-up", async (req,res) => {

    const { name, email, password, confirmPassword } = req.body;
    try{
        await connection.query('INSERT INTO clients (name, password) VALUES ($1, $2)', [name, password]);
        res.sendStatus(200);

    }catch(e){
        console.log(e);
        res.sendStatus(400);
    }
})

app.get("/clients", async (req,res) => {
    try{
    const result = await connection.query('SELECT * FROM clients');
    res.send(result.rows)
    } catch(e) {
        console.log(e);
        res.sendStatus(400)
    }
})

app.listen(4000, () => {
    console.log("Server running on port 4000!")
})