import { logger } from "./config/pino.js";
import { CreateCalender } from "./util/createCalender.js";
import { TokenGrabber } from "./util/scrape.js";
import { app } from "./api/express.js";
import dotenv from "dotenv";
dotenv.config();


export const tokenGrabber = new TokenGrabber();

const listener = app.listen(process.env.PORT, () => {
	logger.info("Server started on port " + listener.address());
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
