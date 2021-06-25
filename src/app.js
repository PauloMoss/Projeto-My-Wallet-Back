import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import connection from './database.js';
import { loginSchema, signUpSchema } from './schemas.js';

const app = express();

app.use(express.json());
app.use(cors());

app.post("/sign-up", async (req,res) => {
    try{
        const { name, email, password } = req.body;

        const err = signUpSchema.validate(req.body).error;
        if(err) {
            console.log(err)
            return res.sendStatus(400);
        }

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

            delete user.password;

            res.send({id: user.id, name: user.name, email, token});

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
        const token = authorization?.replace('Bearer ', '');

        if(!token) return res.sendStatus(401);
        
        const success = await connection.query(`
            SELECT * FROM sessions 
            WHERE token = $1
        `, [token]);
        
        if(success.rows[0]) {
            const result = await connection.query(`
            SELECT records.id, records.value, records.type, records.date, records.description FROM records
            JOIN sessions
            ON sessions."userId" = records."userId"
            WHERE sessions.token = $1
        `, [token]);
        
        let balance = result.rows.reduce((acc, item) => item.type === 'Incomming' ? acc + item.value : acc - item.value , 0);
        balance = (balance/100).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

        result.rows.forEach(r => r.value = (r.value/100).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));

        res.send({userId: success.rows[0].userId, balance, records: result.rows})

        } else {
            res.sendStatus(401)
        }
    } catch(e) {
        console.log(e);
        res.sendStatus(500)
    }
})

app.post("/records/:transferType", async (req,res) => {
    try{
        const authorization = req.headers['authorization'];
        const token = authorization?.replace('Bearer ', '');

        if(!token) return res.sendStatus(401);

        const { transferType } = req.params;
        const { value, description } = req.body;
        let type;
        if(transferType === 'Out') {
            type = 'Withdraw';
        } else {
            type = 'Incomming';
        }

        const success = await connection.query(`
        SELECT * FROM sessions 
        WHERE token = $1
    `, [token]);
        
        if(success.rows[0]) {
            const userId = success.rows[0].userId
            await connection.query(`
                INSERT INTO records ("userId", value, type, date, description)
                VALUES ($1, $2, $3, NOW(), $4 )
            `, [userId, value, type, description]);
        } else {
            return res.sendStatus(401);
        }
        res.sendStatus(201);

    } catch(e) {
        console.log(e);
        res.sendStatus(500)
    }
})

app.post("/logout", async (req,res) => {
    try{
        const authorization = req.headers['authorization'];
        const token = authorization?.replace('Bearer ', '');

        if(!token) return res.sendStatus(401);

        await connection.query(`
            DELETE FROM sessions 
            WHERE token = $1
        `, [token]);
        res.sendStatus(200);
    } catch(e) {
        console.log(e);
        res.sendStatus(500)
    }
})

export default app;