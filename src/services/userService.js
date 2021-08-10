
import * as userRepositorie from '../repositories/userRepository.js';

export async function checkExistingUser(email) {
    const user = await userRepositorie.findUserByEmail(email);
    if(user) {
        return user
    } else {
        return false
    }
}

export async function createNewUser(name, email, password) {

    const cryptPassword = bcrypt.hashSync(password, 10);

    const params = { name, email, password: cryptPassword};

    await userRepositorie.saveUser(params);
}

export function validatePassword(password, userPassword) {
    
    return bcrypt.compareSync(password, userPassword)
}