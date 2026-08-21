# Opsora Z Workspace

A Slack-style workspace clone built with Next.js, React, TypeScript, and Tailwind CSS. The interface uses a focused dark workspace system with electric blue and cyan accents, and includes mock channels, direct messages, threads, huddles, saved items, and workspace preferences.

## Run Locally

**Prerequisites:** Node.js 18.18 or newer

1. Install dependencies:
   `npm install`
2. Optional: add `GEMINI_API_KEY` to `.env.local` to enable AI-assisted diagnostics and dispatch optimization. Without it, deterministic local fallback responses are used.
3. Start the development server:
   `npm run dev`
4. Open `http://localhost:3000`.

## Production

```bash
npm run build
npm run start
```

## API Routes

- `GET /api/health` returns service status.
- `POST /api/ai/diagnose` analyzes a telemetry payload.
- `POST /api/ai/optimize-dispatch` returns dispatch recommendations.
