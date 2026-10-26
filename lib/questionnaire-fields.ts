import type {
  AddressHistoryEntry,
  ApplicantInfoSection,
  ChildEntry,
  DeclarationSection,
  EducationAssessmentSection,
  EducationHistoryEntry,
  EmploymentEntry,
  LanguageTestSection,
  PassportSection,
  QuestionnaireSectionId,
  QuestionnaireSectionStatus,
  SiblingEntry,
  TravelHistoryEntry,
} from "./types.ts";

export const SECTION_LABELS: Record<QuestionnaireSectionId, string> = {
  applicantInfo: "Applicant Information",
  languageTest: "Language Test",
  educationAssessment: "Education Credential Assessment",
  passport: "Passport",
  employment: "Employment History (Past 10 Years)",
  educationHistory: "Education History",
  addressHistory: "Address History (Past 10 Years)",
  parents: "Parents",
  children: "Children",
  siblings: "Siblings",
  travelHistory: "Travel History",
  declaration: "Declaration",
};

export const SECTION_STATUS_LABEL: Record<QuestionnaireSectionStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
};

// Reuses existing tokens (no new ones) — complete borrows the
// checklist's "approved" green, in_progress uses the neutral accent.
export const SECTION_STATUS_BADGE_CLASS: Record<QuestionnaireSectionStatus, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-accent text-accent-foreground",
  complete: "bg-status-approved text-status-approved-foreground",
};

// Sections with a built UI so far (Phase 3, stages 1-5).
export const BUILT_SECTIONS: QuestionnaireSectionId[] = [
  "applicantInfo",
  "languageTest",
  "educationAssessment",
  "passport",
  "employment",
  "educationHistory",
  "addressHistory",
  "children",
  "siblings",
  "travelHistory",
  "declaration",
];

export interface QuestionnaireField<T> {
  name: keyof T;
  label: string;
  type?: "yesNo";
}

export interface QuestionnaireStep {
  id: string;
  label: string;
  fields: QuestionnaireField<ApplicantInfoSection>[];
}

// Applicant Information split into steps (per docs/MEETING.md: a
// "step-by-step digital questionnaire" replacing long, intimidating
// forms) rather than one 27-field page.
export const APPLICANT_INFO_STEPS: QuestionnaireStep[] = [
  {
    id: "identity",
    label: "Identity",
    fields: [
      { name: "lastName", label: "Last name" },
      { name: "firstName", label: "First name" },
      { name: "middleName", label: "Middle name" },
      {
        name: "nicknameAliasMaidenName",
        label: "Nickname / Alias / Maiden name (if applicable)",
      },
      { name: "citizenship", label: "Citizenship" },
      { name: "sex", label: "Sex" },
      { name: "eyeColour", label: "Eye colour" },
      { name: "height", label: "Height" },
      { name: "dateOfBirth", label: "Date of birth" },
      { name: "placeOfBirth", label: "Place of birth" },
      { name: "maritalStatus", label: "Marital status" },
    ],
  },
  {
    id: "address",
    label: "Address & Contact",
    fields: [
      { name: "currentAddress", label: "Current address" },
      { name: "townCity", label: "Town/City" },
      { name: "stateProvince", label: "State/Province" },
      { name: "country", label: "Country" },
      { name: "postalCode", label: "Postal code" },
      { name: "email", label: "Email" },
      { name: "cellphone", label: "Cellphone" },
      { name: "landline", label: "Landline" },
      {
        name: "statusIfLivingOutsideNationality",
        label: "If living outside your country of nationality, indicate your status",
      },
    ],
  },
  {
    id: "marriage",
    label: "Marital & Spouse History",
    fields: [
      { name: "currentSpouseName", label: "Name of current spouse (if applicable)" },
      { name: "dateOfMarriage", label: "Date of marriage (if applicable)" },
      { name: "occupation", label: "Occupation" },
      {
        name: "previousSpouseName",
        label: "If widowed or previously married, name of previous spouse",
      },
      { name: "previousMarriageFrom", label: "Previous marriage: from" },
      { name: "previousMarriageTo", label: "Previous marriage: to" },
      { name: "previousSpouseDateOfBirth", label: "Date of birth of the previous spouse" },
    ],
  },
];

export const LANGUAGE_TEST_FIELDS: QuestionnaireField<LanguageTestSection>[] = [
  {
    name: "hasTakenTest",
    label: "Have you taken any language proficiency test?",
    type: "yesNo",
  },
];

export const EDUCATION_ASSESSMENT_FIELDS: QuestionnaireField<EducationAssessmentSection>[] = [
  {
    name: "hasECA",
    label: "Have you had your Education Credentialing Assessment?",
    type: "yesNo",
  },
  { name: "assessmentCompletionDate", label: "If yes, the date of assessment completion" },
  { name: "ecaIdNumber", label: "ECA ID Number" },
];

export const PASSPORT_FIELDS: QuestionnaireField<PassportSection>[] = [
  { name: "passportNumber", label: "Passport number" },
  { name: "placeOfIssue", label: "Place of issue" },
  { name: "dateOfIssue", label: "Date of issue" },
  { name: "dateOfExpiry", label: "Date of expiry" },
];

// toPresent is a checkbox, handled specially in the form — excluded
// here so these stay string-only (defaultValue/FormData are strings).
export const EMPLOYMENT_ENTRY_FIELDS: QuestionnaireField<Omit<EmploymentEntry, "toPresent">>[] = [
  { name: "from", label: "From (MM/YYYY)" },
  { name: "to", label: "To (MM/YYYY)" },
  { name: "position", label: "Position" },
  { name: "hoursPerWeek", label: "Hours per week" },
  { name: "responsibilities", label: "Responsibilities" },
  { name: "employerAddress", label: "Employer address" },
  { name: "townCity", label: "Town/City" },
  { name: "stateProvince", label: "State/Province" },
  { name: "country", label: "Country" },
  { name: "postalCode", label: "Postal code" },
];

