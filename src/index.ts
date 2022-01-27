import { logger } from "./config/pino.js";
import { CreateCalender } from "./util/createCalender.js";
import { TokenGrabber } from "./util/scrape.js";
import { app } from "./api/express.js";
import dotenv from "dotenv";
dotenv.config();

export const tokenGrabber = new TokenGrabber();

const listener = app.listen(Number(process.env.PORT) || 3000, "node2.serabusm.com" , () => {
	logger.info(listener.address(), `Your app has started`);
});
tokenGrabber.on("ready", async () => {
	// run loop every 5 minutes
	loop();
	setInterval(loop, 300000);
});

async function loop() {
	logger.info("Generating New Calendar");
	const assignments = await tokenGrabber.getAssignments();
	CreateCalender(assignments);
	logger.info("New Calendar Generated");
}