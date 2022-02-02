import { logger } from "./config/pino.js";
import { TokenGrabber } from "./structures/scrape.js";
import { app } from "./api/express.js";
import { Calendar } from "./structures/calendar.js";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { AssignmentDetails } from "./types/assignment.js";
dotenv.config();


const tokenGrabber = new TokenGrabber();

const listener = app.listen(Number(process.env.PORT) || 3000 , () => {
	logger.info(listener.address(), `Your app has started`);
});
tokenGrabber.on("ready", async () => {
	// run loop every 10 minutes
	createAssignmentCalendar();
	setInterval(createAssignmentCalendar, 10 * 60 * 1000);
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