import faker from 'faker'
import bcrypt from 'bcrypt';
import connection from '../../src/database';

export function createFakeUser() {
    const body = { 
        name: 'faker.name.firstName()',
        email: faker.internet.email(), 
        password: 'testeCerto', 
        confirmPassword: 'testeCerto' 
    };
    return body;
}

export async function insertFakeUserInDatabase(params) {

    const { name, email, password } = params;

    const cryptPassword = bcrypt.hashSync(password, 10);

    await connection.query(`
            INSERT INTO users (name, email, password) 
            VALUES ($1, $2, $3)
        `, [name, email, cryptPassword]);
}