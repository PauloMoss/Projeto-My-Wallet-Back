import express from 'express';
import cors from 'cors';
import { stripHtml } from "string-strip-html";


import authMiddleware from './middlewares/authMiddleware.js';
import * as userController from './controller/userController.js';


const app = express();

app.use(express.json());
app.use(cors());

app.post("/sign-up", userController.signUp)

app.post("/login", userController.singIn)

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
        req.body.description = stripHtml(req.body.description).result.trim()

        const authorization = req.headers['authorization'];
        const token = authorization?.replace('Bearer ', '');

        if(!token) return res.sendStatus(401);

        const err = transferSchema.validate(req.body).error;
        if(err) {
            console.log(err)
            return res.sendStatus(400);
        }

        const { transferType } = req.params;
        const { value, description } = req.body;
        let type;
        if(transferType === 'Out') {
            type = 'Withdraw';
        } else if(transferType === 'In') {
            type = 'Incomming';
        } else {
            return res.sendStatus(404);
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