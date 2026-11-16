import { COUNTRIES } from "./countries.ts";

// The client intake (CIF), step by step — Figma "CIF Complete • 01–32".
// One dynamic route (/questionnaire/[step]) renders every step from
// this data. Gate steps ("Do you have children?") ask Yes/No first;
// their fields only apply on Yes and can repeat ("+ Add another entry").

export type IntakeCategoryId =
  | "personal"
  | "family"
  | "address"
  | "education"
  | "employment"
  | "travel"
  | "immigration"
  | "background";

export type IntakeFieldType = "text" | "email" | "tel" | "date" | "month" | "select" | "yesNo" | "textarea";

export interface IntakeField {
  name: string;
  label: string;
  type: IntakeFieldType;
  required?: boolean;
  placeholder?: string;
  options?: readonly string[];
  // Other field(s) in the same step: this field is greyed out and not
  // sent until one of them has a value in `values` (spouse details open
  // on "Married", an explanation on any Yes).
  dependsOn?: { field: string | readonly string[]; values: readonly string[] };
}

export interface IntakeGate {
  name: string;
  question: string;
  whyIfNo: string;
  carefulIfNo: string;
}

export interface IntakeStep {
  id: string;
  category: IntakeCategoryId;
  title: string;
  whyWeAsk: string;
  beCareful?: string;
  gate?: IntakeGate;
  // Entries with no Yes/No first: always open, at least one needed
  // (e.g. every school attended).
  repeatable?: boolean;
  // Every field two per row; otherwise the first field is full width.
  pairAll?: boolean;
  fields: IntakeField[];
}

export const INTAKE_CATEGORIES: { id: IntakeCategoryId; label: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "family", label: "Family" },
  { id: "address", label: "Address" },
  { id: "education", label: "Education" },
  { id: "employment", label: "Employment" },
  { id: "travel", label: "Travel" },
  { id: "immigration", label: "Immigration" },
  { id: "background", label: "Background Check" },
];

const DATE = "YYYY-MM-DD";
const YES = ["yes"] as const;
const HAS_SPOUSE = ["Married", "Common-law"] as const;
const MONTH = "MM / YYYY";
const SEX = ["Female", "Male", "Another gender"] as const;
const EYE_COLOUR = ["Black", "Blue", "Brown", "Green", "Grey", "Hazel", "Other"] as const;
const MARITAL_STATUS = ["Single", "Married", "Common-law", "Separated", "Divorced", "Widowed"] as const;
const LIVING_OR_DECEASED = ["Living", "Deceased"] as const;
const APPLICATION_TYPES = ["Visitor", "Study", "Work", "Permanent residence", "Refugee", "Other"] as const;

// Current address block shared by parents, children and siblings, in
// the CIF's order.
const ADDRESS_FIELDS: IntakeField[] = [
  { name: "street", label: "Current address", type: "text", placeholder: "Street and number" },
  { name: "city", label: "Town / city", type: "text", placeholder: "Enter city" },
  { name: "province", label: "State / province", type: "text", placeholder: "Enter region" },
  { name: "country", label: "Country", type: "select", placeholder: "Select country", options: COUNTRIES },
  { name: "postalCode", label: "Postal code", type: "text", placeholder: "Enter code" },
  { name: "statusAbroad", label: "If living outside country of nationality, status", type: "text", placeholder: "Study / work / PR / other" },
];

// One child or sibling, in the CIF's order: name, (eye colour, height,)
// sex, birth, marital status, email, current address.
// Laid out two per row, so related fields pair up.
function relativeFields({ physical, birthRequired }: { physical: boolean; birthRequired: boolean }): IntakeField[] {
  return [
    { name: "lastName", label: "Last name", type: "text", required: true, placeholder: "Enter last name" },
    { name: "firstName", label: "First name", type: "text", required: true, placeholder: "Enter first name" },
    { name: "middleName", label: "Middle name", type: "text", placeholder: "If applicable" },
    { name: "sex", label: "Sex", type: "select", placeholder: "Select", options: SEX },
    ...(physical
      ? ([
          { name: "eyeColour", label: "Eye colour", type: "select", placeholder: "Select", options: EYE_COLOUR },
          { name: "height", label: "Height", type: "text", placeholder: "In centimetres" },
        ] satisfies IntakeField[])
      : []),
    { name: "dateOfBirth", label: "Date of birth", type: "date", required: birthRequired, placeholder: DATE },
    { name: "placeOfBirth", label: "Place of birth", type: "text", required: birthRequired, placeholder: "City, country" },
    { name: "maritalStatus", label: "Marital status", type: "select", placeholder: "Select status", options: MARITAL_STATUS },
    { name: "email", label: "Email", type: "email", placeholder: "name@example.com" },
    ...ADDRESS_FIELDS,
  ];
}

