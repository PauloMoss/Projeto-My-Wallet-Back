import connection from '../database.js';

export async function saveSession(userId, token) {

    await connection.query(`
        INSERT INTO sessions ("userId", token)
        VALUES ($1, $2)
    `, [userId, token]);
}

export async function findSession() {

    const success = await connection.query(`
        SELECT * FROM sessions 
        WHERE token = $1
    `, [token]);

    return success.rows[0];
}