
import * as sessionService from "../services/sessionService.js";

export default async function authMiddleware(req, res, next) {
  try{
    const authorization = req.headers['authorization'];
    const token = authorization.split("Bearer ")[1];
    
    const validSession = await sessionService.validateSession(token);
    if (!validSession) {
      return res.sendStatus(401);
    }
    
    res.locals.userSession = validSession
    next()
    } catch(e) {
      console.log(e)
      res.sendStatus(500)
    }
}