# requirement.md — Loan Platform POC (User-Facing Only, Hybrid-Style UI)

## Goal
Create a **mock POC** (no real backend) that demonstrates the **end-to-end loan application journey** for **BD** to understand how the flow works:
- Register / Sign in
- eKYC (mock)
- Fill loan application (draft + resume)
- Upload required documents (mock)
- Review & submit
- Track application status (Review / Approved / Rejected / Cancelled)
- If Approved → e-signature flow (mock)
- Basic notifications (in-app)

> This POC is **user-facing only**. **Back office is out of scope**.

---

## Tech / Implementation Constraints
- Use **React + TypeScript** (single-page app).
- UI should be **mobile-first responsive** to mimic a hybrid mobile app.
- Use **React Router** for navigation.
- Use **localStorage** to persist:
  - auth session
  - draft loan application
  - uploaded document metadata
  - application status timeline
- Use **mock services** in `src/services/mockApi.ts` with deterministic fake delays (`setTimeout`) and predictable results.
- No real integrations (loan engine, eKYC, e-sign) — simulate them.
- Add a **Demo Controls** screen to let BD simulate status changes and outcomes.

---

## Must Keep These Module Names (exactly as headers in code comments and doc sections)
- Entry Point
- User Registration
- User Authentication
- User Profile & eKYC Integration
- Loan Application Form
- Supporting Documents Management
- Loan Application Result
- Loan Application E-Signature
- Notification

---

## App Information Architecture (Routes)
- `/` → Landing (Entry Point)
- `/register` → Registration
- `/login` → Login
- `/consent` → T&C consent (must be accepted before continuing)
- `/pin` → PIN setup (after OTP verification)
- `/home` → Home / Dashboard (post-login)
- `/profile` → User Profile + eKYC status
- `/loan/new` → Loan Application Form wizard
- `/loan/review` → Review screen
- `/loan/result` → Loan Application Result (status timeline)
- `/loan/esign` → Loan Application E-Signature (only when approved + signature required)
- `/notifications` → In-app notifications list
- `/demo` → Demo Controls (for BD demo)

> Guarded routes: everything except `/`, `/register`, `/login` requires an authenticated session.

---

# Module Requirements

## 1) Entry Point
### Screens
**Landing Screen**
- Shows:
  - App title
  - CTA buttons: **Register**, **Sign In**
- If session exists in localStorage, auto-route to `/home`.

### Acceptance Criteria
- User can navigate to register/login.
- Existing session skips landing.

---

## 2) User Registration
### Screens
**Register Screen**
- Inputs: phone number OR email (simple validation)
- Button: “Request OTP”

**OTP Verification Screen**
- Input OTP (mock; accept `123456` as valid)
- On success → go to `/consent`

**Consent Screen (T&C consent for credit disclosure)**
- Checkbox: “I consent to the disclosure of credit information…”
- Store consent record:
  - `consentAccepted: true`
  - `consentVersion: "v1"`
  - `acceptedAt: ISO timestamp`
- Continue → `/pin`

**PIN Setup Screen**
- Create PIN (4–6 digits)
- Confirm PIN
- Store hashed/obfuscated PIN (for POC store plain is fine but comment it is demo-only)
- Continue → `/home`

### Acceptance Criteria
- OTP flow works with mocked verification.
- Consent is required; cannot proceed without checking.
- PIN setup required to complete registration.
- After registration, user is logged in and session is stored.

---

## 3) User Authentication
### Screens
**Login Screen**
- Input phone/email + PIN
- Validate against locally stored user record (mock)

### Acceptance Criteria
- Successful login routes to `/home`.
- Failed login shows friendly error.
- Session persists across refresh.

---

## 4) User Profile & eKYC Integration
### Screens
**Profile Screen**
- Display user details (from localStorage):
  - name (optional)
  - phone/email
  - last known location (if available; see location tracking below)
  - eKYC status badge: Not Started / Submitted / Under Review / Approved / Rejected
- Actions:
  - “Start eKYC” (opens mock flow)
  - “Resubmit eKYC” (if rejected)

**Mock eKYC Flow**
- Collect minimal fields:
  - full name
  - national ID number (basic validation)
- Upload ID selfie (mock upload using file input)
- Submit → status becomes “Under Review”
- After delay, mock result can be set via `/demo`:
  - Approved or Rejected (with reason)

### Location Tracking Requirement
- During registration or first app entry to `/home`, capture and store:
  - `locationEnabled: true/false`
  - if enabled: `latitude`, `longitude`, `capturedAt`
- Web POC can use:
  - `navigator.geolocation` (if available) with a fallback message if blocked.

### Acceptance Criteria
- Profile shows eKYC status.
- eKYC submission updates status and timeline.
- Demo Controls can flip eKYC outcome.

---

## 5) Loan Application Form
> Implement as a multi-step wizard with draft/resume.

### Data Fields (as per your sheet)
**Step 1 — Personal Info**
- Required: basic identity fields (keep minimal for POC)
- Additional items:
  - Home registration document (as required doc, not text field)
  - Marriage certificate (if applicable)
  - Guarantor detail (if applicable) — simple toggle + optional input fields

