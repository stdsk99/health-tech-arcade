# Health Tech Arcade – Prototype v0.1

**PLAY • LEARN • EXPLORE**

A Thai-first, mobile-friendly educational arcade for introducing high-school students to health technology.

## Included
- Responsive landing page and mission selection
- ER HERO: choose an appropriate medical device for a simulated task
- BODY SCANNER: match an imaging task with a diagnostic technology
- MEDTECH BUILDER: learn the basic components of a pulse oximeter
- Local score summary and booth invitation

## Requirements
- Node.js 22 LTS (or a version supported by the current Vite release)
- npm

## Run locally
```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Production build:

```bash
npm run build
npm run preview
```

## Prototype limitations
- Scores are held in React state and reset when the page reloads.
- No cloud database, server-validated scores, real-time leaderboard, QR token issuance, or redemption yet.
- The reward action is a placeholder. These capabilities are planned for later phases.
- All patient scenarios and measurements are educational simulations, not clinical advice.

## Roadmap
1. Phase 1: validate gameplay and mobile UX
2. Phase 2: campaign sessions, Supabase database, server-validated scoring, reward tokens
3. Phase 3: admin dashboard, live leaderboard, QR redemption
4. Phase 4: deployment hardening and event load testing
