import { v4 as uuid } from "uuid";

import * as sessionRepository from '../repositories/sessionRepository.js';


export async function createSession(user) {
    
    const token = await sessionRepository.saveSession(user, uuid());

    return token;
}

export async function validateSession(token) {

    const userSession = await sessionRepository.findSession(token);

    return userSession;
}