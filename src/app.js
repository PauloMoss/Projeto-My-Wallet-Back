import express from 'express';
import cors from 'cors';
import { stripHtml } from "string-strip-html";

import authMiddleware from './middlewares/authMiddleware.js';
import * as userController from './controllers/userController.js';
import * as recordController from './controllers/recordController.js';

const app = express();

app.use(express.json());
app.use(cors());

app.post("/sign-up", userController.signUp)

app.post("/login", userController.singIn)

app.post("/logout", authMiddleware, userController.logout)

app.get("/records", authMiddleware, recordController.getAllUserRecords)

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

export default app;