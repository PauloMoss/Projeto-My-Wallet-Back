import connection from '../database.js';

export async function saveSession(user, token) {

    await connection.query(`
        INSERT INTO sessions ("userId", token)
        VALUES ($1, $2)
    `, [user.id, token]);
}

export async function findSession(token) {

    const success = await connection.query(`
        SELECT * FROM sessions 
        WHERE token = $1
    `, [token]);

    return success.rows[0];
}