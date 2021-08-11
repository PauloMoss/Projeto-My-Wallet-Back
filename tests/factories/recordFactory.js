import connection from '../../src/database';


export async function insertFakeRecord(params) {

    const { value, type, date, description } = params;

    await connection.query(`
            INSERT INTO records ("userId", value, type, date, description) 
            VALUES ( 1, $1, $2, $3, $4)
        `, [value, type, date, description]);
}