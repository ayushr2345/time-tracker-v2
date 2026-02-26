# 🗺️ Project Roadmap

## Phase 1: Core MVP (✅ Completed)
- [x] **Activity Logging:** Real-time Start/Stop timer and log details.
- [x] **Manual Entry:** Form to add logs for past activities.
- [x] **History Dashboard:** List view of past logs with ability to delete a log.
- [x] **Data Visualization:** GitHub-style Heatmap for activity intensity.
- [x] **Code Organization:** Restructured codebase into feature-based folders (`/components`, `/hooks`, `/services`).

## Phase 2: Reliability & Engineering Standards (🚧 Current Focus)
- [x] **Refactoring & Cleanup:**
  - [x] **Custom Hooks:** Extracted logic into `useActivities`, `useTimerMode`, `useOverview`, etc.
  - [x] **Utility Functions:** Created `utils.tsx` for shared formatting/tier logic.
  - [x] **Component Optimization:** Removed logic from presentation components (e.g., `ActivityLogItem`).
  - [x] **Type Safety:** Added explicit return types and interfaces to all components/hooks.
  - [x] **Documentation:** Added TSDoc comments to all exported functions and hooks.
- [x] **Migrate Backend to TypeScript:**
- [x] **Add a shared library:**
  - [x] **Types:** Add type definitions in shared library and use it in code.
  - [x] **Constants:** Add constants from frontend and backend to shared library
- [x] **Unit Testing Setup (Frontend):**
  - [x] Install Vitest & React Testing Library.
  - [x] Create simple smoke test (`App.test.tsx`).
- [ ] **Critical Logic Tests (Frontend):**
  - [x] Write unit tests for `utils.tsx` (`utils.test.tsx`).
  - [ ] **Logic Hooks Tests:**
    - [ ] Write unit tests for data hook useActivities.tsx (`useActivities.test.tsx`).
    - [ ] Write unit tests for data hook useActivityLog.tsx (`useActivityLog.test.tsx`).
  - [ ] **Logic Hooks Tests:**
    - [x] Write unit tests for logic hook useManualEntryMode.tsx (`useManualEntryMode.test.tsx`).
    - [ ] Write unit tests for logic hook useTimerMode.tsx (`useTimerMode.test.tsx`).
    - [ ] Write unit tests for logic hook useOverview.tsx (`useOverview.test.tsx`).
    - [ ] Write unit tests for logic hook useActivitiesForm.tsx (`useActivitiesForm.test.tsx`).
    - [ ] Write unit tests for logic hook useActivityLog.tsx (`useActivityLog.test.tsx`).
    - [ ] Write unit tests for logic hook useActivityHeatMap.tsx (`useActivityHeatMap.test.tsx`).
- [ ] **Unit Testing Setup (Backend):**
  - [ ] Install testing library and start writing tests
- [ ] **Critical Logic Tests (Backend):**


## Phase 3: Infrastructure & DevOps
- [x] **Dockerization:**
  - [x] Create `Dockerfile` for Frontend and Backend.
  - [x] Create `docker-compose.prod.yml` to spin up the full stack (App + DB) with one command for prod.
  - [x] Add restart on every system restart.
  - [x] Add backup of mongo data every 24H.
  - [x] Create `docker-compose.dev.yml` to spin up the full stack (App + DB) with one command for dev.
  - [x] Add dummy data for dev environment and restore the dummy data on every dev container bring up.
- [x] **Dynamic Ports:**
  - [x] Add Dynamic port support from single `.env` file at the root
- [x] **CI Pipeline:**
  - [x] Create `.github/workflows/ci.yml`.
  - [x] Add branch rule to only merge to master with a Pull Request
  - [x] Configure GitHub Actions to run test on merge to master.
- [x] **CD Pipeline:**
  - [x] Add deployment script to check for new commits every 1 minute and runs test before building the container.

## Phase 4: Expansion (Features v2.0)
- [ ] **Improvement:** Allow Multi Day entry for Manual Entry Mode with splitting.
- [ ] **Improvement:** Add multi-device support, if timer stopped on one device should be stopped in all.
- [ ] **Authentication:** Implement OAuth (Google) and Email/Password login.
- [ ] **User Profiles:** Settings page for user details and preferences.
- [ ] **Gamification:**
  - [ ] Calculate and display "Current Streak" and "Longest Streak".
  - [ ] Add visual badges for milestones.
- [ ] **Mobile Responsiveness:** Polish UI for mobile web usage.

## Phase 5: Documentation & Polish
- [ ] **PRD (Product Requirements Doc):** Document the user problems and solutions.
- [ ] **TRD (Technical Requirements Doc):** Document the architecture, database schema, and API endpoints.
- [ ] **README Overhaul:** Update screenshots, tech stack badges, and "How to Run" instructions.
