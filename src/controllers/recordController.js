import { stripHtml } from "string-strip-html";

import * as recordService from '../services/recordService.js';
import { transferSchema } from '../schemas/transferSchema.js';

export async function getAllUserRecords(req, res) {
    try{

        const session = res.locals.userSession;
        
        const result = await recordService.getRecords(session.userId)

        res.send({userId: session.userId, balance: result.balance, records: result.records})
        
    } catch(e) {
        console.log(e);
        res.sendStatus(500)
    }
}

export async function postNewRecord(req, res) {
    try{

        req.body.description = stripHtml(req.body.description).result.trim()

        const session = res.locals.userSession;
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

        const params = { value, description, type }

        const err = transferSchema.validate(params).error;
        if(err) {
            console.log(err)
            return res.sendStatus(400);
        }

        params.userId = session.userId;
        await recordService.createNewRecord(params);

        res.sendStatus(201);

    } catch(e) {
        console.log(e);
        res.sendStatus(500)
    }
}