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