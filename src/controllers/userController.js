import { stripHtml } from 'string-strip-html';
import * as userService from '../services/userService.js';
import * as sessionService from '../services/sessionService.js';

import { loginSchema, signUpSchema } from '../schemas/userSchema.js';

export async function signUp(req,res) {
    try{
        const { name, email, password } = req.body

        if(!name || !email || !password ) {
            return res.sendStatus(400);
        }
        req.body.name = stripHtml(req.body.name).result.trim();

        const err = signUpSchema.validate(req.body).error;
        if(err) {
            return res.sendStatus(400);
        }

        const user = await userService.checkExistingUser(email);

        if(user) {
            return res.sendStatus(409)
        }

        await userService.createNewUser(name, email, password)
        
        res.sendStatus(201);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
}

export async function singIn(req,res) {
    try{
        const { email, password } = req.body

        if(!email || !password ) {
            return res.sendStatus(400);
        }

        const err = loginSchema.validate(req.body).error;
        if(err) {
            return res.sendStatus(400);
        }

        const user = await userService.checkExistingUser(email);

        const validLogin = userService.validatePassword(password, user.password);

        if(user && validLogin) {

            const token = await sessionService.createSession(user)
            const { id, name, email } = user;

            res.send({id, name, email, token});

        } else {
            res.sendStatus(401);
        }
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
}

export async function logout(req, res) {
    try{
        const session = res.locals.userSession;
        
        await sessionService.logoutSession(session.token)
        
        res.sendStatus(200);
    } catch(e) {
        console.log(e);
        res.sendStatus(500)
    }
}