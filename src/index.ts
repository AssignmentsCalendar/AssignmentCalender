import { logger } from "./config/pino.js";
import { CreateCalender } from "./util/createAssignmentCalender.js";
import { TokenGrabber } from "./util/scrape.js";
import { app } from "./api/express.js";
import dotenv from "dotenv";
import { CreateMissingCalender } from "./util/createMissingCalender.js";
dotenv.config();

export const tokenGrabber = new TokenGrabber();

const listener = app.listen(Number(process.env.PORT) || 3000 , () => {
	logger.info(listener.address(), `Your app has started`);
});
tokenGrabber.on("ready", async () => {
	// run loop every 5 minutes
	loop();
	setInterval(loop, 300000);
});

async function loop() {
	logger.info("Generating New Assignment Calendar");
	const assignments = await tokenGrabber.getAssignments();
	CreateCalender(assignments);
	logger.info("New Calendar Assignment Generated");

	logger.info("Generating New Missing Assignments Calendar");
	const missing = await tokenGrabber.getMissing();
	CreateMissingCalender(missing);
	logger.info("New Calendar Missing Assignments Generated");
}