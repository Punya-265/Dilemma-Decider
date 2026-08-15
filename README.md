# DilemmaDecider

AI-powered decision-support tool that turns a messy dilemma into a calm, structured comparison.

## What it does

Users submit a free-text dilemma. The application asks an AI reasoning engine to:

1. Identify the two most consequential options.
2. Extract the values and constraints actually implied by the user.
3. Compare real pros and cons without padding.
4. Surface a genuine blind spot.
5. Give one recommendation grounded in the extracted factors.

The AI response is returned as strict JSON so the frontend can render predictable decision cards.

## Safety / scope

DilemmaDecider is a decision-support tool, not an authority or professional advisor. It should not replace qualified advice for medical, legal, financial, or safety-critical decisions.

## Project structure

- `client/` — React frontend
- `server/` — Express API and AI integration
- `server/src/services/decisionEngine.js` — structured AI prompt and response validation

## Environment

Create `server/.env` from `server/.env.example` and add your OpenAI API key.

Never commit `.env` or API keys.

## Run locally

```bash
cd server
npm install
npm run dev
```

In another terminal:

```bash
cd client
npm install
npm run dev
```
