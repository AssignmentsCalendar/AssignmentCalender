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
