import supertest from 'supertest';
import app from '../src/app.js';
import connection from '../src/database.js';
import bcrypt from 'bcrypt';

beforeEach(async () =>{
})

afterAll(async () => {
    connection.end();
})

/*describe("POST /sign-up", () => {

    it("returns status 200 for valid params", async () => {
        const body = { name: 'Teste', email: 'teste@teste', password: 'teste', confirmPassword: 'teste' }
        const result = await supertest(app).post('/sign-up').send(body)
        expect(result.status).toEqual(201);
    });

    it("returns status 400 for invalid params", async () => {
        const body = { name: '', email: 'teste@teste', password: 'teste', confirmPassword: 'teste' }
        const result = await supertest(app).post('/sign-up').send(body)
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid params", async () => {
        const body = { name: 'Teste', email: '', password: 'teste', confirmPassword: 'teste' }
        const result = await supertest(app).post('/sign-up').send(body)
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid params", async () => {
        const body = { name: 'Teste', email: 'teste@teste', password: '', confirmPassword: 'teste' }
        const result = await supertest(app).post('/sign-up').send(body)
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid params", async () => {
        const body = { name: 'Teste', email: 'teste@teste', password: 'teste2', confirmPassword: 'teste' }
        const result = await supertest(app).post('/sign-up').send(body)
        expect(result.status).toEqual(400);
    });
}); */

describe("POST /login", () => {

    beforeEach(async () =>{

        const cryptPassword = bcrypt.hashSync('teste', 10);

        await connection.query(`
            INSERT INTO users (name, email, password) 
            VALUES ('teste', 'teste@teste', '${cryptPassword}')
        `);
    })

    it("returns status 200 for valid params", async () => {
        const success = await connection.query(`
            SELECT * FROM sessions JOIN users ON sessions."userId" = users.id WHERE users.name = 'teste@teste'
        `);
        const test = success.rows[success.rows.length - 1];
        console.log(test)
        const token = test.token

        const body = { email: 'teste@teste', password: 'teste' }
        const result = await supertest(app).post('/login').send(body)
        expect(result.body).toEqual({id: test['userId'], email: test.email, token });
        //expect.objectContaining
    });

    /*it("returns status 200 for valid params", async () => {
        const body = { email: '', password: 'teste' }
        const result = await supertest(app).post('/login').send(body)
        expect(result.status).toEqual(400);
    });

    it("returns status 200 for valid params", async () => {
        const body = { email: 'teste@teste', password: '' }
        const result = await supertest(app).post('/login').send(body)
        expect(result.status).toEqual(400);
    });*/
}); 