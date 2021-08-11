
import * as recordService from '../services/recordService.js';

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