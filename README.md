<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="./frontend/public/favicon.ico" alt="Project logo"></a>
</p>

<h3 align="center">time-tracker-v2</h3>

<div align="center">

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/ayushr2345/time-tracker-v2.svg)](https://github.com/ayushr2345/time-tracker-v2/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/ayushr2345/time-tracker-v2.svg)](https://github.com/ayushr2345/time-tracker-v2/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>
</div>

---

<p align="center"> Few lines describing your project.
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [Roadmap](./ROADMAP.md)
- [Contributing](../CONTRIBUTING.md)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>

The **Activity Tracker** is a full-stack, data-driven application designed to solve the "lost time" problem by providing a centralized hub for quantified-self logging. It bridges the gap between high-precision real-time timers and flexible manual logging, allowing users to capture their day's work with zero friction. Whether tracking coding sessions on a laptop or logging a gym session from a phone, the system ensures your data is consolidated and visually actionable through GitHub-style intensity heatmaps.

Engineered with a focus on self-hosting and resilience, this project utilizes a modern **TypeScript Monorepo** architecture to enforce total type safety from the database schema to the UI components. It is specifically hardened for deployment on low-power home servers (like a ThinkCentre) operating under restrictive network conditions, such as mobile hotspots. By utilizing mDNS for local discovery and automated container orchestration, it provides a "private cloud" experience that is both private and indestructible.



## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. The project supports three distinct execution modes: **Native Local**, **Docker Dev** (sandboxed), and **Docker Prod** (optimized). See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

To run this project, you need to have the following installed on your machine:

* **Node.js (v24 LTS):** The core runtime.
* **NPM (v10+):** For managing the workspace and dependencies.
* **Docker & Docker Compose:** Required for containerized environments.
* **MongoDB Tools:** For manual database exports/restores.

```bash
node -v # Should be v24.x.x
npm -v  # Should be v10.x.x
docker --version
docker-compose --version # Or 'docker compose version'
```

### Installing

A step-by-step series of examples that tell you how to get a development environment running.

1. Clone the repository to your local machine
    ```bash
    git clone https://github.com/ayushr2345/time-tracker-v2.git
    cd time-tracker-v2
    ```

2. Install all dependencies for the entire Monorepo
    ```bash
    # This uses NPM Workspaces to install frontend, backend, and shared libraries at once
    npm install
    ```
3. Initialize your environment configuration
    ```bash
    # Create your local .env file from the provided template
    cp .env.example .env
    ```
4. Launch the Sandboxed Docker Development Environment
    ```bash
    # This builds the images and starts the containers in detached mode
    docker-compose -f docker-compose.dev.yml up -d --build
    ```
5. Verify that the containers are healthy
    ```bash
    docker ps
    # You should see: dev-backend, dev-frontend, dev-mongo, and dev-mongo-backup
    ```
6. Check the database seeding logs
    ```bash
    # Verify that the 'init-backup.sh' script successfully restored the test data
    docker logs dev-time-tracker-mongo
    ```

### Demo: Getting Data out of the System

To verify everything is wired up correctly, you can perform a quick smoke test:
1. Open your browser: Navigate to http://localhost:5051.
2. Verify Seed Data: You should see the GitHub-style Heatmap already populated with the dummy data from the seed script.
3. Test the Timer: 
    * Click the "Start Timer" button.
    * Wait a few seconds.
    * Click "Stop".
4. Confirm Persistence: Refresh the page or check the Activity Logs section.
5. Your new entry should appear at the top, confirming that:
    * The Frontend (React) successfully communicated with the Backend (Express).
    * The data was successfully persisted to the Database (MongoDB).

## 🔧 Running the tests <a name = "tests"></a>

This project utilizes a multi-layered testing strategy to ensure logic remains consistent across the monorepo, especially when sharing types between the frontend and backend services.

### Unit & Integration Tests

We use **Vitest** for the frontend and shared library due to its speed and native support for the Vite environment. These tests focus on verifying core business logic within custom hooks and utility functions.

* **Logic Hooks:** Tests for `useActivities`, `useTimerMode`, and `useManualEntryMode` to ensure state transitions (starting/stopping timers) work correctly.
* **Utilities:** Validation of date formatting and activity intensity tier calculations in `utils.tsx`.

**To run the frontend unit tests:**
```bash
npm run test --workspace=frontend
```

### Break down into end to end tests

Our End-to-End (E2E) tests verify the "happy path" of a user journey. They ensure that the React frontend, Express backend, and MongoDB database are communicating correctly as a unified system.

**What they test**

1. The Persistence Cycle: Starting a timer on the UI, refreshing the page, and verifying the timer is still running (validating Backend state persistence).
2. Manual Entry Splitting: Verifying that an activity logged across midnight successfully creates two distinct entries in the database to maintain heatmap accuracy.
3. Database Seeding: Ensuring the docker-compose.dev.yml correctly restores the dummy data upon container startup.

**Example of running a smoke test in the dev environment**
```bash
# Spin up the development stack
docker-compose -f docker-compose.dev.yml up -d

# Trigger the test suite against the running containers
npm run test:e2e --workspace=frontend
```

### And coding style tests

We enforce a consistent coding style to maintain readability and prevent "diff noise" in Pull Requests. This is handled via Prettier for formatting and ESLint for static code analysis across the Monorepo.

**What they test and why**

1. Syntax Consistency: Ensures all files follow the same rules (e.g., single quotes, 2-space indentation, and trailing commas). This prevents unnecessary merge conflicts caused by different IDE settings.

2. Type Integrity: Checks that no any types are leaking into the codebase and that all shared interfaces from @time-tracker/shared are implemented correctly.

3. Best Practices: Identifies unused variables, missing dependencies in React hooks (like useEffect), and potential logic errors before the code even runs.

**Example of checking and fixing style issues**
```bash
# Check the entire monorepo for linting and type errors
npm run lint

# Automatically fix formatting and style issues
npm run pretty
```

## 🎈 Usage <a name="usage"></a>

The Activity Tracker is designed to capture your productivity with minimal friction, supporting both real-time focus and retroactive logging.

### Timer Mode (Real-time Tracking)

This is the "set and forget" mode for active tasks.

* Start: Click the Start Timer button when you begin a task.

* Persistence: The timer state is managed by the backend; you can close your browser or switch devices, and the timer will continue ticking.

* Stop: Once finished, provide a brief description and hit Stop. The system calculates the duration to the millisecond and updates your heatmap instantly.

* Splitting Logic: If you log an activity that starts at 10:00 PM and ends at 2:00 AM the next day, the system intelligently splits the record into two entries so your daily intensity metrics remain accurate for both dates.


### Manual Entry (Retroactive Logging)

For those times you were away from your desk or forgot to start the timer.

* Toggle: Switch to "Manual Entry" mode.

* Input: Select the date, start time, and end time.

* Submit: Log the entry to the DB on confirmation

### Data Visualization & Dashboard

* GitHub-Style Heatmap: Visualize your consistency over the last year. Darker cells represent higher activity density (Tiers 1–4).

* Activity Logs: A chronological list of all tracked time. You can delete or edit logs directly from this view.


## 🚀 Deployment <a name = "deployment"></a>

The system is architected to be flexible across three distinct environments.

### Local Native Deployment (Development)

Best for rapid UI/Logic development without Docker overhead.

Requirements: Local MongoDB instance running on ```27017```.

**Process**
```bash
npm install
npm run dev --workspace=@time-tracker/shared  # Build shared types
npm run dev --workspace=backend               # Start API
npm run dev --workspace=frontend              # Start React
```

### Docker Dev Deployment (Sandboxed)

Best for testing the full-stack orchestration with a pre-seeded database.

* Features: Automatically restores dummy data from ./seed/test-db.gz on every boot.

**Process**
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```
* Ports: Frontend: ```5051```, Backend: ```5050```, Mongo: ```27018```.

### Production Deployment (Home Server)

* Optimized for long-term hosting on a dedicated server behind a mobile hotspot.

* Resilience: Containers use the restart: unless-stopped policy to recover from power cuts automatically.

* Backups: A sidecar container performs a full mongodump every 24 hours to the host's ./backups directory.

**Process**
```bash
# Ensure your .env has VITE_API_BASE_URL=http://<home-server-ip>:<backend-port>/api
docker-compose -f docker-compose.prod.yml up -d --build
```

## ⛏️ Built Using <a name = "built_using"></a>

This project utilizes a modern **MERN** stack optimized with **TypeScript** and **Docker** to ensure high performance, type safety, and seamless monorepo integration.

### Core Stack
- [MongoDB](https://www.mongodb.com/) - NoSQL Database for flexible activity logging and persistence.
- [Express](https://expressjs.com/) - Fast, unopinionated back-end framework for the REST API.
- [React](https://react.dev/) - Frontend library (v19) for building the reactive user interface.
- [Node.js](https://nodejs.org/en/) - JavaScript runtime (v24 LTS) powering the server-side environment.

### Frontend & UI
- [Vite](https://vitejs.dev/) - Next-generation frontend tooling for ultra-fast HMR and bundling.
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework (v4) for modern, responsive styling.
- [Recharts](https://recharts.org/) - Composable charting library used for the activity intensity heatmap.
- [Lucide React](https://lucide.dev/) - A clean and consistent icon toolkit.

### Engineering & DevOps
- [TypeScript](https://www.typescriptlang.org/) - Static type checking shared across the monorepo via NPM workspaces.
- [Docker](https://www.docker.com/) - Containerization for reproducible environments across Dev and Prod.
- [Vitest](https://vitest.dev/) - Blazing fast unit testing framework natively integrated with Vite.
- [Mongoose](https://mongoosejs.com/) - Elegant MongoDB object modeling and schema validation.

## ✍️ Authors <a name = "authors"></a>

- [@ayushr2345](https://github.com/ayushr2345) - Idea, System Architecture, and Development

See also the list of [contributors](https://github.com/kylelobo/The-Documentation-Compendium/contributors) who participated in this project.

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

* Quantified Self Movement - For the inspiration to track and visualize daily productivity.

* The GitHub Team - For the original design of the contribution heatmap, which serves as the core visualization of this project.

* Open Source Community - For the incredible tools like Docker, React, and MongoDB that make self-hosting accessible.
