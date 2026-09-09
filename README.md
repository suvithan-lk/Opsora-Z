# Opsora Z

A modern workspace-style web application built with **Next.js, React, TypeScript, and Tailwind CSS**. The project explores a practical operations workspace with channels, direct messages, threads, saved items, workspace preferences, and AI-assisted operational workflows.

## Highlights

- Workspace-style navigation and responsive interface
- Channels, direct messages, threads, huddles, and saved items
- Workspace preferences and reusable UI components
- Health-check API route
- AI-assisted diagnosis and dispatch-optimization routes
- Deterministic fallback responses when an AI key is not configured

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Node.js API routes
- Optional Gemini API integration

## Run Locally

### Prerequisites

- Node.js 18.18 or newer
- npm

### Installation

```bash
npm install
```

### Environment variables

Create `.env.local` if you want to enable AI-assisted features:

```env
GEMINI_API_KEY=your_api_key_here
```

The application can also run with deterministic local fallback responses without this key.

### Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

### Production build

```bash
npm run build
npm run start
```

## API Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Returns service status |
| POST | `/api/ai/diagnose` | Analyzes a telemetry payload |
| POST | `/api/ai/optimize-dispatch` | Returns dispatch recommendations |

## Project Purpose

Opsora Z is a portfolio project focused on modern frontend architecture, business-oriented workflows, API integration, and AI-assisted product experiences.

## Author

**Suvithan** — [GitHub](https://github.com/suvithan-lk)
