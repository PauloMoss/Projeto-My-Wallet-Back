import bcrypt from 'bcrypt';

import * as userRepository from '../repositories/userRepository.js';

export async function checkExistingUser(email) {
    const user = await userRepository.findUserByEmail(email);
    if(user) {
        return user
    } else {
        return false
    }
}

export async function createNewUser(name, email, password) {

    const cryptPassword = bcrypt.hashSync(password, 10);

    const params = { name, email, password: cryptPassword};

    await userRepository.saveUser(params);
}

export function validatePassword(password, userPassword) {
    try{
        const authorizated = bcrypt.compareSync(password, userPassword);
    
        if(authorizated) return true;

    } catch {
        return false
    }
    
}