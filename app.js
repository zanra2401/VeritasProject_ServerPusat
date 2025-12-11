const express = require("express");
require("dotenv").config();
const router = require(__dirname + "/src/routes/router.js");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
app.use(express.json());
app.use('/api/v1', router);

app.listen(process.env.PORT, () => {
    console.log("Server is starting on port " + process.env.PORT);
});

module.exports = app;