import express from 'express';
import cors from 'cors';

import authMiddleware from './middlewares/authMiddleware.js';
import * as userController from './controllers/userController.js';
import * as recordController from './controllers/recordController.js';

const app = express();

app.use(express.json());
app.use(cors());

app.post("/sign-up", userController.signUp)

app.post("/login", userController.singIn)

app.post("/logout", authMiddleware, userController.logout)

app.get("/records", authMiddleware, recordController.getAllUserRecords)

app.post("/records/:transferType", authMiddleware, recordController.postNewRecord)

export default app;