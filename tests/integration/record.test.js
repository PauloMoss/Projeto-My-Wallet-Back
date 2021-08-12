import '../../src/setup.js';
import supertest from 'supertest';
import app from '../../src/app.js';

import{ cleanDatabase, endConnection } from '../utils/database.js';
import{ insertFakeUserInDatabase, fakeLogin } from '../factories/userFactory.js';
import { insertFakeRecord } from '../factories/recordFactory.js';

beforeEach(cleanDatabase)

afterAll(async () => {
    await cleanDatabase();
    await endConnection();
})

describe("GET /records", () => {

    beforeEach(async () => {
        const params = {name: 'MyIntegrationTest', email: 'test@test.com', password: '123456' }
        await insertFakeUserInDatabase(params);
        await fakeLogin("Meu_Token_Seguro")
    })

    it("returns status 200 for successfuly get my records", async () => {
        const token = "Bearer Meu_Token_Seguro";

        const result = await supertest(app).get('/records').set('Authorization', token)

        expect(result.status).toEqual(200);
    })

    it("returns an expected body", async () => {

        const params = {value: 100, type: 'Incomming', date: '2017-03-18T03:00:00.000Z', description: 'Teste'};
        const valueResult = (params.value/100).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        const token = "Bearer Meu_Token_Seguro";
        await insertFakeRecord(params);

        const result = await supertest(app).get('/records').set('Authorization', token)

        expect(result.body).toEqual(
            {
                userId: 1,
                balance: valueResult,
                records: [{
                    id:1,
                    value: valueResult,
                    type: 'Incomming',
                    date: params.date,
                    description: 'Teste'
                }]
            }
        );
    });

    it("returns status 401 for unauthorized record access", async () => {

        const token = "Bearer Meu_Token";

        const result = await supertest(app).get('/records').set('Authorization', token)

        expect(result.status).toEqual(401);
    })
});

describe("POST /records/:transferType", () => {

    beforeEach(async () => {
        const params = {name: 'MyIntegrationTest', email: 'test@test.com', password: '123456' }
        await insertFakeUserInDatabase(params);
        await fakeLogin("Meu_Token_Seguro")
    });

    it("returns status 201 for created new Incomming record transfer", async () => {

        const params = {value: 100, description: 'Teste'};
        const token = "Bearer Meu_Token_Seguro";

        const result = await supertest(app).post('/records/In').send(params).set('Authorization', token)

        expect(result.status).toEqual(201);
    });

    it("returns status 201 for created new Withdraw record transfer", async () => {

        const params = {value: 100, description: 'Teste'};
        const token = "Bearer Meu_Token_Seguro";

        const result = await supertest(app).post('/records/Out').send(params).set('Authorization', token)

        expect(result.status).toEqual(201);
    });

    it("returns status 404 for invalid route", async () => {

        const params = {value: 100, description: 'Teste'};
        const token = "Bearer Meu_Token_Seguro";

        const result = await supertest(app).post('/records/Test').send(params).set('Authorization', token)

        expect(result.status).toEqual(404);
    });

    it("returns status 401 for unauthorized user", async () => {

        const params = {value: 100, description: 'Teste'};
        const token = "Bearer Meu_Token";

        const result = await supertest(app).post('/records/Test').send(params).set('Authorization', token)

        expect(result.status).toEqual(401);
    });

    it("returns status 400 for invalid body params", async () => {

        const params = {value: "", description: 'Teste'};
        const token = "Bearer Meu_Token_Seguro";

        const result = await supertest(app).post('/records/Out').send(params).set('Authorization', token)

        expect(result.status).toEqual(400);
    })
})