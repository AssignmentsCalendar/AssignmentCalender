export interface MissingAssignmentDetails {
	GroupName: string;
	SectionId: number;
	AssignmentId: number;
	AssignmentTitle: string;
	DateAssignedTicks: number;
	DateAssigned: string;
	DateDueTicks: number;
	DateDue: string;
	AssignmentLongDescription: string;
	AssignmentIndexId: number;
	GradeBookInd: boolean;
	PublishGrade: boolean;
	DropBoxInd: boolean;
	HasLinks: boolean;
	HasDownloads: boolean;
	AssignmentStatus: number;
	AssessmentInd: boolean;
	AssessmentLocked: boolean;
	ShowReport: null;
	HasGrade: boolean;
	LtiInd: boolean;
	LtiProviderName: null;
	DiscussionInd: boolean;
	FormativeInd: boolean;
	MasteryLocked: boolean;
}