// Mother or father, in the CIF's order. "Living or deceased" isn't on
// the sheet; it opens "If deceased, date" only when it applies.
const PARENT_FIELDS: IntakeField[] = [
  { name: "lastName", label: "Last name", type: "text", required: true, placeholder: "Enter last name" },
  { name: "firstName", label: "First name", type: "text", required: true, placeholder: "Enter first name" },
  { name: "middleName", label: "Middle name", type: "text", placeholder: "If applicable" },
  { name: "livingOrDeceased", label: "Living or deceased?", type: "select", required: true, placeholder: "Select", options: LIVING_OR_DECEASED },
  { name: "dateOfBirth", label: "Date of birth", type: "date", placeholder: DATE },
  { name: "placeOfBirth", label: "Place of birth", type: "text", placeholder: "City, country" },
  { name: "maritalStatus", label: "Marital status", type: "select", placeholder: "Select status", options: MARITAL_STATUS },
  { name: "deceasedDate", label: "If deceased, date", type: "date", placeholder: DATE, dependsOn: { field: "livingOrDeceased", values: ["Deceased"] } },
  { name: "occupation", label: "Occupation", type: "text", placeholder: "Current or last job title" },
  { name: "email", label: "Email", type: "email", placeholder: "name@example.com" },
  ...ADDRESS_FIELDS,
];

