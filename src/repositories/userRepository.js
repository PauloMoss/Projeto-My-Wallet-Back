import connection from '../database.js';

export async function findUserByEmail(email) {
    const user = await connection.query(`
        SELECT * FROM users 
        WHERE email = $1
    `, [email]);
    
    return user.rows[0];
}

export async function saveUser(params) {
    const { name, email, password } = params;

    await connection.query(`
            INSERT INTO users (name, email, password) 
            VALUES ($1, $2, $3)
        `, [name, email, password]);
}