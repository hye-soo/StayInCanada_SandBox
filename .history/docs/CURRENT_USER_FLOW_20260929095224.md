````
# User Flow: Post-Payment Client Intake &amp; Verification Process

**Project:** Stay in Canada - Smart Intake &amp; Verification Web Application
**Target Scope:** Post-Payment Phase (Starts after Retainer Agreement signed &amp; initial down payment received)
**Core Objectives:**
1. Replace static, cumbersome Client Information Forms (CIF) with a step-by-step Smart Questionnaire.
2. Cross-verify user inputs against uploaded official documents (e.g., Passport, Transcripts) using AI validation.
3. Automatically enforce IRCC document constraints (4 MB maximum file size per document).
4. Centralize client-staff communication within the portal to eliminate email back-and-forth.
5. Provide clients with real-time application status tracking for transparency.

---

## 👥 Key Roles &amp; Actors
* **Client:** Retained client completing intake forms and uploading supporting immigration paperwork.
* **Smart Portal (System / AI Engine):** Web app executing form validation, file size checks, AI cross-verification, auto-saving, and status updates.
* **Staff / RCIC:** Operations team, Legal Assistants, and Regulated Canadian Immigration Consultant reviewing verified packages and submitting to IRCC.

---

## 🔄 Step-by-Step User Flow Breakdown

### Stage 1: Onboarding &amp; Account Trigger
1. **Trigger:** The client signs the Retainer Agreement (via Zoho Sign) and pays the initial invoice/down payment.
2. **Account Provisioning:** Staff assigns the agreed visa pathway (e.g., Spousal Sponsorship, Study Permit, TRV) in the portal system, triggering an automated client email invite.
3. **Client Login:** Client creates password and logs into the web portal.
4. **Portal Dashboard:** Client sees their assigned visa pathway dashboard, active document checklist, and intake progress bar.

---

### Stage 2: Smart Intake Questionnaire (Replacing Static CIF)
1. **Interactive Form:** Client begins answering the step-by-step questionnaire divided into digestible sections (Personal Details, Contact Info, Family/Sibling Details, Education, Employment History, Travel History).
2. **Real-time Rules &amp; Guidance:**
   * **Required Field Enforcement:** Mandatory IRCC fields (e.g., family occupations, exact dates) cannot be left blank.
   * **Auto-Save:** Progress auto-saves continuously, allowing clients to pause and resume at any time.
   * **Formatting Assistance:** Input masks ensure dates and names match standard international formats.

---

### Stage 3: Document Checklist &amp; Upload Constraints
1. **Dynamic Checklist:** The system presents a tailored document requirement checklist based on the pre-selected visa application type.
2. **File Size Constraint Enforcement:**
   * When a client uploads a file, the system checks file size.
   * **Max File Size Limit:** Strictly capped at **4 MB per document** (IRCC submission requirement).
   * **File Error Handling:** If a file exceeds 4 MB, upload is blocked, and an instant prompt asks the client to compress or select a smaller file.
3. **Checklist Progress:** Uploaded files immediately update the visual checklist (e.g., "Passport - Uploaded", "Language Test - Pending").

---

### Stage 4: AI Cross-Verification Engine
1. **Document Parsing:** As documents are uploaded, the AI engine scans the files (OCR/data extraction).
2. **Field Matching:** AI compares questionnaire inputs against official uploaded documents:
   * **Spelling Verification:** Checks name spelling on forms against Passport scan (e.g., flagging "Y-O" vs "Y-O-U").
   * **Date Consistency:** Cross-references dates of birth, marriage dates, and employment dates against resumes and uploaded documents.
   * **Completeness Check:** Confirms mandatory documents are present and readable.
3. **Report Generation:** Generates an **Internal Validation Report** highlighting discrepancies or missing items for staff.

---

### Stage 5: Staff Review &amp; In-Portal Error Resolution
1. **Staff Review:** Staff/RCIC logs into the admin portal to review the client's profile, filled CIF data, uploaded documents, and the AI Validation Report.
2. **Parallel Account Setup:** Admin sets up the official client profile on the government/authorized representative portal.
3. **In-Portal Flagging &amp; Messaging (If Discrepancies Exist):**
   * Staff flags specific incorrect fields or missing documents directly in the portal (avoiding external emails).
   * Client receives an in-portal notification, clicks directly to the flagged item, and submits corrections.
4. **RCIC Approval (If Clean):** The RCIC approves the verified dataset and document package.

---

### Stage 6: Government Submission &amp; Status Tracking
1. **IRCC Submission:** Staff populates official IRCC forms, collects the government processing fee, and submits the final package to IRCC.
2. **Status Tracker Update:** Staff updates the application stage in the portal (e.g., "Submitted to IRCC", "Awaiting IRCC Confirmation").
3. **Client Visibility:** Client logs in anytime to view real-time status updates on their visual progress tracker.

---

## 📊 Summary Process Diagram (Mermaid)

```mermaid
graph TD
    subgraph 1. Onboarding
        A[Retainer Signed &amp; Payment Completed] --&gt; B[Portal Invite Sent to Client]
        B --&gt; C[Client Account Created &amp; Pathway Pre-Selected]
    end

    subgraph 2. Smart Questionnaire
        C --&gt; D[Client Starts Step-by-Step Intake Form]
        D --&gt; E{Auto-Save &amp; Required Field Checks}
        E --&gt;|Incomplete| D
        E --&gt;|Completed| F[Questionnaire Data Submitted]
    end

    subgraph 3. Document Collection
        F --&gt; G[Dynamic Visa Checklist Displayed]
        G --&gt; H[Client Uploads Supporting Files]
        H --&gt; I{File Size &lt;= 4MB?}
        I --&gt;|Exceeds 4MB| J[Block Upload &amp; Prompt File Compression]
        J --&gt; H
        I --&gt;|Valid| K[Files Uploaded to Checklist]
    end

    subgraph 4. AI Verification
        K --&gt; L[AI Scans Files &amp; Compares with Intake Form]
        L --&gt; M[Generate Discrepancy &amp; Validation Report]
    end

    subgraph 5. Staff Review &amp; Resolution
        M --&gt; N[Staff Reviews AI Report &amp; Submissions]
        N --&gt; O{Discrepancies / Errors?}
        O --&gt;|Yes| P[Staff Flags Field in Portal]
        P --&gt; Q[Client Notified &amp; Submits Fix in Portal]
        Q --&gt; L
        O --&gt;|No| R[RCIC Final Approval]
    end

    subgraph 6. IRCC Submission
        R --&gt; S[Admin Creates Forms &amp; Submits to IRCC]
        S --&gt; T[Client Views 'Submitted' Status on Tracker]
    end

````

```

---
```