export const INTAKE_STEPS: IntakeStep[] = [
  {
    id: "legal-identity",
    category: "personal",
    title: "Legal identity",
    whyWeAsk: "Include every name you have legally used.",
    fields: [
      { name: "lastName", label: "Last name", type: "text", required: true, placeholder: "As shown on passport" },
      { name: "firstName", label: "First name", type: "text", required: true, placeholder: "As shown on passport" },
      { name: "middleName", label: "Middle name", type: "text", placeholder: "If applicable" },
      { name: "otherNames", label: "Other names used", type: "text", placeholder: "Nickname / maiden / alias" },
      { name: "citizenship", label: "Citizenship", type: "select", required: true, placeholder: "Select country", options: COUNTRIES },
    ],
  },
  {
    id: "birth-physical",
    category: "personal",
    title: "Birth & physical details",
    whyWeAsk: "Birth details and physical characteristics help identify the applicant.",
    beCareful: "Check your birth date, birthplace, sex, eye colour and height against your records.",
    fields: [
      { name: "dateOfBirth", label: "Date of birth", type: "date", required: true, placeholder: DATE },
      { name: "placeOfBirth", label: "Place of birth", type: "text", required: true, placeholder: "City and country" },
      { name: "sex", label: "Sex", type: "select", required: true, placeholder: "Select", options: SEX },
      { name: "eyeColour", label: "Eye colour", type: "select", placeholder: "Select", options: EYE_COLOUR },
      { name: "height", label: "Height", type: "text", placeholder: "In centimetres" },
    ],
  },
  {
    id: "contact",
    category: "personal",
    title: "Contact information",
    whyWeAsk: "Contact details allow staff to reach you about corrections and next steps.",
    beCareful: "Check your email and phone numbers; keep them current.",
    fields: [
      { name: "email", label: "Email address", type: "email", required: true, placeholder: "name@example.com" },
      { name: "cellphone", label: "Cellphone", type: "tel", required: true, placeholder: "+1 ..." },
      { name: "landline", label: "Landline", type: "tel", placeholder: "Optional" },
      { name: "occupation", label: "Current occupation", type: "text", placeholder: "Enter occupation" },
      { name: "nationality", label: "Country of nationality", type: "select", placeholder: "Select country", options: COUNTRIES },
    ],
  },
  {
    id: "status-citizenship",
    category: "personal",
    title: "Status & citizenship",
    whyWeAsk: "Citizenship and residence status clarify where you hold nationality and where you live.",
    beCareful: "If you live outside your country of nationality, state your immigration status there.",
    fields: [
      { name: "livingOutsideNationality", label: "Living outside your country of nationality?", type: "yesNo", required: true },
      { name: "countryOfResidence", label: "Current country of residence", type: "select", required: true, placeholder: "Select country", options: COUNTRIES, dependsOn: { field: "livingOutsideNationality", values: YES } },
      { name: "immigrationStatus", label: "Immigration status", type: "select", placeholder: "Study / work / other", options: ["Study", "Work", "Visitor", "Permanent resident", "Other"], dependsOn: { field: "livingOutsideNationality", values: YES } },
      { name: "statusExpiry", label: "Status expiry if applicable", type: "date", placeholder: DATE, dependsOn: { field: "livingOutsideNationality", values: YES } },
      { name: "otherCitizenships", label: "Other citizenships", type: "text", placeholder: "List if applicable" },
    ],
  },
  {
    id: "passport",
    category: "personal",
    title: "Passport",
    whyWeAsk: "Passport details help staff verify the travel document used for the application.",
    beCareful: "Check passport number, place of issue, issue date and expiry date carefully.",
    fields: [
      { name: "passportNumber", label: "Passport number", type: "text", required: true, placeholder: "Enter passport number" },
      { name: "countryOfIssue", label: "Country of issue", type: "select", required: true, placeholder: "Select country", options: COUNTRIES },
      { name: "placeOfIssue", label: "Place of issue", type: "text", required: true, placeholder: "Enter city" },
      { name: "issueDate", label: "Issue date", type: "date", required: true, placeholder: DATE },
      { name: "expiryDate", label: "Expiry date", type: "date", required: true, placeholder: DATE },
    ],
  },
  {
    id: "marital-status",
    category: "family",
    title: "Marital status",
    whyWeAsk: "Marital information helps staff record your family circumstances.",
    beCareful: "If married or common-law, include your spouse or partner's name, marriage date and occupation.",
    fields: [
      { name: "maritalStatus", label: "Current marital status", type: "select", required: true, placeholder: "Select status", options: MARITAL_STATUS },
      { name: "spouseName", label: "Name of current spouse or partner", type: "text", placeholder: "Surname, first name", dependsOn: { field: "maritalStatus", values: HAS_SPOUSE } },
      { name: "marriageDate", label: "Date of marriage", type: "date", placeholder: DATE, dependsOn: { field: "maritalStatus", values: HAS_SPOUSE } },
      { name: "spouseOccupation", label: "Spouse or partner's occupation", type: "text", placeholder: "Current job title", dependsOn: { field: "maritalStatus", values: HAS_SPOUSE } },
    ],
  },
  {
    id: "previous-relationships",
    category: "family",
    title: "Previous relationships",
    whyWeAsk: "Previous marriage details help staff document past relationships.",
    beCareful: "If widowed or previously married, give your previous spouse's name, the dates of the relationship and their date of birth.",
    fields: [
      { name: "previouslyMarried", label: "Previously married or widowed?", type: "yesNo", required: true },
      { name: "formerSpouseName", label: "Previous spouse's name", type: "text", placeholder: "Surname, first name", dependsOn: { field: "previouslyMarried", values: YES } },
      { name: "formerSpouseDateOfBirth", label: "Previous spouse's date of birth", type: "date", placeholder: DATE, dependsOn: { field: "previouslyMarried", values: YES } },
      { name: "relationshipStart", label: "From", type: "date", placeholder: DATE, dependsOn: { field: "previouslyMarried", values: YES } },
      { name: "relationshipEnd", label: "To", type: "date", placeholder: DATE, dependsOn: { field: "previouslyMarried", values: YES } },
    ],
  },
  ...(["mother", "father"] as const).map(
    (parent): IntakeStep => ({
      id: `${parent}-details`,
      category: "family",
      title: parent === "mother" ? "Mother details" : "Father details",
      whyWeAsk: "Parent information is collected as part of the family record.",
      beCareful: "Give the full legal name, birth details, occupation and current address. If deceased, give the date.",
      pairAll: true,
      fields: PARENT_FIELDS,
    })
  ),
  {
    id: "children",
    category: "family",
    title: "Children",
    whyWeAsk: "The CIF collects details of children as part of your family information.",
    beCareful: "Include each child's full legal name, birth details, current address and status if they live outside their country of nationality.",
    gate: {
      name: "hasChildren",
      question: "Do you have children?",
      whyIfNo: "The CIF collects details of children as part of your family information.",
      carefulIfNo: "If No, child fields stay inactive. If Yes, provide each child’s details.",
    },
    fields: [
      ...relativeFields({ physical: true, birthRequired: true }),
    ],
  },
  {
    id: "siblings",
    category: "family",
    title: "Siblings",
    whyWeAsk: "The CIF collects sibling information for the family record.",
    beCareful: "Include each sibling's full legal name, birth details, current address and status if they live outside their country of nationality.",
    gate: {
      name: "hasSiblings",
      question: "Do you have siblings?",
      whyIfNo: "The CIF collects sibling information for the family record.",
      carefulIfNo: "If No, sibling fields stay inactive. Do not enter placeholder names.",
    },
    fields: [
      ...relativeFields({ physical: false, birthRequired: false }),
    ],
  },
  {
    id: "current-address",
    category: "address",
    title: "Current address",
    whyWeAsk: "Your current address helps staff confirm your present place of residence.",
    beCareful: "Check city, province/state, country and postal code for accuracy.",
    fields: [
      { name: "street", label: "Street address", type: "text", required: true, placeholder: "Enter street and number" },
      { name: "city", label: "City", type: "text", required: true, placeholder: "Enter city" },
      { name: "province", label: "Province / state", type: "text", required: true, placeholder: "Enter region" },
      { name: "country", label: "Country", type: "select", required: true, placeholder: "Select country", options: COUNTRIES },
      { name: "postalCode", label: "Postal code", type: "text", placeholder: "Enter code" },
    ],
  },
  {
    id: "previous-addresses",
    category: "address",
    title: "Previous addresses",
    whyWeAsk: "The CIF asks for addresses covering the past 10 years.",
    beCareful: "Use accurate from/to dates and check for missing periods or overlaps.",
    gate: {
      name: "hadOtherAddress",
      question: "Lived at another address in the past 10 years?",
      whyIfNo: "The CIF asks for addresses covering the past 10 years, so staff confirm your current address covers it.",
      carefulIfNo: "Answer No only if you have lived at your current address for the whole 10 years.",
    },
    fields: [
      { name: "streetCity", label: "Street / city", type: "text", required: true, placeholder: "Enter address" },
      { name: "provinceCountry", label: "Province / country", type: "text", placeholder: "Enter location" },
      { name: "from", label: "From date", type: "date", required: true, placeholder: DATE },
      { name: "to", label: "To date", type: "date", required: true, placeholder: DATE },
    ],
  },
  {
    id: "schooling",
    category: "education",
    title: "Secondary & postsecondary",
    whyWeAsk: "The CIF requests schooling from secondary level to your highest attainment.",
    beCareful: "Use MM/YYYY dates and include school address, credential and field of study.",
    repeatable: true,
    fields: [
      { name: "institution", label: "School / institution", type: "text", required: true, placeholder: "Enter institution" },
      { name: "fieldOfStudy", label: "Field of study", type: "text", placeholder: "Enter field" },
      { name: "from", label: "From date", type: "month", required: true, placeholder: MONTH },
      { name: "to", label: "To date", type: "month", required: true, placeholder: MONTH },
      { name: "credential", label: "Credential / diploma", type: "text", placeholder: "Enter credential" },
    ],
  },
  {
    id: "eca",
    category: "education",
    title: "Education credential assessment",
    whyWeAsk: "The CIF asks for your ECA completion date and ID if you have one.",
    beCareful: "Check the assessment date and copy the ECA ID accurately.",
    gate: {
      name: "hasEca",
      question: "Have you had an Educational Credential Assessment (ECA)?",
      whyIfNo: "An Educational Credential Assessment (ECA) may be part of your record.",
      carefulIfNo: "If No, assessment date and ECA ID are not applicable.",
    },
    fields: [
      { name: "completionDate", label: "Assessment completion date", type: "date", required: true, placeholder: DATE },
      { name: "ecaId", label: "ECA ID number", type: "text", required: true, placeholder: "Enter ID" },
      { name: "organization", label: "Assessment organization", type: "text", placeholder: "Enter organization" },
      { name: "credential", label: "Credential assessed", type: "text", placeholder: "Enter credential" },
    ],
  },
  {
    id: "language-test",
    category: "education",
    title: "Language test",
    whyWeAsk: "Language test information helps staff understand any test history you report.",
    beCareful: "Add each test you have taken, with its date and result.",
    gate: {
      name: "hasTakenTest",
      question: "Have you taken a language proficiency test?",
      whyIfNo: "The CIF asks whether you have taken a language proficiency test.",
      carefulIfNo: "If No, follow-up test details should stay inactive.",
    },
    fields: [
      { name: "testType", label: "Test type", type: "select", placeholder: "IELTS / CELPIP / TEF / other", options: ["IELTS General", "IELTS Academic", "CELPIP", "PTE Core", "TEF", "TCF", "Other"] },
      { name: "testDate", label: "Test date", type: "date", placeholder: DATE },
      { name: "result", label: "Test result / reference", type: "text", placeholder: "Enter result" },
    ],
  },
  {
    id: "current-employment",
    category: "employment",
    title: "Current employment",
    whyWeAsk: "Employment history is requested for the past 10 years.",
    beCareful: "Include month/year, employer, position, weekly hours, duties and address.",
    fields: [
      { name: "employed", label: "Currently employed?", type: "yesNo", required: true },
      { name: "employer", label: "Employer if Yes", type: "text", placeholder: "Enter employer", dependsOn: { field: "employed", values: YES } },
      { name: "position", label: "Position / title", type: "text", placeholder: "Enter role", dependsOn: { field: "employed", values: YES } },
      { name: "from", label: "From date", type: "month", placeholder: MONTH, dependsOn: { field: "employed", values: YES } },
      { name: "hoursPerWeek", label: "Hours per week", type: "text", placeholder: "Enter hours", dependsOn: { field: "employed", values: YES } },
    ],
  },
  {
    id: "previous-employment",
    category: "employment",
    title: "Previous employment",
    whyWeAsk: "Past employers help complete the 10-year employment history.",
    beCareful: "Check month/year ranges and include responsibilities and employer addresses.",
    gate: {
      name: "workedElsewhere",
      question: "Worked elsewhere in the past 10 years?",
      whyIfNo: "The CIF asks for every employer in the past 10 years, so staff confirm there are none to add.",
      carefulIfNo: "Count part-time, contract and self-employed work too before answering No.",
    },
    fields: [
      { name: "employer", label: "Employer", type: "text", required: true, placeholder: "Enter employer" },
      { name: "positionHours", label: "Position / hours", type: "text", placeholder: "Enter details" },
      { name: "from", label: "From date", type: "month", required: true, placeholder: MONTH },
      { name: "to", label: "To date", type: "month", required: true, placeholder: MONTH },
    ],
  },
  {
    id: "travel",
    category: "travel",
    title: "Travel history",
    whyWeAsk: "Travel records help staff document destinations and purposes of trips.",
    beCareful: "Use YYYY-MM-DD dates, country/territory, location and purpose for each trip.",
    gate: {
      name: "hasTravelled",
      question: "Have you travelled outside your countries of citizenship or residence?",
      whyIfNo: "The CIF asks about qualifying travel outside citizenship or residence countries.",
      carefulIfNo: "Only include trips within the CIF time window; answer Yes or No first.",
    },
    fields: [
      { name: "from", label: "From date", type: "date", required: true, placeholder: DATE },
      { name: "to", label: "To date", type: "date", required: true, placeholder: DATE },
      { name: "location", label: "Country / location", type: "text", required: true, placeholder: "Enter destination" },
      { name: "purpose", label: "Purpose of travel", type: "text", required: true, placeholder: "Enter purpose" },
    ],
  },
  {
    id: "past-applications",
    category: "immigration",
    title: "Past Canadian applications",
    whyWeAsk: "Previous applications are part of the immigration history declaration.",
    beCareful: "Report relevant applications accurately, for yourself or family members.",
    gate: {
      name: "appliedBefore",
      question: "Have you or a family member previously applied for Canadian status?",
      whyIfNo: "The CIF asks about previous Canadian immigration and refugee applications.",
      carefulIfNo: "Answer for yourself or family members as worded in the CIF.",
    },
    fields: [
      { name: "applicationType", label: "Application type", type: "select", required: true, placeholder: "Visitor / study / work / PR / refugee", options: APPLICATION_TYPES },
      { name: "applicationDate", label: "Application date", type: "date", placeholder: DATE },
      { name: "outcome", label: "Outcome", type: "select", placeholder: "Approved / refused / pending", options: ["Approved", "Refused", "Pending", "Withdrawn"] },
      { name: "details", label: "Application details", type: "text", placeholder: "Enter details" },
    ],
  },
  {
    id: "visa-refusal",
    category: "immigration",
    title: "Visa refusal",
    whyWeAsk: "Refusal history helps staff identify records needing clarification.",
    beCareful: "Answer truthfully; include refusals by Canada or any other country.",
    gate: {
      name: "refusedBefore",
      question: "Have you or a family member ever been refused a visa or status?",
      whyIfNo: "The CIF asks about refusals by Canada or any other country.",
      carefulIfNo: "Include relevant refusals; the question covers you or family members.",
    },
    fields: [
      { name: "country", label: "Country", type: "select", required: true, placeholder: "Select country", options: COUNTRIES },
      { name: "refusalDate", label: "Refusal date", type: "date", placeholder: DATE },
      { name: "applicationType", label: "Application type", type: "select", placeholder: "Select type", options: APPLICATION_TYPES },
      { name: "explanation", label: "Explanation", type: "textarea", required: true, placeholder: "Describe refusal" },
    ],
  },
  {
    id: "admission-removal",
    category: "immigration",
    title: "Admission or removal",
    whyWeAsk: "The CIF asks whether you were refused admission or ordered to leave a country.",
    beCareful: "Include Canada and other countries; read the full question before answering.",
    fields: [
      { name: "refusedEntry", label: "Refused entry to, or ordered to leave, any country?", type: "yesNo", required: true },
      { name: "country", label: "Country if Yes", type: "select", placeholder: "Select country", options: COUNTRIES, dependsOn: { field: "refusedEntry", values: YES } },
      { name: "date", label: "Date if Yes", type: "date", placeholder: DATE, dependsOn: { field: "refusedEntry", values: YES } },
      { name: "decision", label: "Decision / order type", type: "text", placeholder: "Enter details", dependsOn: { field: "refusedEntry", values: YES } },
      { name: "explanation", label: "Explanation if Yes", type: "textarea", placeholder: "Describe circumstances", dependsOn: { field: "refusedEntry", values: YES } },
    ],
  },
  {
    id: "criminal-proceedings",
    category: "background",
    title: "Criminal proceedings",
    whyWeAsk: "The CIF asks about charges, convictions, trials and other criminal proceedings.",
    beCareful: "Answer for yourself or family members; disclose ongoing proceedings too.",
    fields: [
      { name: "charged", label: "Ever charged, convicted or on trial for an offence?", type: "yesNo", required: true },
      { name: "country", label: "Country if Yes", type: "select", placeholder: "Select country", options: COUNTRIES, dependsOn: { field: "charged", values: YES } },
      { name: "offence", label: "Offence / proceeding", type: "textarea", placeholder: "Describe", dependsOn: { field: "charged", values: YES } },
      { name: "dateStatus", label: "Date / status", type: "text", placeholder: "Enter details", dependsOn: { field: "charged", values: YES } },
      { name: "familyMember", label: "Family member involved?", type: "yesNo", dependsOn: { field: "charged", values: YES } },
    ],
  },
  {
    id: "war-crimes-violence",
    category: "background",
    title: "War crimes & violence",
    whyWeAsk: "The CIF asks about war crimes, violence and certain group associations.",
    beCareful: "Read every question separately; do not treat a group of questions as one.",
    fields: [
      { name: "warCrimes", label: "Involved in war crimes, genocide or crimes against humanity?", type: "yesNo", required: true },
      { name: "advocatedViolence", label: "Used, planned or advocated armed violence?", type: "yesNo", required: true },
      { name: "violentGroup", label: "Associated with a group that uses or advocates violence?", type: "yesNo", required: true },
      { name: "criminalOrganization", label: "Member of a criminal organization?", type: "yesNo", required: true },
      { name: "explanation", label: "If you answered Yes to any, explain", type: "textarea", placeholder: "Provide details", dependsOn: { field: ["warCrimes", "advocatedViolence", "violentGroup", "criminalOrganization"], values: YES } },
    ],
  },
  {
    id: "medical-history",
    category: "background",
    title: "Medical history",
    whyWeAsk: "The CIF asks about serious diseases or physical or mental disorders.",
    beCareful: "Answer the question truthfully; ask your case team if unsure how to respond.",
    fields: [
      { name: "seriousCondition", label: "Any serious disease or physical or mental disorder?", type: "yesNo", required: true },
      { name: "personConcerned", label: "Person concerned if Yes", type: "select", placeholder: "Self / family member", options: ["Self", "Spouse or partner", "Child", "Other family member"], dependsOn: { field: "seriousCondition", values: YES } },
      { name: "condition", label: "Condition if Yes", type: "text", placeholder: "Enter details", dependsOn: { field: "seriousCondition", values: YES } },
      { name: "dates", label: "Relevant dates", type: "text", placeholder: "Enter dates", dependsOn: { field: "seriousCondition", values: YES } },
      { name: "explanation", label: "Additional explanation", type: "text", placeholder: "Enter details", dependsOn: { field: "seriousCondition", values: YES } },
    ],
  },
];
