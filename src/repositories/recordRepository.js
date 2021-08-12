import connection from '../database.js';

export async function findRecordsByUserId(userId) {

    const result = await connection.query(`
        SELECT 
            id, 
            value, 
            type, 
            date, 
            description 
        FROM records
        WHERE "userId" = $1
    `, [userId]);

    return result.rows;
}

export async function insertRecord(params) {

    const { userId, value, description, type } = params;

    await connection.query(`
        INSERT INTO records ("userId", value, type, date, description)
        VALUES ($1, $2, $3, NOW(), $4 )
    `, [userId, value, type, description]);
}