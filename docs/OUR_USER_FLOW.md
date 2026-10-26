# FlowOui: Product User Flow (StayinCanada Immigration)

Source: Figma "FLOWOUI -- PRODUCT USERFLOW -- STAYINCANADA IMMIGRATION"

## Context and Notes

- The user flow **begins at client onboarding (after the invoice is paid)** and **ends at the RCIC application review and submission to IRCC** under the client's profile.
- Each phase is based on the MVP features and the essential workflow of the app, with the specified screens and additional features (in blue).
- The flow follows one general application process; some steps and requirements vary by application type.
- The pink "App" lane gives context for what actually happens inside the app.
- The flow is split by role to clarify actions within the same immigration process (5 phases): **Client → App → Admin/Staff → RCIC**. The app sits between staff and client, as it will in real life. The RCIC sits to the right of Admin/Staff to provide oversight and final validation before submission to IRCC.

**Open notes**

- IRCC application packaging and preparation need further clarification.
- Need to confirm features such as uploading pictures and file formatting.

## Legend

| Item           | Meaning                               |
| -------------- | ------------------------------------- |
| Pale yellow    | Client                                |
| Pale blue      | Admin                                 |
| Pale green     | Consultant / RCIC (Amr and Jean)      |
| Pink           | What happens in the app               |
| Violet diamond | Decision                              |
| Red arrow      | NO                                    |
| Green arrow    | YES                                   |
| Dashed arrow   | Corrections                           |
| Black arrow    | Regular process / next step           |
| Blue arrow     | Optional step                         |
| Blue circle    | Additional feature                    |
| (Brackets)     | Specifies which screen                |
| `**`           | Important                             |
| Star           | Needs attention / further development |
| Question mark  | Needs clarification / refining        |

**Screens:** 1. Log in / Sign up page · 2. Home Dashboard · 3. All Clients Dashboard (for Staff) · 4. Client Dashboard (for Staff) · 5. Intake screens · 6. Document Checklist screen · 7. Client Profile

## Overview

```mermaid
flowchart LR
    P1["Phase 1<br/>Onboarding"] --> P2["Phase 2<br/>Client Intake"]
    P2 --> P3["Phase 3<br/>Documentation Collection"]
    P3 --> P4["Phase 4<br/>Feedback and Validation"]
    P4 --> P5["Phase 5<br/>Application Preparation"]
    P5 --> END(["IRCC submission"])
```

**Additional features spanning phases:** Progress bar (Phases 2-5) · Client Chat (Phases 2, 3, 4)

---

## Phase 1: Onboarding

| Role       | Steps                                                                                                                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client** | Receives an invitation link (via email) from StayinCanada · Signs up for an account and logs in                                                                                                                                   |
| **App**    | Link directs user to the app · Creates client account, and creates dashboard and workspace                                                                                                                                        |
| **Admin**  | Logs in through Admin Portal · Copies link and sends it to client after receiving information from RCIC · Assigns application type to user                                                                                        |
| **RCIC**   | **START:** Client is confirmed after consultation · Logs in through RCIC / Staff portal · Selects client, reviews client profile _(All Clients Dashboard screen)_ · Confirms application and case type `**` based on consultation |

```mermaid
flowchart TD
    S([START]) --> R1["RCIC: Client is confirmed after consultation"]
    R1 --> R2["RCIC: Logs in through RCIC / Staff portal"]
    R2 --> R3["RCIC: Selects client, reviews client profile<br/>(All Clients Dashboard)"]
    R3 --> R4["RCIC: Confirms application and case type<br/>based on consultation **"]
    R4 --> A1["Admin: Logs in through Admin Portal"]
    A1 --> A2["Admin: Assigns application type to user"]
    A1 --> A3["Admin: Copies link and sends to client<br/>after receiving info from RCIC"]
    A3 --> C1["Client: Receives invitation link via email"]
    C1 --> P1["App: Link directs user to the app"]
    P1 --> C2["Client: Signs up for an account and logs in"]
    C2 --> P2["App: Creates client account,<br/>dashboard and workspace"]
```

---

## Phase 2: Client Intake

| Role       | Steps                                                                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client** | Begins the sectioned intake questions (includes all info in the CIF) · Completes after each section of the intake is done · _Additional feature:_ user can save and come back to the intake questions |
| **App**    | Displays questions in smaller sections at a time (provides short explanations) · Saves responses and displays "next" when users complete a section                                                    |
| **Admin**  | Views when a user has completed their intake _(Client dashboard)_ · Can review users' responses and flag if necessary _(Checklist screen)_                                                            |
| **RCIC**   | Can review intake responses and information _(Client dashboard)_ · Upon review, can request changes or contact client for more info _(Checklist screen)_                                              |

**Before finalization, can request changes or more info** (dashed correction loop back to the client, via _Client Chat_).

```mermaid
flowchart TD
    C1["Client: Begins sectioned intake<br/>(all info in CIF)"] --> P1["App: Displays questions in small sections<br/>with short explanations"]
    P1 --> C2["Client: Completes each section"]
    C2 --> P2["App: Saves responses, shows 'Next'"]
    C1 -.-> SAVE(("Save and come back<br/>to intake"))
    P2 --> A1["Admin: Views completed intake<br/>(Client dashboard)"]
    A1 --> A2["Admin: Reviews responses, flags if needed<br/>(Checklist screen)"]
    A1 --> R1["RCIC: Reviews intake responses<br/>(Client dashboard)"]
    R1 --> R2["RCIC: Requests changes or contacts client<br/>(Checklist screen)"]
    R2 -. "Before finalization<br/>(Client Chat)" .-> C1
```

