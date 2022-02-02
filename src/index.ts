import { logger } from "./config/pino.js";
import { TokenGrabber } from "./structures/scrape.js";
import { app } from "./api/express.js";
import { Calendar } from "./structures/calendar.js";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { AssignmentDetails } from "./types/assignment.js";
import cron from "node-cron";

// @ts-expect-error
import Cronitor from "cronitor";
dotenv.config();

export const cronitor = Cronitor();

const calMonitor = new cronitor.Monitor('Create Calendars');
const rebootMonitor = new cronitor.Monitor('Create Calendars');


const tokenGrabber = new TokenGrabber();

const listener = app.listen(Number(process.env.PORT) || 3000 , () => {
	logger.info(listener.address(), `Your app has started`);
});
tokenGrabber.once("ready", async () => {
	logger.trace("Ready event fired");
	// run loop every 10 minutes
	createAssignmentCalendar();
	cron.schedule("*/1 * * * *", async () => {
		await calMonitor.ping({state: "run"})
		createAssignmentCalendar();
		await calMonitor.ping({state: "complete"})
	});
});

cron.schedule("0 0 * * *", async () => {
	rebootMonitor.ping({state: "run"});
	logger.info("Performing Midnight Reboot");
	rebootMonitor.ping({state: "complete"});
	process.exit(0);
});


async function createAssignmentCalendar() {
	logger.info("Generating New Assignment Calendar");
	const assignments: AssignmentDetails[] = await tokenGrabber.getAssignments();

	const calendar = new Calendar();
	calendar.setType("ASSIGNMENT");
	
	assignments.map((assignment: AssignmentDetails) => {
		calendar.addEvent({
			summary: assignment.Title,
			description: assignment.LongDescription,
			id: assignment.AssignmentId,
			start: dayjs(assignment.DateDue).toDate(),
			allDay: true,
		});
	});

	await calendar.saveCalendar();
	logger.info("Assignment Calendar Generated");
}

// export * from every file
export * from "./structures/scrape.js";
export * from "./structures/calendar.js";
export * from "./types/assignment.js";
export * from "./types/calendar.js";