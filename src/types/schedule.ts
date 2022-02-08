export interface ScheduleDetails {
    AllDay:              boolean;
    AssociationId:       number;
    AttendanceDesc:      AttendanceDesc;
    AttendanceInd?:      number;
    AttendanceRequired?: boolean;
    DisplayAttendance:   boolean;
    EndDate:             string;
    GroupId?:            number;
    LinkableCoursePage:  boolean;
    PresetId:            number;
    SortOrder:           number;
    StartDate:           string;
    Title:               string;
    UserId:              number;
}

export enum AttendanceDesc {
    AbsentExcused = "Absent Excused",
    AttendanceDesc = "",
    Attended = "Attended",
    Empty = "--",
}