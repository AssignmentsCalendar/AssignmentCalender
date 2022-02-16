export enum RequestedList {
    "MISSING",
    "ASSIGNMENTS",
    "SCHEDULE"
}

export enum ScraperStatus {
    "IDLE",
    "REQUESTING_TOKEN",
    "REQUESTING_CALENDAR",
    "REQUESTING_ASSIGNMENTS",
    "REQUESTING_MISSING",
    "REQUESTING_SCHEDULE",
    "INITIALIZING",
}

export interface ErrorDetails {
    Error:       string;
    ReferenceId: string;
    ErrorType:   string;
    ErrorId:     number;
}