# 🗺️ Project Roadmap

## Phase 1: Core MVP (✅ Completed)
- [x] **Activity Logging:** Real-time Start/Stop timer and log details.
- [x] **Manual Entry:** Form to add logs for past activities.
- [x] **History Dashboard:** List view of past logs with ability to delete a log.
- [x] **Data Visualization:** GitHub-style Heatmap for activity intensity.
- [x] **Code Organization:** Restructured codebase into feature-based folders (`/components`, `/hooks`, `/services`).

## Phase 2: Reliability & Engineering Standards (🚧 Current Focus)
- [ ] **Unit Testing Setup:**
    - [ ] Install Vitest & React Testing Library.
    - [ ] Create simple smoke test (`App.test.tsx`).
- [ ] **Critical Logic Tests:**
    - [ ] Write unit tests for Time/Duration utility functions.
    - [ ] Write unit tests for Heatmap calculation logic (date grouping).
- [ ] **Refactoring:**
    - [ ] **Hooks:** Extract frequently used logic into functions.
- [ ] **CI Pipeline:**
    - [ ] Create `.github/workflows/ci.yml`.
    - [ ] Configure GitHub Actions to run Lint + Tests on every push to `master`.
- [ ] **README:** Add high-quality screenshots, tech stack badges, and "How to Run" instructions.

## Phase 3: Infrastructure & DevOps
- [ ] **Dockerization:**
    - [ ] Create `Dockerfile` for Frontend and Backend.
    - [ ] Create `docker-compose.yml` to spin up the full stack (App + DB) with one command.
- [ ] **Environment Config:** Standardize `.env` variables for Dev vs. Prod.

## Phase 4: Expansion (Features v2.0)
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
