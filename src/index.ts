import { logger } from "./config/pino.js";
import { TokenGrabber } from "./structures/scrape.js";
import { app } from "./api/express.js";
import { Calendar } from "./structures/calendar.js";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { AssignmentDetails } from "./types/assignment.js";
import { MissingAssignmentDetails } from "./types/missing.js";
import { ScheduleDetails } from "./types/schedule.js";
import cron from "node-cron";

// @ts-expect-error
import Cronitor from "cronitor";
dotenv.config();

export const cronitor = Cronitor();

const calMonitor = new cronitor.Monitor('Create Assignment Calendar');
const missingMonitor = new cronitor.Monitor('Create Missing Calendar');
const rebootMonitor = new cronitor.Monitor('Perform Daily Reboot');


const tokenGrabber = new TokenGrabber();

const listener = app.listen(Number(process.env.PORT) || 3000 , () => {
	logger.info(listener.address(), `Your app has started`);
});
tokenGrabber.once("ready", async () => {
	logger.trace("Ready event fired");
	// run loop every 10 minutes
	await createAssignmentCalendar();
	await createMissingCalendar();
	await createScheduleCalendar();

	cron.schedule("*/10 * * * *", async () => {
		await calMonitor.ping({state: "run"})
		await createAssignmentCalendar();
		await calMonitor.ping({state: "complete"})
	});

	cron.schedule("*/10 * * * *", async () => {
		await missingMonitor.ping({state: "run"})
		await createMissingCalendar();
		await missingMonitor.ping({state: "complete"})
	});
});

cron.schedule("0 0 * * *", async () => {
	await rebootMonitor.ping({state: "run"});
	logger.info("Performing Midnight Reboot");
	await rebootMonitor.ping({state: "complete"});
	process.exit(0);
});


async function createAssignmentCalendar() {
	logger.info("Generating New Assignment Calendar");
	const assignments = await tokenGrabber.getAssignments();
	if(!assignments) return;

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

async function createMissingCalendar() {
	logger.info("Generating New Missing Calendar");
	const assignments = await tokenGrabber.getMissing();
	if(!assignments) return;

	const calendar = new Calendar();
	calendar.setType("MISSING");
	
	assignments.map((assignment: MissingAssignmentDetails) => {
		calendar.addEvent({
			summary: assignment.AssignmentTitle,
			description: assignment.AssignmentLongDescription,
			id: assignment.AssignmentId,
			start: dayjs().toDate(),
			priority: 9,
			allDay: true,
		});
	});

	await calendar.saveCalendar();
	logger.info("Missing Calendar Generated");
}

async function createScheduleCalendar() {
	logger.info("Generating New Schedule Calendar");
	const schedules = await tokenGrabber.getSchedule();
	if(!schedules) return;

	const calendar = new Calendar();
	calendar.setType("SCHEDULE");
	
	schedules.map((schedule: ScheduleDetails) => {
		calendar.addEvent({
			summary: schedule.Title,
			start: dayjs(schedule.StartDate).toDate(),
			end: dayjs(schedule.EndDate).toDate(),
			allDay: schedule.AllDay,
			description: `Attendance: ${schedule.AttendanceDesc}`,
		});
	});

	await calendar.saveCalendar();
	logger.info("Schedule Calendar Generated");
}

// export * from every file
export * from "./structures/scrape.js";
export * from "./structures/calendar.js";
export * from "./types/assignment.js";
export * from "./types/calendar.js";
export * from "./types/missing.js";
export * from "./types/schedule.js";