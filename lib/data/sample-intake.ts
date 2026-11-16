import type { IntakeAnswers } from "../intake.ts";

// Demo only: a finished intake for the mock client Alice, so the
// review/submit screens can be shown without typing 25 steps.
// Every value is invented.
export const SAMPLE_INTAKE: IntakeAnswers = {
  "legal-identity": {
    values: { lastName: "Chang", firstName: "Alice", middleName: "", otherNames: "Chang Mei-Ling", citizenship: "Taiwan" },
  },
  "birth-physical": {
    values: { dateOfBirth: "1996-04-12", placeOfBirth: "Taipei, Taiwan", sex: "Female", eyeColour: "Brown", height: "163 cm" },
  },
  contact: {
    values: {
      email: "alice@example.com",
      cellphone: "+1 604 555 0142",
      landline: "",
      occupation: "Graduate student",
      nationality: "Taiwan",
    },
  },
  "status-citizenship": {
    values: {
      livingOutsideNationality: "yes",
      countryOfResidence: "Canada",
      immigrationStatus: "Study",
      statusExpiry: "2027-06-30",
      otherCitizenships: "None",
    },
  },
  passport: {
    values: {
      passportNumber: "X00000000",
      countryOfIssue: "Taiwan",
      placeOfIssue: "Taipei",
      issueDate: "2021-03-02",
      expiryDate: "2031-03-01",
    },
  },
  "marital-status": {
    values: { maritalStatus: "Single", spouseName: "", marriageDate: "", spouseOccupation: "" },
  },
  "previous-relationships": { values: { previouslyMarried: "no" } },
  "mother-details": {
    values: {
      lastName: "Lin",
      firstName: "Hui-Wen",
      middleName: "",
      livingOrDeceased: "Living",
      dateOfBirth: "1968-09-03",
      placeOfBirth: "Tainan, Taiwan",
      maritalStatus: "Married",
      occupation: "Teacher",
      email: "huiwen@example.com",
      street: "88 Sample Road",
      city: "Taipei",
      province: "Taipei",
      country: "Taiwan",
      postalCode: "100",
    },
  },
  "father-details": {
    values: {
      lastName: "Chang",
      firstName: "Wei",
      middleName: "",
      livingOrDeceased: "Living",
      dateOfBirth: "1965-01-21",
      placeOfBirth: "Taichung, Taiwan",
      maritalStatus: "Married",
      occupation: "Engineer",
      email: "wei@example.com",
      street: "88 Sample Road",
      city: "Taipei",
      province: "Taipei",
      country: "Taiwan",
      postalCode: "100",
    },
  },
  children: { values: { hasChildren: "no" } },
  siblings: {
    values: { hasSiblings: "yes" },
    entries: [
      {
        lastName: "Chang",
        firstName: "Daniel",
        middleName: "",
        sex: "Male",
        dateOfBirth: "1999-07-18",
        placeOfBirth: "Taipei, Taiwan",
        maritalStatus: "Single",
        email: "daniel@example.com",
        street: "88 Sample Road",
        city: "Taipei",
        province: "Taipei",
        country: "Taiwan",
        postalCode: "100",
        statusAbroad: "",
      },
    ],
  },
  "current-address": {
    values: { street: "1200 Example Street, Unit 504", city: "Vancouver", province: "BC", country: "Canada", postalCode: "V6B 0A0" },
  },
  "previous-addresses": {
    values: { hadOtherAddress: "yes" },
    entries: [
      { streetCity: "88 Sample Road, Taipei", provinceCountry: "Taiwan", from: "2019-09-01", to: "2024-08-31" },
      { streetCity: "12 Example Lane, Tainan", provinceCountry: "Taiwan", from: "2016-08-01", to: "2019-08-31" },
    ],
  },
  schooling: {
    values: {},
    entries: [
      { institution: "National Taiwan University", fieldOfStudy: "Computer Science", from: "2014-09", to: "2018-06", credential: "Bachelor of Science" },
      { institution: "Taipei Municipal High School", fieldOfStudy: "General studies", from: "2011-09", to: "2014-06", credential: "High school diploma" },
    ],
  },
  eca: {
    values: { hasEca: "yes" },
    entries: [{ completionDate: "2024-02-15", ecaId: "ECA-0000000", organization: "WES", credential: "Bachelor's degree" }],
  },
  "language-test": {
    values: { hasTakenTest: "yes" },
    entries: [{ testType: "IELTS General", testDate: "2024-01-20", result: "L 8.0 / R 7.5 / W 7.0 / S 7.0" }],
  },
  "current-employment": {
    values: { employed: "yes", employer: "Example Cafe", position: "Barista", from: "2024-10", hoursPerWeek: "20" },
  },
  "previous-employment": {
    values: { workedElsewhere: "yes" },
    entries: [
      { employer: "Sample Tech Co.", from: "2018-07", to: "2024-07", positionHours: "Software developer, 40 hrs/week" },
    ],
  },
  travel: {
    values: { hasTravelled: "yes" },
    entries: [{ from: "2023-12-20", to: "2024-01-05", location: "Tokyo, Japan", purpose: "Vacation" }],
  },
  "past-applications": {
    values: { appliedBefore: "yes" },
    entries: [{ applicationType: "Study", applicationDate: "2024-03-10", outcome: "Approved", details: "Study permit" }],
  },
  "visa-refusal": { values: { refusedBefore: "no" } },
  "admission-removal": { values: { refusedEntry: "no" } },
  "criminal-proceedings": { values: { charged: "no", familyMember: "no" } },
  "war-crimes-violence": {
    values: { warCrimes: "no", advocatedViolence: "no", violentGroup: "no", criminalOrganization: "no" },
  },
  "medical-history": { values: { seriousCondition: "no" } },
};
