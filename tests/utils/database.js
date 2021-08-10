import connection from '../../src/database.js';


export async function cleanDatabase() {
    await connection.query('TRUNCATE users RESTART IDENTITY');
    await connection.query('TRUNCATE sessions RESTART IDENTITY');
    await connection.query('TRUNCATE records RESTART IDENTITY');
}

export async function endConnection() {
    await connection.end();
}