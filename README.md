<p align="center">
  <a href="https://github.com/ayushr2345/time-tracker-v2" rel="noopener">
    <img width="180" height="180" src="./frontend/public/favicon.ico" alt="Time Tracker logo" />
  </a>
</p>

<h3 align="center">Time Tracker v2</h3>

<p align="center">
  A self-hosted, full-stack productivity tracker for capturing focused work, reviewing past activity, and visualizing trends over time.
</p>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/ayushr2345/time-tracker-v2.svg)](https://github.com/ayushr2345/time-tracker-v2/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/ayushr2345/time-tracker-v2.svg)](https://github.com/ayushr2345/time-tracker-v2/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

## Overview

Time Tracker v2 is a modern monorepo application for personal productivity logging. It combines a real-time timer, retroactive manual entry, activity management, and a visual history dashboard into one cohesive experience.

The project is built to be practical and resilient:

- capture work as it happens with timer-based logging
- add past sessions manually when you forget to start the timer
- organize activities and review historical entries
- visualize intensity with a GitHub-style contribution heatmap
- run locally or self-host it with Docker

## Key Features

- Real-time timer mode for live activity tracking
- Manual entry mode for retroactive logging across dates and time ranges
- Activity management for defining reusable categories and labels
- Historical activity log views with delete/edit workflows
- Intensity-based heatmap visualization for recurring patterns
- Shared TypeScript models and constants across frontend, backend, and tooling
- Docker-based development and production environments
- Automated backup and restore workflow for MongoDB

## Architecture

This repository is organized as a TypeScript monorepo:

- frontend: React + Vite + Tailwind UI
- backend: Express + MongoDB + Mongoose API
- shared: reusable types and constants used across the app

## Tech Stack

- [React 19](https://react.dev/) with [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/)

## Getting Started

### Prerequisites

Make sure the following are available on your machine:

- Node.js 24 LTS
- npm 10+
- Docker and Docker Compose
- MongoDB (for native local development)

### 1. Clone the repository

```bash
git clone https://github.com/ayushr2345/time-tracker-v2.git
cd time-tracker-v2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

The example file includes the default ports used by the app:

- backend: 5050
- frontend: 5051
- MongoDB: 27017

### Option A: Run locally

For native development, start the shared package, backend, and frontend separately:

```bash
npm run build --workspace=@time-tracker/shared
npm run dev --workspace=backend
npm run dev --workspace=frontend
```

Then open the app in your browser at:

- frontend: http://localhost:5051
- backend API: http://localhost:5050

### Option B: Run with Docker for development

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

This spins up the full stack with a seeded development database.

### Option C: Run with Docker for production

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This is intended for a self-hosted deployment environment with persistent storage and automated backup behavior.

## Usage

### Timer Mode

Use Timer Mode when you want to track a task in real time. Start the timer when work begins, stop it when it ends, and the app records the session and updates the dashboard.

### Manual Entry Mode

Use Manual Entry Mode when you need to log work retroactively. Enter a date, start time, and end time to add a historical entry.

### Activity History and Heatmap

The overview and history pages let you inspect existing entries, manage activities, and review visual activity density over time.

## Testing

Frontend unit tests are written with Vitest and React Testing Library.

Run the frontend test suite:

```bash
npm run test --workspace=frontend
```

Run lint checks:

```bash
npm run lint --workspace=frontend
```

## Project Structure

```text
backend/        Express API and MongoDB integration
frontend/       React application and UI components
shared/         Shared TypeScript models and constants
seed/           Database seed assets
scripts/        Deployment and operational helpers
```

## Roadmap

The current roadmap and planned enhancements are documented in [ROADMAP.md](ROADMAP.md).

## Contributing

Contributions are welcome. If you would like to improve the app, please open an issue or submit a pull request with a clear summary of the change.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Authors

- Ayush Ranjan - project development and architecture
