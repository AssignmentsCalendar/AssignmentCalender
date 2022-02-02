import { CalendarType } from "../types/calendar.js";
import ical, {
	ICalCalendar,
	ICalCalendarData,
	ICalDescription,
	ICalEvent,
	ICalEventData
} from "ical-generator";
import dayjs from "dayjs";
import { logger } from "../config/pino.js";

export class Calendar {
	type?: string;
	calendar: ICalCalendar;
	constructor(data?: ICalCalendarData) {
		if (data) {
			this.calendar = ical(data);
		} else {
			this.calendar = ical();
		}

		this.calendar.timezone("America/Chicago");
		this.calendar.prodId({ company: "Serabus", product: "CalendarExporter", language: "en-US" });
		this.calendar.source("https://node2.serabusm.com");
		this.calendar.scale("GREGORIAN");
		this.calendar.description("Calendar exported from CORE");
	}

	public setType(type: keyof typeof CalendarType) {
		const typeString = CalendarType[type];
		this.calendar.name(typeString);
		this.type = type;
	}

	public setEvents(events: ICalEventData[]) {
		this.calendar.events(events);
		return this.calendar.events();
	}

	public addEvent(event: ICalEventData) {
		event.summary = event.summary?.replace(/[<&].*?[>;]/gm, " ");

		// if event summary is a string remove non-breaking spaces
		if (typeof event.summary === "string") {
			event.summary = event.summary.replace(/&#.*?;/gm, " ");
		}

		logger.trace(`Adding event to calendar: ${event.summary}`);
		this.calendar.createEvent(event);
		return this.calendar.events();
	}

	public clearEvents() {
		this.calendar.clear();
	}

	public async saveCalendar(path?: string) {
		if (!path) {
			path = `./public/calendar_${this.type}.ics`;
		}

		return await this.calendar.save(path);
	}
}
