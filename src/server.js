import './setup.js';
import app from './app.js';

const port = +process.env.PORT || 4000;

app.listen(4000, () => {
    console.log(`Server running on port ${port}!`)
})