**Step 2 — Financial Info**
- Employment Detail
- Monthly Income
- Year of work

**Step 3 — Loan Request Details**
- Downpayment
- Loan period months (48 / 60 / 72)

### Behaviors
- Field validation (format, completeness)
- Auto-save draft:
  - Save after each step completion and on every meaningful change (debounced)
- Resume draft:
  - If draft exists, show “Resume Draft” on `/home` and `/loan/new`

### Screens
- LoanWizard Screen (Stepper UI)
- Review Screen (`/loan/review`)
  - shows all inputs and uploaded docs checklist
  - confirm consent already accepted
  - submit button

### Acceptance Criteria
- User can complete steps and see validations.
- Draft is saved and can be resumed after refresh.
- Review screen blocks submission if required data missing.

---

## 6) Supporting Documents Management
### Required Uploads (POC)
- Upload ID documents
- Upload income proof
- Upload address proof
- (Also support home registration / marriage certificate / guarantor docs if toggled applicable)

### Behaviors
- File type & size validation:
  - Allowed: PDF, JPG, PNG
  - Max size: 10MB
- Secure document storage (POC):
  - store only metadata in localStorage:
    - filename, type, size, uploadedAt
  - store file content in-memory only (or as base64 if needed for preview; keep simple)
- Document retrieval:
  - show list of uploaded docs per category
- Document versioning:
  - re-upload replaces previous and increments `version`

### Acceptance Criteria
- Upload validations work.
- User can see uploaded docs list + version.
- Review screen shows whether required docs are complete.

---

## 7) Loan Application Submission (within Form Journey)
### Behaviors
- On submit:
  - compile payload (application + documents metadata + location + consent info)
  - create a `loanApplicationId`
  - set state to `Submitted`
  - immediately move to `Review` state after a short delay (mock “loan engine received”)
- Create a status timeline log entry each time status changes.

### Acceptance Criteria
- Submit creates a new application record in localStorage.
- Status timeline is visible on Result screen.

---

## 8) Loan Application Result
### Screens
**Loan Result Screen (`/loan/result`)**
- Show latest application state:
  - Draft / Submitted / Review / Approved / Rejected / Cancelled
- Show timeline:
  - event name, timestamp, source (“user”, “system”, “loanEngineMock”)
- Show decision outcome:
  - If rejected: show reason code + short message
  - If approved: show approved terms summary + next step CTA “Proceed to e-Signature”

### Acceptance Criteria
- Status shown matches latest stored status.
- Timeline shows all changes.
- Approved state shows CTA to e-sign.

---

## 9) Loan Application E-Signature (Post-Approval)
### Trigger Condition
- Only accessible if application status is `Approved` AND `signatureRequired = true`.

### Screens
**E-Sign Screen (`/loan/esign`)**
- Show agreement summary
- Allow user to open/preview a mock agreement PDF (can be a static placeholder file or inline text)
- Checkbox: “I agree to sign electronically”
- Button: “Sign Now”
- On sign:
  - set status to `Signed`
  - store signature metadata:
    - signedAt, signerId, agreementVersion
  - add timeline event
  - route back to `/loan/result`

### Acceptance Criteria
- Cannot sign without consent checkbox.
- Signing updates status + timeline.
- Result screen reflects signed state.

---

## 10) Notification (In-App Only)
### Screens
**Notifications Screen**
- List notifications generated by events:
  - eKYC submitted
  - loan submitted
  - status changed to Review
  - approved/rejected
  - signature required
  - signed successfully
- Store in localStorage; newest first.

### Acceptance Criteria
- Notifications are created automatically on major events.
- User can view list anytime.

---

# Demo Controls (Mandatory for BD POC)
### Screen
`/demo`

### Actions
- Change eKYC status: Approved / Rejected (with reason)
- Change loan status: Review / Approved / Rejected / Cancelled
- Toggle `signatureRequired`
- Provide “Reset Demo Data” button (clears localStorage)

### Acceptance Criteria
- BD can simulate full journey without backend.
- Demo changes update timeline + notifications.

---

# Data Models (POC-friendly)
Define TypeScript interfaces in `src/types.ts`:
- `User`
- `ConsentRecord`
- `KycProfile`
- `LoanApplication`
- `DocumentItem`
- `TimelineEvent`
- `NotificationItem`

---

# Project Structure (Suggested)
- `src/pages/*` (screens)
- `src/components/*` (shared UI)
- `src/services/mockApi.ts` (mock async calls + persistence)
- `src/store/useAppStore.ts` (simple state via Context or Zustand; keep minimal)
- `src/utils/validators.ts` (form rules)
- `src/types.ts`

---

# Out of Scope (Do NOT implement)
- Back office UI
- Real loan engine integration
- Real eKYC provider integration
- Real e-sign provider integration
- Real file storage / encryption (just mock)

---

# Definition of Done (POC)
- Flow is demoable end-to-end in a browser as a mobile-like UI.
- State persists across refresh.
- Demo Controls can drive statuses to show outcomes.
- Code is simple, readable, and easy to extend.
