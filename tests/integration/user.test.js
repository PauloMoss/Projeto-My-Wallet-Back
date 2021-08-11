import '../../src/setup.js';
import supertest from 'supertest';
import app from '../../src/app.js';

import{ cleanDatabase, endConnection } from '../utils/database.js';
import{ createFakeUser, insertFakeUserInDatabase, fakeLogin } from '../factories/userFactory.js';

beforeEach(cleanDatabase)

afterAll(async () => {
    await cleanDatabase();
    await endConnection();
})

describe("POST /sign-up", () => {

    it("returns status 201 for create user", async () => {
        const body = createFakeUser();

        const result = await supertest(app).post('/sign-up').send(body);

        expect(result.status).toEqual(201);
    });

    it("returns status 400 for empty body", async () => {
        const body = {};

        const result = await supertest(app).post('/sign-up').send(body);

        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid name", async () => {
        const body = createFakeUser();
        body.name = 'teste';

        const result = await supertest(app).post('/sign-up').send(body);

        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid email", async () => {
        const body = createFakeUser();
        body.email = 'NotAValidEmail';

        const result = await supertest(app).post('/sign-up').send(body)

        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid password match", async () => {
        const body = createFakeUser();
        body.confirmPassword = 'iForgotMyPassword';

        const result = await supertest(app).post('/sign-up').send(body)
        
        expect(result.status).toEqual(400);
    });
});

describe("POST /login", () => {

    beforeEach(async () => {
        const params = {name: 'MyIntegrationTest', email: 'test@test.com', password: '123456' }
        await insertFakeUserInDatabase(params)
    })

    it("returns status 200 for valid params", async () => {
        
        const body = { email: 'test@test.com', password: '123456' }

        const result = await supertest(app).post('/login').send(body)

        expect(result.body.token).not.toBe(undefined);
        expect(result.body).toEqual(
            expect.objectContaining({
                id: 1,
                name: 'MyIntegrationTest',
                email: 'test@test.com'
            })
        );
    });

    it("returns status 401 for unauthorized ", async () => {

        const body = { email: 'test@test.com', password: '654321' }

        const result = await supertest(app).post('/login').send(body)

        expect(result.status).toEqual(401);
    });

    it("returns status 401 for unauthorized", async () => {

        const body = { email: 'test@ttt', password: '123456' }

        const result = await supertest(app).post('/login').send(body)

        expect(result.status).toEqual(401);
    });

    it("returns status 400 for invalid email", async () => {

        const body = { email: '', password: '' }

        const result = await supertest(app).post('/login').send(body)

        expect(result.status).toEqual(400);
    });
});

describe("POST /logout", () => {

    beforeEach(async () => {
        const params = {name: 'MyIntegrationTest', email: 'test@test.com', password: '123456' }
        await insertFakeUserInDatabase(params);
        await fakeLogin("Meu_Token_Seguro")
    })

    it("returns status 200 for logout successfuly", async () => {
        const token = "Bearer Meu_Token_Seguro";

        const result = await supertest(app).post('/logout').set('Authorization', token)

        expect(result.status).toEqual(200);
    })

    it("returns status 401 for unauthorized user", async () => {
        const token = "Bearer Meu_Token";

        const result = await supertest(app).post('/logout').set('Authorization', token)

        expect(result.status).toEqual(401);
    })
})