import { v4 as uuid } from "uuid";

import * as sessionRepository from '../repositories/sessionRepository.js';


export async function createSession(user) {

    const token = uuid();
    await sessionRepository.saveSession(user.id, token);
    return token;
}

export async function validateSession(token) {

    const userSession = await sessionRepository.findSession(token);

    return userSession;
}