export const EDUCATION_HISTORY_ENTRY_FIELDS: QuestionnaireField<EducationHistoryEntry>[] = [
  { name: "institutionName", label: "Name of institution" },
  { name: "from", label: "From" },
  { name: "to", label: "To" },
  { name: "schoolAddress", label: "School address" },
  { name: "country", label: "Country" },
  { name: "townCity", label: "Town/City" },
  { name: "stateProvince", label: "State/Province" },
  { name: "postalCode", label: "Postal Code" },
  { name: "certificateType", label: "Type of certificate or diploma issued" },
  { name: "fieldOfStudy", label: "Field of study" },
];

export const ADDRESS_HISTORY_ENTRY_FIELDS: QuestionnaireField<AddressHistoryEntry>[] = [
  { name: "from", label: "From (YYYY-MM-DD)" },
  { name: "to", label: "To (YYYY-MM-DD)" },
  { name: "address", label: "Address" },
  { name: "townCity", label: "Town/City" },
  { name: "stateProvince", label: "State/Province" },
  { name: "country", label: "Country" },
];

export const CHILD_ENTRY_FIELDS: QuestionnaireField<ChildEntry>[] = [
  { name: "lastName", label: "Last name" },
  { name: "firstName", label: "First name" },
  { name: "middleName", label: "Middle name" },
  { name: "eyeColour", label: "Eye colour" },
  { name: "height", label: "Height" },
  { name: "sex", label: "Sex" },
  { name: "dateOfBirth", label: "Date of birth" },
  { name: "placeOfBirth", label: "Place of birth" },
  { name: "maritalStatus", label: "Marital status" },
  { name: "currentAddress", label: "Current address" },
  { name: "townCity", label: "Town/City" },
  { name: "stateProvince", label: "State/Province" },
  { name: "country", label: "Country" },
  { name: "postalCode", label: "Postal code" },
  {
    name: "statusIfLivingOutsideNationality",
    label: "If living outside country of nationality, indicate status",
  },
  { name: "email", label: "Email" },
];

// Same as a child, minus eye colour/height — matches docs/CIF.md,
// which consistently doesn't ask those for siblings.
export const SIBLING_ENTRY_FIELDS: QuestionnaireField<SiblingEntry>[] = [
  { name: "lastName", label: "Last name" },
  { name: "firstName", label: "First name" },
  { name: "middleName", label: "Middle name" },
  { name: "sex", label: "Sex" },
  { name: "dateOfBirth", label: "Date of birth" },
  { name: "placeOfBirth", label: "Place of birth" },
  { name: "maritalStatus", label: "Marital status" },
  { name: "currentAddress", label: "Current address" },
  { name: "townCity", label: "Town/City" },
  { name: "stateProvince", label: "State/Province" },
  { name: "country", label: "Country" },
  { name: "postalCode", label: "Postal code" },
  {
    name: "statusIfLivingOutsideNationality",
    label: "If living outside country of nationality, indicate status",
  },
  { name: "email", label: "Email" },
];

export const TRAVEL_HISTORY_ENTRY_FIELDS: QuestionnaireField<TravelHistoryEntry>[] = [
  { name: "from", label: "From (YYYY-MM-DD)" },
  { name: "to", label: "To (YYYY-MM-DD)" },
  { name: "countryOrTerritory", label: "Country or Territory" },
  { name: "location", label: "Location" },
  { name: "purposeOfTravel", label: "Purpose of Travel" },
];

// "Have you OR any of your family members ever:" — per docs/CIF.md.
export const DECLARATION_FIELDS: QuestionnaireField<DeclarationSection>[] = [
  {
    name: "convictedOrCharged",
    label:
      "Been convicted of, or are you currently charged with, on trial for, or party to a crime or offence, or subject to any criminal proceeding in any country?",
    type: "yesNo",
  },
  {
    name: "previouslySoughtRefugeeOrVisa",
    label:
      "Previously sought refugee status in Canada or applied for Canadian Immigrant or permanent resident visa OR visitor or temporary resident visa?",
    type: "yesNo",
  },
  {
    name: "refusedRefugeeOrVisa",
    label:
      "Been refused refugee status in, or an immigrant or permanent resident visa or visitor or temporary resident visa to Canada or any other country?",
    type: "yesNo",
  },
  {
    name: "refusedAdmissionOrOrderedToLeave",
    label: "Been refused admission to or ordered to leave Canada OR any other country?",
    type: "yesNo",
  },
  {
    name: "genocideWarCrimesCrimeAgainstHumanity",
    label:
      "Been involved in an act of genocide, war crimes or in the commission of a crime against humanity?",
    type: "yesNo",
  },
  {
    name: "armedStruggleOrViolenceUse",
    label:
      "Used, planned or advocated the use of armed struggle or violence to reach political, religious or social objectives?",
    type: "yesNo",
  },
  {
    name: "associatedWithGroupUsingViolence",
    label:
      "Been associated with a group that used, uses, advocated or advocates the use of armed struggle or violence to reach political, religious or social objectives?",
    type: "yesNo",
  },
  {
    name: "memberOfCriminalOrganization",
    label:
      "Been a member of an organization that is or was engaged in an activity that is part of a pattern of criminal activity?",
    type: "yesNo",
  },
  {
    name: "seriousDiseaseOrDisorder",
    label: "Had any serious diseases or physical or mental disorders?",
    type: "yesNo",
  },
];