---

## Phase 3: Documentation Collection

| Role       | Steps                                                                                                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Client** | Can view document checklist based on application · Uploads required documents by clicking each checklist item (with an explanation of why it's needed)                                                                                           |
| **App**    | Dashboard displays document checklist based on application type · Tracks uploads and submissions; status = **Required, Submitted, In Review, Needs changes** · Validates file size and format · Automatic notification for unfulfilled documents |
| **Admin**  | Can review checklist _(Checklist screen)_ · Can change document requirements for client _(Checklist screen)_ · Sends email notification of admin notes on web app to client for additional requirements                                          |
| **RCIC**   | Reviews and can approve documentation _(Checklist screen)_ · _Additional feature:_ Add / Remove / Customize requirements                                                                                                                         |

**Can request additional documents or changes to existing ones** (dashed correction loop back to the client, via _Client Chat_).

```mermaid
flowchart TD
    P1["App: Dashboard shows checklist<br/>based on application type"] --> C1["Client: Views document checklist"]
    C1 --> C2["Client: Uploads documents per checklist item<br/>(with explanation why needed)"]
    C2 --> P2["App: Tracks status<br/>Required / Submitted / In Review / Needs changes<br/>Validates file size and format"]
    P2 --> P3["App: Automatic notification<br/>for unfulfilled documents"]
    P2 --> A1["Admin: Reviews checklist"]
    A1 --> A2["Admin: Changes document requirements"]
    A2 --> A3["Admin: Emails client about admin notes<br/>for additional requirements"]
    A1 --> R1["RCIC: Reviews and can approve documentation"]
    R1 --> ADD(("Add / Remove / Customize<br/>requirements"))
    R1 -. "Request additional docs or changes<br/>(Client Chat)" .-> C2
```

---

## Phase 4: Feedback and Validation Process

| Role       | Steps                                                                                                                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client** | Receives admin feedback through notification memo · Makes any further corrections and resubmissions (**re-submits as many times as needed**)                                                                                                                                                            |
| **App**    | Once submitted, staff is notified · After all submissions, displays "IN REVIEW" · Updates status after resubmission · Sends email notification to client to check Admin/Staff notes                                                                                                                     |
| **Admin**  | Checks readability and quality · Reviews document submissions _(Document Checklist)_; once review is done, notifies RCIC · Requests further changes to client with notes                                                                                                                                |
| **RCIC**   | Can review and monitor _(Checklist screen, Client dashboard)_ · Can review each document and client information _(Client Dashboard)_ · **Decision: All requirements met?** · YES: reviews each document and client info thoroughly _(Client Dashboard)_, then validates client document and information |

**Decision logic:** NO → Admin requests further changes with notes → client corrects and resubmits → back to review. YES → RCIC validates → Phase 5.

```mermaid
flowchart TD
    P1["App: Staff notified on submission"] --> A1["Admin: Checks readability and quality"]
    A1 --> A2["Admin: Reviews submissions (Document Checklist)<br/>Notifies RCIC when done"]
    P1 --> P2["App: Shows 'IN REVIEW' after all submissions"]
    A2 --> R1["RCIC: Reviews and monitors<br/>(Checklist screen, Client dashboard)"]
    R1 --> R2["RCIC: Reviews each document and client info<br/>(Client Dashboard)"]
    R2 --> D{"All requirements<br/>met?"}
    D -- NO --> A3["Admin: Requests further changes with notes"]
    A3 --> P3["App: Emails client to check Admin/Staff notes"]
    P3 --> C1["Client: Receives feedback via notification memo"]
    C1 --> C2["Client: Makes corrections and resubmits<br/>(as many times as needed)"]
    C2 --> P4["App: Updates status after resubmission"]
    P4 --> A2
    D -- YES --> R3["RCIC: Reviews each document and client info thoroughly"]
    R3 --> R4["RCIC: Validates client documents and information"]
    R4 --> NEXT([Phase 5])
    A3 -. "Client Chat" .-> C1
```

---

## Phase 5: Application Preparation

| Role       | Steps                                                                                                                                                | 
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client** | Can see completion status after all requirements are met · Is notified on email and in the app that their file is ready for application preparation  |
| **App**    | All requirements are marked as completed · File for application appears in dashboard                                                                 |
| **Admin**  | Confirms whether all requirements are complete _(Checklist screen, Client Dashboard)_ · Prepares all documents and info into a file package for RCIC |
| **RCIC**   | Reviews final application before sending off to IRCC · Sends package to IRCC and application is complete. **FINISH**                                 |

```mermaid
flowchart TD
    A1["Admin: Confirms all requirements complete<br/>(Checklist screen, Client Dashboard)"] --> P1["App: All requirements marked completed"]
    P1 --> C1["Client: Sees completion status"]
    P1 --> A2["Admin: Prepares documents and info<br/>into a file package for RCIC"]
    A2 --> P2["App: File for application in dashboard"]
    P2 --> C2["Client: Notified by email and in app<br/>that file is ready for preparation"]
    A2 --> R1["RCIC: Reviews final application<br/>before sending to IRCC"]
    R1 --> R2["RCIC: Sends package to IRCC<br/>Application complete"]
    R2 --> F([FINISH])
```

---

## Additional Features (blue circles)

| Feature                                    | Where it appears                  |
| ------------------------------------------ | ---------------------------------- |
| Save and come back to the intake questions | Phase 2 (Client)                  |
| Client Chat                                | Phases 2, 3, 4 (correction loops) |
| Add / Remove / Customize requirements      | Phase 3 (RCIC)                    |
| Progress bar                               | Spans Phases 2-5                  |
