import ics from 'ics';
import { logger } from '../config/pino.js';
import fs from 'fs/promises';

export function CreateCalender(assignments: any[]){
    const events: ics.EventAttributes[] = assignments.map(assignment => {
        const dateData = assignment.DateDue.split(/[\/ :]/gm);
        
        const year = Number(dateData[2]);
        const month = Number(dateData[0]);
        const day = Number(dateData[1]);

        // sanitise title and description
        let title = assignment.Title.replace(/(?:<.*?>|&.*?;)/gm, ' ');
        let description = assignment.LongDescription.replace(/(?:<.*?>|&.*?;)/gm, ' ');
        
        title.replace(/  /gm, ' ');
        description.replace(/  /gm, ' ');

        logger.info("Creating event for: " + title);
        const event: ics.EventAttributes = {
            start: [year, month, day],
            end: [year, month, day],
            title: `${assignment.GroupName} - ${title}`,
            description: description,
            categories: [assignment.AssignmentType, assignment.GroupName],
            calName: `Assignments`,
        }

        return event;
    });

    const {error, value} = ics.createEvents(events);

    if (error) {
        return logger.error(error);
    }

    fs.writeFile('./public/calendar.ics', value, 'utf8');

    return value;
}