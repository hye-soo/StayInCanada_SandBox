# Current System User Flow: Manual Client Intake &amp; Verification Process (As-Is)

**Project:** Stay in Canada - Current Operational Workflow Analysis  
**Source Baseline:** Agency Flowchart ("Before the Portal") &amp; Operational Interviews (BCIT 2 &amp; BCIT 3)  
**Process Type:** Manual Intake, Verification, and IRCC Filing

---

## 📌 Executive Summary

This document outlines the **current "As-Is" user flow** for client intake, document collection, and verification at Stay in Canada. Currently, all verification and cross-checking between client forms and supporting documents are performed **manually** by agency staff and the RCIC. This manual loop creates administrative bottlenecks, delayed turnaround times, and repetitive client communication.

---

## 👥 Roles &amp; Systems Involved

### Key Actors

- **Client:** Prospective or retained immigrant/student applicant.
- **Front Desk / Admin Staff:** Handles initial inquiry logging, follow-ups, account setup, and manual form verification.
- **RCIC (Regulated Canadian Immigration Consultant):** Handles consultations, strategy, final verification, and IRCC application submission.

### Current Toolchain

- **Communication:** Email, Phone, WhatsApp, Website Chat DM, Zoho Click (internal team chat).
- **Agreements &amp; Invoicing:** Zoho Sign (e-signatures), Payment system.
- **Document Storage:** Zoho Drive (shared client folders).
- **CRM Systems:** HubSpot CRM (legacy/active) &amp; Zoho CRM (in transition).
- **Government Portal:** IRCC Authorized Representative Portal / Direct IRCC Portal Accounts.

---

## 🔄 Step-by-Step Current User Flow

### Phase 1: Pre-Onboarding &amp; Retainer Agreement

1. **Inquiry &amp; Referral:** Client reaches out via website chat DM, email, phone, or WhatsApp.
2. **Initial Contact &amp; Screening:** Front desk/admin gathers basic details (name, contact info, referral source) and logs call notes.
3. **Consultation:**

- Client books a consultation (online or assisted by staff).
- RCIC conducts consultation to evaluate eligibility and recommend the appropriate visa pathway (e.g., Spousal Sponsorship, TRV, Study Permit).

4. **Retainer Trigger:** If the client decides to proceed:

- Agency sends an e-signature Retainer Agreement via **Zoho Sign**.
- Agency issues an invoice for the down payment.
- **Rule:** Official document requirement checklists are strictly withheld until the retainer is signed and the invoice is paid [33, 54, 55].

---

### Phase 2: Onboarding Email &amp; Folder Setup

1. **Welcome Aboard Package:** Once payment is confirmed, admin staff sends a standardized "Welcome Aboard" email containing [33]:

- A dedicated **Zoho Drive folder link** created for the client [33].
- A visa-specific **Document Requirement Checklist** [33].
- A static **Client Information Form (CIF)** (Word/PDF format) [33, 40].
- An **Authorized Representative Form** [33, 42].

---

### Phase 3: Parallel Setup &amp; Manual Intake

#### A. Client Responsibilities

1. **Fill Client Information Form (CIF):** Client manually fills out the static CIF covering personal details, contact info, family/sibling details, education, employment history, and travel history [40, 44].
2. **Upload Supporting Documents:** Client uploads required supporting paperwork (passport, language test, transcripts, proof of work/funds) into their assigned Zoho Drive folder [33, 37].

#### B. Staff / Admin Responsibilities

1. **CRM Profile Creation:** Admin creates or updates the client profile in **HubSpot CRM** (and/or Zoho CRM) [33, 38].
2. **IRCC Portal Account Creation:** Admin manually sets up a client profile/email account on the government IRCC portal or Authorized Representative portal [59, 60].

---

### Phase 4: Manual Review &amp; Error Resolution Loop (Primary Bottleneck)

