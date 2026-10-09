# StayinCanada Immigration: Updated User Flow (Current Company Workflow)

## Roles

| Role                  | Responsibility                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------ |
| **Client**            | Supplies information, signs, and uploads documents                                         |
| **Consultant / RCIC** | One role (Jean and Amar): main client communication, follow-up, and final approval         |
| **Admin**             | Assessment coordination, onboarding, account setup, manual form completion, and submission |

Diagram conventions: solid arrow = normal process / handoff; dashed arrow = correction and re-check; diamond = decision; Yes/No = branches. Notes are not extra actions.

---

## Phase 1: Inquiry and Consultation

1. **Client** (inside or outside Canada) contacts the agency via website, email, DM, or chat app.
2. **Client** submits the free assessment form.
3. **Admin** reviews the free assessment and coordinates the preliminary evaluation.
4. **Client** books a consultation.
5. **Consultant / RCIC** conducts the consultation (Admin handles scheduling).
6. **Decision: Does the client decide to proceed?**
   - **No:** Inquiry ends, or future follow-up.
   - **Yes:** Client signs the retainer agreement through Zoho Sign.
7. **Client** pays the invoice / down payment.

## Phase 2: Onboarding / Client Information

1. **Admin** sends the onboarding email with visa requirements, CIF, Zoho Drive link, and representative authorization.
2. The following start in parallel:
   - **Client** uploads supporting documents to Zoho Drive.
   - **Client** completes the internal Client Information Form (CIF), including family details and signatures.
   - **Admin** creates or locates the client record in Zoho CRM.
   - **Admin** creates or accesses the client's IRCC account/profile (one account may hold multiple applications), then:
     1. creates the visa-specific IRCC application under the client profile,
     2. downloads the current official IRCC forms from that application.

## Phase 3: Validation and Application

1. **Admin** checks uploaded documents for completeness.
2. **Admin** checks the CIF for missing or inconsistent information and signatures.
3. **Decision: Is the information and documentation complete and correct?**
   - **No (correction loop):**
     1. **Admin** flags missing or incorrect items to the Consultant / RCIC.
     2. **Consultant / RCIC** contacts the client and requests the missing information or documents.
     3. **Client** corrects the CIF and/or re-uploads missing documents.
     4. Dashed arrows return to the Admin checks: "re-upload for checking" (documents) and "resubmit for checking" (CIF).
   - **Yes:**
     1. **Admin** manually fills the official IRCC application forms with verified information (using the forms downloaded in Phase 2).
     2. **Consultant / RCIC** performs the final review and approves the application for submission.
     3. **Admin** submits the approved application to IRCC (Admin handles submission steps).

---

## System / Terminology Notes (not process steps)

- **IRCC account/profile ≠ IRCC application.** A client may have multiple separate applications.
- **Scope:** standard B2C IRCC application. LMIA / ESDC and EOI / ITA are separate process variants.
- **Validation:** Admin checks submissions and flags missing items to the Consultant / RCIC. The Consultant communicates with the client, and Admin re-checks items and fills the IRCC forms. The Consultant approves before submission.
- **HubSpot / Zoho CRM:** used for initial contact records and communication/meeting notes, not for repeated full-case updates.
