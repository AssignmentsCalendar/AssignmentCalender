import express from "express";
import serveIndex from "serve-index";

export const app = express();
// Set X-Frame-Options to DENY
app.use((req, res, next) => {
	res.setHeader("X-Frame-Options", "DENY");
	next();
});

app.use(express.static("public"));
app.use("/errors", serveIndex("public/errors", { icons: true }));
app.use("/logs", serveIndex("public/log", { icons: true }));

app.get("/", (req, res) => {
	res.send("Hello World!");
});
