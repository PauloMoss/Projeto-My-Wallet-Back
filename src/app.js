import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.get("/teste", async (req,res) => {
    res.send('ok')
})

app.listen(4000, () => {
    console.log("Server running on port 4000!")
})