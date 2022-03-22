import { MissingAssignmentDetails } from "./missing";
import { ScheduleDetails } from "./schedule";

export interface AssignmentDetails {
    AssessmentId:      number;
    AssessmentInd:     boolean;
    AssessmentLocked:  boolean;
    AssignmentId:      number;
    AssignmentIndexId: number;
    AssignmentStatus:  number;
    AssignmentType:    string;
    DateAssigned:      string;
    DateDue:           string;
    DiscussionInd:     boolean;
    DropBoxInd:        boolean;
    LtiInd:            boolean;
    EnrollCount:       number;
    EventId:           number;
    GradedCount:       number;
    GroupId:           number;
    GroupName:         string;
    HasDownload:       boolean;
    HasGrade:          boolean;
    HasLink:           boolean;
    IncGradeBook:      boolean;
    LongDescription:   string;
    PresetId:          number;
    PublishGrade:      boolean;
    ShowReport:        boolean;
    Title:             string;
    UserId:            number;
    NewAssessmentInd:  boolean;
}

export interface AssignmentError {
    Error: string,
    ReferenceId: string,
    ErrorType: string,
    ErrorId: number
}

export type AssignmentRequestResult = AssignmentDetails[] | MissingAssignmentDetails[] | ScheduleDetails[] | AssignmentError

export interface AssignmentList {
	[key: string]: SavedDetails;
}

export interface SavedDetails {
	class: string;
	name: string;
    type: string;
	description: string;
	creationDate: string;
	setAssignedDate: string;
	dueDate: string;
}

// for ID Generation

export enum AssignmentID {
    "Homework" = "H",
    "Test" = "T",
    "Quiz" = "Q",
    "Project" = "P",
    "Major" = "M",
    "Other" = "O",
}

// ============================================================================
//
// AssignemtID + GroupID legend:
// X-Y-Z: X is the assignment type, Y is the class, Z is the class period
//
// Note: "Other" is used for assignments that are not in the above list
//      Most classes use a number for the class period, but some use letters
//
// Example: H-A1-1 is Homework for class Algebra 1, period 1
//          T-VE-1 is a Test for Vocal Ensemble, period 1
//          Q-BTL-1 is a Quiz for British Literature, period 1
//          P-BL-3 is a Project for Beginners Latin, period 3
//          M-AL-3 is a Major for Advanced Latin, period 3
//          O-O-O is an assignment of type other and unknown class
// ============================================================================
