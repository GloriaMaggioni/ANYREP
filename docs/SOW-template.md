# Statement of Work — WORKOUT Mobile App

> **Template.** Replace every `[bracketed]` field before sending. This is a starting point, not legal advice: have it reviewed by a lawyer in your jurisdiction before signing, especially sections 8–11.

| | |
|---|---|
| **Client** | [Client full name / company], [address], [email] |
| **Developer** | [Developer full name / company], [address], [email], [VAT / tax ID] |
| **SOW reference** | WORKOUT-SOW-[001] |
| **Date** | [YYYY-MM-DD] |
| **Governing agreement** | [Master services agreement dated …, or "This SOW is the full agreement"] |

---

## 1. Project overview

The Developer will design and build **WORKOUT**, a free fitness app for iOS and Android built with React Native (Expo) and Firebase. The full functional and technical specification is the *WORKOUT Developer Handoff Document* (Parts 1–14) and the `README.md` in the project repository, both attached as **Appendix A**. Where this SOW and Appendix A disagree, this SOW prevails.

## 2. Scope of work

### 2.1 In scope

- Expo + TypeScript project setup, Expo Router navigation (auth stack, 5 tabs, workout stack)
- Firebase setup: Auth (email/password + anonymous guest), Firestore, Storage, Analytics; security rules
- Seeding 66 exercises and 20 premade templates from the provided `seed/` files
- The 13 screens listed in Appendix A, Part 3, following the design system in Part 2
- Filter system with the AND/OR logic in Part 4
- Timer engine with all 6 structures (Rounds, Tabata, EMOM, AMRAP, Ladder, Custom), audio cues and haptics (Part 5)
- Edit workout, swap exercises, create from scratch, save custom workouts
- Workout history, streak tracking, stats screen
- Offline support for cached exercises and templates
- Builds: iOS via TestFlight, Android via Play Console internal testing
- Submission to the App Store and Google Play under the **Client's** developer accounts
- Deliverables listed in section 4

### 2.2 Out of scope (quoted separately if requested)

- Sprints 5–6 of the roadmap (social sharing, achievements, challenges, Apple Watch, voice guidance, light theme, PDF export)
- Exercise GIFs/videos production (the Developer integrates media the Client supplies)
- Privacy policy and terms of service text (the Developer links to URLs the Client supplies)
- Web version, admin dashboard, payments, subscriptions, ads
- Marketing, ASO beyond the store description and keywords in section 4
- Ongoing maintenance after the warranty period (see section 7)

### 2.3 Change requests

Any work outside section 2.1 requires a written change request stating scope, cost and schedule impact, approved by both parties **before** work starts. Unapproved extra work is not billable.

## 3. Timeline and milestones

Start date: **[YYYY-MM-DD]**. Estimated duration: **8 weeks** of development plus store review.

| # | Milestone | Weeks | Acceptance evidence | Payment |
|---|---|---|---|---|
| 0 | Signing / kickoff | — | Signed SOW | [20]% |
| 1 | Foundation | 1–2 | Auth working, data seeded, navigation, static home on a TestFlight / internal build | [20]% |
| 2 | Core features | 3–4 | Filters, workout list, preview, live timer with audio (Rounds, Tabata, EMOM) | [20]% |
| 3 | Customization | 5–6 | Edit, swap, create from scratch, saved workouts, AMRAP / Ladder / Custom | [20]% |
| 4 | Polish and launch | 7–8 | History, stats, streaks, all acceptance criteria met, store submission done | [20]% |

The Developer delivers a demo (video or live call) and an installable build at each milestone.

Delays caused by the Client (late feedback, missing accounts or assets) extend the timeline by the same amount. The Client agrees to give feedback within **[3] business days** of each delivery.

## 4. Deliverables

- [ ] iOS build on TestFlight
- [ ] Android build on Play Console (internal testing) and a signed APK/AAB
- [ ] Full source code in the Client's GitHub repository, with commit history
- [ ] Firebase project owned by (or transferred to) the Client
- [ ] Documented environment variables and a `.env.example`
- [ ] Updated `README.md` with setup, build and release instructions
- [ ] Exercise and template data seeded in the production Firestore
- [ ] 5 App Store screenshots per platform
- [ ] App Store / Play Store description and keywords
- [ ] Store listings linking to the Client's privacy policy and terms URLs

## 5. Acceptance

Each milestone is accepted when it meets the acceptance criteria in Appendix A, Part 12 that apply to that milestone. The Client has **[5] business days** after delivery to accept or send a written list of defects. Defects are fixed at no extra cost and the build is re-submitted for review. If the Client sends nothing within that period, the milestone is considered accepted.

Non-functional targets (from Part 12): first load under 2 s on a mid-range device, timer at 60 fps, offline access to cached data, touch targets ≥ 44 pt, WCAG AA contrast, bundle under 30 MB.

## 6. Fees and payment

- **Fixed price:** [currency] [amount], paid according to the milestone table in section 3.
  *or*
- **Time and materials:** [currency] [rate] per hour, capped at [hours] hours without written approval; timesheets weekly.

Invoices are payable within **[14] days**. Third-party costs (Apple Developer Program, Google Play Console, Firebase usage beyond the free tier, paid fonts or sounds) are paid directly by the Client.

## 7. Warranty and support

For **[30] days** after final acceptance, the Developer fixes, at no cost, any defect where the app does not behave as described in Appendix A. This does not cover new features, changes in third-party services or OS versions released after acceptance, or problems caused by changes made by others.

Optional maintenance after the warranty: [currency] [amount] per month for [scope], under a separate agreement.

## 8. Intellectual property

On full payment, all rights to the source code, designs and other deliverables created for this project transfer to the Client. Until then the Client has a licence to use the deliverables for evaluation only. Open-source libraries remain under their own licences; the Developer lists every dependency with a non-permissive (e.g. GPL) licence before using it. The Developer may keep and reuse general know-how and pre-existing tools that are not specific to this project, listed here: [none / list].

## 9. Accounts, access and data

All accounts are created in the **Client's name**: Apple Developer, Google Play Console, Firebase / Google Cloud, GitHub, domain. The Developer receives access as a collaborator and returns or loses all access at the end of the project. The Developer does not store production user data on personal devices and follows the Firestore security rules in Appendix A, Part 10.

## 10. Confidentiality

Both parties keep confidential any non-public information received from the other, during the project and for [2] years after. The Developer may mention the project in a portfolio **only** with the Client's written permission [and after public launch].

## 11. Termination

Either party may end this SOW with **[14] days'** written notice. The Client pays for milestones accepted and for work completed on the current milestone, pro rata. The Developer then delivers all work done so far (code, builds, credentials) within [5] business days.

## 12. Communication

- Weekly progress update by [email / Slack / call] on [day]
- Shared task board: [Trello / Linear / GitHub Projects link]
- Main contacts: Client — [name]; Developer — [name]

---

## Signatures

| Client | Developer |
|---|---|
| Name: | Name: |
| Signature: | Signature: |
| Date: | Date: |

**Appendix A:** WORKOUT Developer Handoff Document (Parts 1–14) and repository `README.md`.
