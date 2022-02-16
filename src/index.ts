import { logger } from "./config/pino.js";
import { TokenGrabber } from "./structures/scrape.js";
import { app } from "./api/express.js";
import { Calendar } from "./structures/calendar.js";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { AssignmentDetails, AssignmentList } from "./types/assignment.js";
import { MissingAssignmentDetails } from "./types/missing.js";
import { ScheduleDetails } from "./types/schedule.js";
import cron from "node-cron";
import fs from "fs/promises";
// @ts-expect-error
import Cronitor from "cronitor";
dotenv.config();

const cronitor = Cronitor();
let json: AssignmentList;

const calMonitor = new cronitor.Monitor("Create Assignment Calendar");
const missingMonitor = new cronitor.Monitor("Create Missing Calendar");
const scheduleMonitor = new cronitor.Monitor("Create Schedule Calendar");

const tokenGrabber = new TokenGrabber();

const listener = app.listen(Number(process.env.PORT) || 3000, () => {
	logger.info(listener.address(), `Your app has started`);
});
tokenGrabber.once("ready", async () => {
	logger.trace("Ready event fired");

	try {
		json = JSON.parse(
			await fs.readFile("./public/assignments.json", { encoding: "utf-8", flag: "a+" })
		);
	} catch (err) {
		json = {};
	}

	await createAssignmentCalendar();
	await createMissingCalendar();
	await createScheduleCalendar();

	cron.schedule("*/10 * * * *", async () => {
		await calMonitor.ping({ state: "run" });
		await createAssignmentCalendar();
		await calMonitor.ping({ state: "complete" });
	});

	cron.schedule("*/10 * * * *", async () => {
		await missingMonitor.ping({ state: "run" });
		await createMissingCalendar();
		await missingMonitor.ping({ state: "complete" });
	});

	cron.schedule("*/10 * * * *", async () => {
		await scheduleMonitor.ping({ state: "run" });
		await createScheduleCalendar();
		await scheduleMonitor.ping({ state: "complete" });
	});
});

async function createAssignmentCalendar(): Promise<void> {
	logger.trace("Generating New Assignment Calendar");
	const assignments = await tokenGrabber.getAssignments();
	if (!assignments) return;

	const calendar = new Calendar();
	calendar.setType("ASSIGNMENT");

	assignments.map((assignment: AssignmentDetails) => {
		calendar.addEvent({
			summary: assignment.Title,
			description: assignment.LongDescription,
			id: assignment.AssignmentId,
			start: dayjs(assignment.DateDue).toDate(),
			allDay: true
		});

		if (json[assignment.AssignmentId]) return;
		json[assignment.AssignmentId] = {
			class: assignment.GroupName,
			name: assignment.Title,
			description: assignment.LongDescription,
			creationDate: dayjs().format("MM/DD/YYYY hh:mm:ss"),
			setAssignedDate: assignment.DateAssigned,
			dueDate: assignment.DateDue
		};
	});

	await fs.writeFile("./public/assignments.json", JSON.stringify(json));
	logger.info("Assignments Saved to JSON");

	await calendar.saveCalendar();
	logger.info("New Assignment Calendar Generated");
}

async function createMissingCalendar(): Promise<void> {
	logger.trace("Generating New Missing Calendar");
	const assignments = await tokenGrabber.getMissing();
	if (!assignments) return;

	const calendar = new Calendar();
	calendar.setType("MISSING");

	assignments.map((assignment: MissingAssignmentDetails) => {
		calendar.addEvent({
			summary: assignment.AssignmentTitle,
			description: assignment.AssignmentLongDescription,
			id: assignment.AssignmentId,
			start: dayjs().toDate(),
			priority: 9,
			allDay: true
		});
	});

	await calendar.saveCalendar();
	logger.info("New Missing Calendar Generated");
}

async function createScheduleCalendar(): Promise<void> {
	logger.trace("Generating New Schedule Calendar");
	const schedules = await tokenGrabber.getSchedule();
	if (!schedules) return;

	const calendar = new Calendar();
	calendar.setType("SCHEDULE");

	schedules.map((schedule: ScheduleDetails) => {
		calendar.addEvent({
			summary: schedule.Title,
			start: dayjs(schedule.StartDate).toDate(),
			end: dayjs(schedule.EndDate).toDate(),
			allDay: schedule.AllDay,
			description: `Attendance: ${schedule.AttendanceDesc}`
		});
	});

	await calendar.saveCalendar();
	logger.info("New Schedule Calendar Generated");
}

process.on("SIGINT", async () => {
	logger.info("Shutdown signal received, closing connections and exiting");
	await tokenGrabber.destroy();
	listener.close();
	process.exit(0);
});

// export * from every file
export * from "./structures/scrape.js";
export * from "./structures/calendar.js";
export * from "./types/assignment.js";
export * from "./types/calendar.js";
export * from "./types/missing.js";
export * from "./types/schedule.js";
