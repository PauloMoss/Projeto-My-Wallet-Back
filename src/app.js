import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import connection from './database.js';
import { loginSchema } from './schemas.js';

const app = express();

app.use(express.json());
app.use(cors());

app.post("/sign-up", async (req,res) => {
    try{
        console.log(req.body)
        const { name, email, password, confirmPassword } = req.body;

        //validate password === confirmPassword

        const cryptPassword = bcrypt.hashSync(password, 10);

        await connection.query(`
            INSERT INTO users (name, email, password) 
            VALUES ($1, $2, $3)
        `, [name, email, cryptPassword]);
        
        res.sendStatus(201);

    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
})

app.post("/login", async (req,res) => {
    
    try{
        const { email, password } = req.body
        const err = loginSchema.validate(req.body).error;
        if(err) {
            console.log(err)
            return res.sendStatus(400);
        }
        const result = await connection.query(`
            SELECT * FROM users 
            WHERE email = $1
        `, [email]);

        const user = result.rows[0];

        if(user && bcrypt.compareSync(password, user.password)) {
            const token = uuidv4();

            await connection.query(`
                INSERT INTO sessions ("userId", token)
                VALUES ($1, $2)
            `, [user.id, token]);

            const { name, email } = user;
            res.send({name, email, token});

        } else {
            res.sendStatus(401);
        }
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
})

app.get("/records", async (req,res) => {
    try{
    const authorization = req.headers['authorization'];
    const token = authorization.replace('Bearer ', '');
    const result = await connection.query(`
        SELECT records.value, records.withdraw, records.date, records.description FROM records
        JOIN sessions
        ON sessions."userId" = records."userId"
        WHERE sessions.token = $1
    `, [token]);
    res.send(result.rows)
    } catch(e) {
        console.log(e);
        res.sendStatus(500)
    }
})

app.listen(4000, () => {
    console.log("Server running on port 4000!")
})