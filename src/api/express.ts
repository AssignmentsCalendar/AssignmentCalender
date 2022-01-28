import express from "express";
import serveIndex from "serve-index";

export const app = express();

app.use(express.static("public"));
app.use("/errors", serveIndex("public/errors", { icons: true }));
app.use("/log", serveIndex("public/log", { icons: true }));

app.get("/", (req, res) => {
	res.send("Hello World!");
});
