//require is used for imports
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDb = require("./src/config/db");
const globalRouter = require('./src/routes/routes')

const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

//routes
app.use('/api/', globalRouter);

//start
connectDb();
app.listen(port, () => {
    console.log(`server is running at port: ${port}`);
})
