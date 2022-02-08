export enum RequestedList {
    "MISSING",
    "ASSIGNMENTS",
    "SCHEDULE"
}

export interface ErrorDetails {
    Error:       string;
    ReferenceId: string;
    ErrorType:   string;
    ErrorId:     number;
}