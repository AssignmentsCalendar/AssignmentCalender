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

export interface AssignmentList {
	[key: string]: SavedDetails;
}

export interface SavedDetails {
	class: string;
	name: string;
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

// group ids for classes but must be unique 
// format: "Category"-"Class"-#/Letter

export enum GroupID {
	"Algebra 1 - 1" = "A1-1",
	"Algebra 1 - 2" = "A1-2",
	"Algebra 1 - 3" = "A1-3",

	"Algebra 2 - 1" = "A2-1",
	"Algebra 2 - 2" = "A2-2",
	"Algebra 2 - 3" = "A2-3",

	"Vocal Ensemble - 1" = "VE-1",
	"Vocal Ensemble - 2" = "VE-2",
	"Vocal Ensemble - 3" = "VE-3",

	"British Literature - 1" = "BTL-1",
    "British Literature - 2" = "BTL-2",
    "British Literature - 3" = "BTL-3",

	"Beginners Latin - 1" = "BL-1",
    "Beginners Latin - 2" = "BL-2",
    "Beginners Latin - 3" = "BL-3",

	"Intermediate Latin - 1" = "IL-1",
    "Intermediate Latin - 2" = "IL-2",
    "Intermediate Latin - 3" = "IL-3",

	"Advanced Latin - 1" = "AL-1",
    "Advanced Latin - 2" = "AL-2",
    "Advanced Latin - 3" = "AL-3",

	"Biology - A" = "B-A",
	"Biology - B" = "B-B",
	"Biology - C" = "B-C",
	"Biology - D" = "B-D",
	"Biology - E" = "B-E",
	"Biology - F" = "B-F",

    "Other" = "O-O",
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
