import supertest from 'supertest';
import app from '../src/app.js';
import connection from '../src/database.js';
import bcrypt from 'bcrypt';

beforeEach(async () =>{
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM sessions');
})

afterAll(async () => {
    await connection.query('DELETE FROM users');
    connection.end();
})

describe("POST /sign-up", () => {

    it("returns status 201 for create user", async () => {
        const body = { name: 'TesteCerto', email: 'teste@teste', password: 'testeCerto', confirmPassword: 'testeCerto' };
        const result = await supertest(app).post('/sign-up').send(body);
        expect(result.status).toEqual(201);
    });

    it("returns status 201 for create sanitized user", async () => {
        const body = {name: ' <h1>Teste de sanitizacao</h1> ', email: ' teste2@teste<div />', password: 'testeCerto', confirmPassword: 'testeCerto' };
        const result = await supertest(app).post('/sign-up').send(body);
        const success = await connection.query(`
            SELECT * FROM users WHERE email = 'teste2@teste'
        `);
        const expectedUserData = { name: 'Teste de sanitizacao', email: 'teste2@teste'};
        let status;
        if(success.rows[0].name === expectedUserData.name && success.rows[0].email === expectedUserData.email) {
            status = 201
        } else {
            status = 500
        }
        expect(status).toEqual(201);
    })

    it("returns status 400 for minimum characters", async () => {
        const body = { name: 'Teste', email: 'teste@teste', password: 'teste', confirmPassword: 'teste' };
        const result = await supertest(app).post('/sign-up').send(body);
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid name", async () => {
        const body = { name: '', email: 'teste@teste', password: 'teste', confirmPassword: 'teste' }
        const result = await supertest(app).post('/sign-up').send(body)
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid email", async () => {
        const body = { name: 'Teste', email: '', password: 'teste', confirmPassword: 'teste' }
        const result = await supertest(app).post('/sign-up').send(body)
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid password", async () => {
        const body = { name: 'Teste', email: 'teste@teste', password: '', confirmPassword: 'teste' }
        const result = await supertest(app).post('/sign-up').send(body)
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid password match", async () => {
        const body = { name: 'Teste', email: 'teste@teste', password: 'teste2', confirmPassword: 'teste' }
        const result = await supertest(app).post('/sign-up').send(body)
        expect(result.status).toEqual(400);
    });
});

describe("POST /login", () => {

    beforeEach(async () =>{

        const cryptPassword = bcrypt.hashSync('teste', 10);

        await connection.query(`
            INSERT INTO users (name, email, password) 
            VALUES ('teste', 'teste@teste', '${cryptPassword}')
        `);
    })

    it("returns status 200 for valid params", async () => {

        const body = { email: ' <div>teste@teste</div>', password: 'teste' }
        const result = await supertest(app).post('/login').send(body)

        const success = await connection.query(`
            SELECT * FROM sessions JOIN users ON sessions."userId" = users.id
        `);
        const test = success.rows[success.rows.length-1];
        const token = test.token

        expect(result.body).toEqual({id: test['userId'],name: 'teste', email: 'teste@teste', token });
    });

    it("returns status 401 for unauthorized ", async () => {
        const body = { email: 'teste@teste', password: 'testeeee' }
        const result = await supertest(app).post('/login').send(body)
        expect(result.status).toEqual(401);
    });

    it("returns status 401 for unauthorized", async () => {
        const body = { email: 'teste@ttt', password: 'teste' }
        const result = await supertest(app).post('/login').send(body)
        expect(result.status).toEqual(401);
    });

    it("returns status 400 for invalid email", async () => {
        const body = { email: '', password: 'teste' }
        const result = await supertest(app).post('/login').send(body)
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid password", async () => {
        const body = { email: 'teste@teste', password: '' }
        const result = await supertest(app).post('/login').send(body)
        expect(result.status).toEqual(400);
    });
});