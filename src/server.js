import './setup.js';
import app from './app.js';

const port = process.env.PORT;

app.listen(4000, () => {
    console.log(`Server running on port ${port}!`)
})