1. **Manual Verification by Staff:** Admin staff manually downloads submitted CIFs and supporting files from Zoho Drive to cross-check entered data against official documents [10, 40, 44].
2. **Identification of Errors &amp; Discrepancies:** Staff routinely encounter several common issues [44, 45]:

- **Incomplete CIFs:** Omitted family/sibling details, missing occupations, blank addresses [44, 45].
- **Data Mismatches:** Spelling inconsistencies (e.g., Passport spelling vs. CIF entry) or date discrepancies across resumes, prior IRCC filings, and CIFs [7, 44, 47].
- **Document Non-Compliance:** Files uploaded in unapproved languages without English/French translations, or files exceeding IRCC's **4 MB per file limit** [12, 44].

3. **Repetitive Communication Loop:**

- Staff contacts the client via email or phone requesting corrected documents, missing details, or translated files [44, 47].
- Client resubmits files to Zoho Drive or email [37, 44].
- Staff re-verifies manually [10, 44].

---

### Phase 5: Final Form Population &amp; Government Submission

1. **Manual Form Population:** Once all details are verified, admin staff manually key in the client's information into official IRCC application PDF/web forms [44, 59].
2. **RCIC Review:** The RCIC conducts a final legal review of the form package and supporting documents [34, 53].
3. **Fee Collection &amp; Submission:** Staff collects government processing fees from the client and officially transmits the completed application to IRCC [34, 35].
4. **Target Turnaround:** Agency aims for a 2-week turnaround from the date the final correct document is received to submission [34].

---

## 🚨 Current Process Bottlenecks &amp; Pain Points

1. **High Human Error Rate:** Manual data entry from static CIFs to IRCC forms leads to mistakes and typos [44].
2. **Repetitive Back-and-Forth:** Incomplete forms and mismatched dates cause friction and client frustration [44, 48].
3. **Lack of Automated File Limits:** Clients upload oversized PDFs (exceeding IRCC's 4 MB cap), requiring manual staff intervention to request smaller files [12].
4. **No Direct Status Visibility:** Clients frequently email/call for progress updates, increasing administrative overhead [13].

---

## 📊 Process Flowchart (Current As-Is System)

```
graph TD
    subgraph 1. Pre-Onboarding &amp; Payment
        A[Client Inquiry: Web Chat, DM, Call] --&gt; B[Consultation with RCIC]
        B --&gt; C{Retainer Signed &amp; Invoice Paid?}
        C --&gt;|No| D[Follow-up Cycle]
        C --&gt;|Yes| E[Send Welcome Aboard Email]
    end

    subgraph 2. Onboarding Package Dispatch
        E --&gt; F1[Send Zoho Drive Folder Link]
        E --&gt; F2[Send Static CIF Form &amp; Rep Form]
        E --&gt; F3[Send Visa Document Checklist]
    end

    subgraph 3. Parallel Manual Setup
        F1 &amp; F2 &amp; F3 --&gt; G[CLIENT: Fills CIF &amp; Uploads Files to Zoho Drive]
        E --&gt; H[STAFF: Create CRM Profile in HubSpot/Zoho]
        E --&gt; I[STAFF: Create Client Profile on IRCC Portal]
    end

    subgraph 4. Manual Verification Loop
        G &amp; H &amp; I --&gt; J[STAFF: Manually Verify CIF vs. Uploaded Documents]
        J --&gt; K{Information Correct &amp; Complete?}
        K --&gt;|Incorrect / Incomplete| L[Contact Client via Email/Phone]
        L --&gt; M[Client Fixes CIF / Re-uploads Files]
        M --&gt; J
        K --&gt;|Correct &amp; Complete| N[Update CRM &amp; IRCC Profile]
    end

    subgraph 5. Submission
        N --&gt; O[STAFF: Manually Key Data into IRCC Forms]
        O --&gt; P[RCIC Final Review &amp; Fee Collection]
        P --&gt; Q[Submit Application to IRCC]
    end

```
