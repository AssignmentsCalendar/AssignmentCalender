import { logger } from "./config/pino.js";
import { TokenGrabber } from "./structures/scrape.js";
import { app } from "./api/express.js";
import { Calendar } from "./structures/calendar.js";
import dotenv from "dotenv";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import dayjs from "dayjs";
import { AssignmentDetails, AssignmentList, GroupID, AssignmentID } from "./types/assignment.js";
import { MissingAssignmentDetails } from "./types/missing.js";
import { ScheduleDetails } from "./types/schedule.js";
import io from "@pm2/io";
import cron from "node-cron";
import fs from "fs/promises";
// @ts-expect-error
import Cronitor from "cronitor";
dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

const cronitor = Cronitor();

const calMonitor = new cronitor.Monitor("Create Assignment Calendar");
const missingMonitor = new cronitor.Monitor("Create Missing Calendar");
const scheduleMonitor = new cronitor.Monitor("Create Schedule Calendar");

const tokenGrabber = new TokenGrabber();

const listener = app.listen(Number(process.env.PORT) || 3000, () => {
	logger.info(listener.address(), `Your app has started`);
});
tokenGrabber.once("ready", async () => {
	logger.trace("Ready event fired");

	cron.schedule("*/5 * * * *", async () => {
		logger.trace("Cron Fired");

		logger.trace("Creating Assignment Calendar");
		await calMonitor.ping({ state: "run" });
		await createAssignmentCalendar();
		await calMonitor.ping({ state: "complete" });
		logger.trace("Assignment Calendar Created");

		logger.trace("Creating Missing Calendar");
		await missingMonitor.ping({ state: "run" });
		await createMissingCalendar();
		await missingMonitor.ping({ state: "complete" });
		logger.trace("Missing Calendar Created");

		logger.trace("Creating Schedule Calendar");
		await scheduleMonitor.ping({ state: "run" });
		await createScheduleCalendar();
		await scheduleMonitor.ping({ state: "complete" });
		logger.trace("Schedule Calendar Created");
	});
});

async function createAssignmentCalendar(): Promise<void> {
	logger.trace("Generating New Assignment Calendar");
	const assignments = await tokenGrabber.getAssignments();
	if (!assignments) return;

	const calendar = new Calendar();
	calendar.setType("ASSIGNMENT");

	const json: AssignmentList = await readAssignments();

	assignments.map(async (assignment: AssignmentDetails) => {
		calendar.addEvent({
			summary: assignment.Title,
			description: assignment.LongDescription,
			id: assignment.AssignmentId,
			start: dayjs(assignment.DateDue).toDate(),
			allDay: true
		});

		const id = generateID(assignment);

		if (json[id] != undefined) return;
		json[id] = {
			class: assignment.GroupName,
			name: assignment.Title,
			description: assignment.LongDescription,
			creationDate: dayjs().tz("America/Chicago").format("MM/DD/YYYY hh:mm:ss A z"),
			setAssignedDate: assignment.DateAssigned,
			dueDate: assignment.DateDue
		};

		logger.info(`New Assignment: ${assignment.Title}`);
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

async function readAssignments() {
	let j = {};

	try {
		j = JSON.parse(
			await fs.readFile("./public/assignments.json", { encoding: "utf-8", flag: "a+" })
		);
	} catch {
		j = {};
		await fs.writeFile("./public/assignments.json", JSON.stringify({}));
	}

	logger.info("Assignments Read from JSON");
	return j;
}

function generateID(assignment: AssignmentDetails) {
	let id: string = "";

	const assignmentID = assignment.AssignmentType as keyof typeof AssignmentID;
	if (assignmentID in AssignmentID) {
		id = id + AssignmentID[assignmentID];
	} else {
		id = id + AssignmentID.Other;
	}

	id = id + "-";

	const groupID = assignment.GroupName as keyof typeof GroupID;
	if (groupID in GroupID) {
		id = id + GroupID[groupID];
	} else {
		id = id + GroupID.Other;
	}

	id = id + "-" + assignment.AssignmentId;

	return id;
}

process.on("SIGINT", async () => {
	logger.info("Shutdown signal received, closing connections and exiting");
	await tokenGrabber.destroy();
	logger.info("Token Grabber destroyed");
	listener.close();
	logger.info("Listener closed");
	logger.flush();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	logger.info("Termination signal received, closing connections and exiting");
	await tokenGrabber.destroy();
	listener.close();
	logger.flush();
	process.exit(0);
});

process.on("unhandledRejection", async (reason, promise) => {
	logger.fatal("Unhandled Rejection at:", promise, "reason:", reason);
	await tokenGrabber.destroy();
	listener.close();
	logger.flush();
	process.exit(1);
});

process.on("uncaughtException", async (error) => {
	logger.fatal("Uncaught Exception:", error);
	await tokenGrabber.destroy();
	listener.close();
	logger.flush();
	process.exit(1);
});

// Create pm2 actions

io.action("enable debug logs", (cb:any) => {
	logger.info("Enabling debug logs");
	logger.level = "trace";
	return cb({ sucess: true });
});

io.action("disable debug logs", (cb:any) => {
	logger.info("Disabling debug logs");
	logger.level = "info";
	return cb({ sucess: true });
});

io.action("run CreateAssignmentCalendar()", async (cb:any) => {
	logger.info("Running CreateAssignmentCalendar()");
	await createAssignmentCalendar();
	return cb({ sucess: true });
});

io.action("run CreateMissingCalendar()", async (cb:any) => {
	logger.info("Running CreateMissingCalendar()");
	await createMissingCalendar();
	return cb({ sucess: true });
});

io.action("run CreateScheduleCalendar()", async (cb:any) => {
	logger.info("Running CreateScheduleCalendar()");
	await createScheduleCalendar();
	return cb({ sucess: true });
});

io.action("run CreateAllCalendars()", async (cb:any) => {
	logger.info("Running CreateAllCalendars()");
	await createAssignmentCalendar();
	await createMissingCalendar();
	await createScheduleCalendar();
	return cb({ sucess: true });
});

io.action("Save Assignments", async (cb:any) => {
	logger.info("Saving Assignments");
	await fs.writeFile("./public/assignments.json", JSON.stringify(await readAssignments()) || JSON.stringify({}));
	return cb({ sucess: true });
});

// export * from every file
export * from "./structures/scrape.js";
export * from "./structures/calendar.js";
export * from "./types/assignment.js";
export * from "./types/calendar.js";
export * from "./types/missing.js";
export * from "./types/schedule.js";
