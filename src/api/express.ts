import express from 'express';

export const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Hello World!");
});