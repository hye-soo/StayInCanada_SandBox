// ponytail: single visa type for the MVP; widen when more are added
export type VisaType = "student";

export type UserRole = "client" | "rcic" | "admin";

export interface AppUser {
  id: string;
  role: UserRole;
}

export interface Client extends AppUser {
  role: "client";
  name: string;
  visaType: VisaType;
}

export type ChecklistItemStatus =
  | "required"
  | "submitted"
  | "under_review"
  | "changes_required"
  | "approved";

export interface ChecklistItem {
  id: string;
  label: string;
  whyNeeded: string;
  status: ChecklistItemStatus;
  // Set by the mock upload flow — no real file is ever stored.
  fileName?: string;
  fileSize?: number;
  // Hardcoded mock AI output, pending staff review (Phase 2 demo).
  aiReport?: string;
  // Mock preview of AI-suggested form content. Real form auto-fill is
  // a stretch goal / research spike (docs/IMPLEMENTATION_PLAN.md) —
  // this is illustrative only, not a working feature.
  aiFormSuggestion?: string;
  // Admin's optional internal note when forwarding to RCIC. Visible
  // to RCIC only, never to the client (admin never contacts the
  // client directly — see docs/CURRENT_USER_FLOW_V2.md).
  adminNote?: string;
  // Set by RCIC when requesting changes.
  rcicComment?: string;
}

// --- Smart intake questionnaire (Client Information Form) ---
// Structure matches docs/CIF.md. Two likely copy-paste artifacts in
// the source were treated as duplicates and dropped rather than
// modeled: a repeated "Country" line in Section A right after the
// current-address block, and a repeated "Country" field per
// employment entry in Section E. Flag in docs/CIF.md if either was
// intentional and distinct from what's modeled here.

export interface ApplicantInfoSection {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  nicknameAliasMaidenName?: string;
  citizenship?: string;
  sex?: string;
  eyeColour?: string;
  height?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  maritalStatus?: string;
  currentAddress?: string;
  townCity?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
  email?: string;
  cellphone?: string;
  landline?: string;
  statusIfLivingOutsideNationality?: string;
  currentSpouseName?: string;
  dateOfMarriage?: string;
  occupation?: string;
  previousSpouseName?: string;
  previousMarriageFrom?: string;
  previousMarriageTo?: string;
  previousSpouseDateOfBirth?: string;
}

export interface LanguageTestSection {
  hasTakenTest?: "yes" | "no";
}

export interface EducationAssessmentSection {
  hasECA?: "yes" | "no";
  assessmentCompletionDate?: string;
  ecaIdNumber?: string;
}

export interface PassportSection {
  passportNumber?: string;
  placeOfIssue?: string;
  dateOfIssue?: string;
  dateOfExpiry?: string;
}

export interface EmploymentEntry {
  from?: string;
  to?: string;
  toPresent?: boolean;
  position?: string;
  hoursPerWeek?: string;
  responsibilities?: string;
  employerAddress?: string;
  townCity?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
}

export interface EducationHistoryEntry {
  institutionName?: string;
  from?: string;
  to?: string;
  schoolAddress?: string;
  country?: string;
  townCity?: string;
  stateProvince?: string;
  postalCode?: string;
  certificateType?: string;
  fieldOfStudy?: string;
}

export interface AddressHistoryEntry {
  from?: string;
  to?: string;
  address?: string;
  townCity?: string;
  stateProvince?: string;
  country?: string;
}

export interface ParentInfo {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  maritalStatus?: string;
  deceasedDate?: string;
  occupation?: string;
  currentAddress?: string;
  townCity?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
  statusIfLivingOutsideNationality?: string;
  email?: string;
}

export interface ParentsSection {
  mother: ParentInfo;
  father: ParentInfo;
}

// Children include eyeColour/height; siblings don't — matches
// docs/CIF.md's two sections, which consistently differ on this.
export interface ChildEntry {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  eyeColour?: string;
  height?: string;
  sex?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  maritalStatus?: string;
  currentAddress?: string;
  townCity?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
  statusIfLivingOutsideNationality?: string;
  email?: string;
}

export interface SiblingEntry {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  sex?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  maritalStatus?: string;
  currentAddress?: string;
  townCity?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
  statusIfLivingOutsideNationality?: string;
  email?: string;
}

export interface TravelHistoryEntry {
  from?: string;
  to?: string;
  countryOrTerritory?: string;
  location?: string;
  purposeOfTravel?: string;
}

export interface TravelHistorySection {
  hasTravelled?: "yes" | "no";
  entries: TravelHistoryEntry[];
}

export interface DeclarationSection {
  convictedOrCharged?: "yes" | "no";
  previouslySoughtRefugeeOrVisa?: "yes" | "no";
  refusedRefugeeOrVisa?: "yes" | "no";
  refusedAdmissionOrOrderedToLeave?: "yes" | "no";
  genocideWarCrimesCrimeAgainstHumanity?: "yes" | "no";
  armedStruggleOrViolenceUse?: "yes" | "no";
  associatedWithGroupUsingViolence?: "yes" | "no";
  memberOfCriminalOrganization?: "yes" | "no";
  seriousDiseaseOrDisorder?: "yes" | "no";
}

export interface QuestionnaireResponse {
  applicantInfo: ApplicantInfoSection;
  languageTest: LanguageTestSection;
  educationAssessment: EducationAssessmentSection;
  passport: PassportSection;
  employment: EmploymentEntry[];
  educationHistory: EducationHistoryEntry[];
  addressHistory: AddressHistoryEntry[];
  parents: ParentsSection;
  children: ChildEntry[];
  siblings: SiblingEntry[];
  travelHistory: TravelHistorySection;
  declaration: DeclarationSection;
}

export type QuestionnaireSectionId = keyof QuestionnaireResponse;

export type QuestionnaireSectionStatus = "not_started" | "in_progress" | "complete";
