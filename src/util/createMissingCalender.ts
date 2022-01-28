import ics from "ics";
import { logger } from "../config/pino.js";
import fs from "fs/promises";
import dayjs from "dayjs";

export function CreateMissingCalender(assignments: any[]) {
	const events: ics.EventAttributes[] = assignments.map((assignment) => {

		const year = Number(dayjs().year());
		const month = Number(dayjs().month() + 1);
		const day = Number(dayjs().format("DD"));

		// sanitise title and description
		let title = assignment.AssignmentTitle.replace(/(?:<.*?>|&.*?;)/gm, " ");
		let description = assignment.AssignmentLongDescription.replace(/(?:<.*?>|&.*?;)/gm, " ");

		title.replace(/  /gm, " ");
		description.replace(/  /gm, " ");

		logger.info("Creating event for: " + title);
		const event: ics.EventAttributes = {
			start: [year, month, day],
			end: [year, month, day],
			title: `${assignment.GroupName} - ${title}`,
			description: description,
			categories: [assignment.AssignmentType, assignment.GroupName],
			calName: `Missing Assignments`
		};

		return event;
	});

	const { error, value } = ics.createEvents(events);

	if (error) {
		return logger.error(error);
	}

	fs.writeFile("./public/calendar_missing.ics", value, "utf8");

	return value;
}
