# Scotch Gambit Training App – Implementation Tasks
## Phase 0 – Define Scope & Gather Data
- [ ] **Clarify core features**  
      - Interactive chessboard that enforces legal moves.  
      - Drills limited to the Scotch Gambit (white) and the *N* most common Black replies.  
      - Immediate feedback (“Correct / Best Move”, “Try Again”, show optimal line).  
      - Simple progress tracker (per‑user accuracy %, streak, last‑seen date).
- [ ] **Compile opening data**  
      - Create `openings/scotch-gambit.json` with an array:  
        ```ts
        type Variation = {
          id: string;
          eco: string;                  // e.g. "C45"
          blackMoveSAN: string;         // e.g. "...Nf6"
          frequencyPercent: number;     // popularity in master games
          bestWhiteReplySAN: string;    // e.g. "e5"
          linePGN: string;              // full illustrative PGN for hint / reveal
        };
        ```  
      - Populate from a trusted opening book or lichess opening explorer export. (≈10 top variations is enough to start.)

## Phase 1 – Project Scaffolding
- [ ] Run  
      ```bash
      npx create-next-app@latest scotch-trainer \
        --typescript --tailwind --eslint \
        --app --src-dir --import-alias "@/*"
      ```
- [ ] Upgrade to **Next.js 15.x** and **React 19 RC** if the starter does not include them.  
- [ ] Verify Tailwind 4 is active (`tailwind.config.ts` version 4 rules).  
- [ ] Delete boilerplate pages, keep only `app/layout.tsx` and `app/page.tsx`.

## Phase 2 – Chess Logic & Utilities
- [ ] Add dependencies  
      ```bash
      pnpm add chess.js @types/chess.js
      ```
- [ ] Wrap `chess.js` in `lib/useChess.ts` React hook:  
      - Expose current FEN, legal moves, `makeMove(san)`, `reset(positionPgn)`.  
      - Accept a callback for “move result” so UI can give feedback.
- [ ] Write `lib/variationStore.ts` that loads JSON and provides helpers  
      `getById(id)`, `getRandomVariation()`, `getAll()`.

## Phase 3 – Data‑Persistence (per‑user progress)
> Start simple with client‑side storage; swap to a DB later if multi‑user auth is needed.
- [ ] Create `lib/useProgress.ts` hook  
      - Saves `{ variationId: { attempts, correct } }` map in `localStorage`.  
      - Exposes `markAttempt(variationId, wasCorrect)` and aggregate stats.

## Phase 4 – UI Shell (Tailwind 4 + App Router)
- [ ] Global layout in `app/layout.tsx`  
      - Include responsive navbar (`Home`, `Train`, `Stats`).  
      - Base styles: dark‑mode capable using Tailwind’s class strategy.
- [ ] Landing page `app/page.tsx`  
      - Brief explanation of the Scotch Gambit & “Start Training” CTA.
- [ ] Training route segment `app/(train)/train/page.tsx`  
      - Server Component loads a random variation, passes props to Client Component.

## Phase 5 – Training Components
- [ ] **`<ChessBoard />`**  
      - Uses `chess.js`, renders with lightweight SVG or integrate `react-chessboard`.  
      - Board is locked until Black move is pre‑played; then waits for user reply.  
- [ ] **`<FeedbackBanner />`** (green/red highlight, shows correct move if wrong).  
- [ ] **`<MoveHistory />`** (mini PGN viewer, collapsible).  
- [ ] Sequence:  
      1. Board resets to starting Scotch Gambit position.  
      2. Auto‑play the chosen Black response.  
      3. User must play the optimal White reply.  
      4. Compare SAN, show feedback, update progress store.  
      5. “Next Drill” button fetches a new variation.

## Phase 6 – Stats & Review
- [ ] **`app/(stats)/stats/page.tsx`**  
      - Read progress store.  
      - Display table of variations with success rate.  
      - Simple bar chart of accuracy (consider `chart.js` for quick render).  
- [ ] Add “Retry missed variations” mode (filter list before training).

## Phase 7 – Styling & UX Polish
- [ ] Apply Tailwind 4 utilities for board sizing, typography, buttons.  
- [ ] Add subtle animations (`@tailwindcss/animate` plugin).  
- [ ] Ensure layout is mobile‑first (board scales down to 320 px wide).

## Phase 8 – Deployment & DX
- [ ] Add `vercel.json` (if using Vercel) with Edge runtime disabled (not needed).  
- [ ] `pnpm run build && pnpm run start` locally to confirm no hydration errors.  
- [ ] Push to GitHub, link repo in Vercel dashboard, set environment to **Production**.  
- [ ] Enable Vercel Analytics for initial performance insights.

## (Optional) Phase 9 – Future Enhancements
- [ ] Replace JSON with a hosted DB (Supabase Postgres + Drizzle ORM).  
- [ ] Add authentication (NextAuth.js 6, email link).  
- [ ] Expand opening repertoire via data‑driven seed scripts.  
- [ ] Spaced‑repetition scheduler for drills (SM‑2 algorithm).

---
**Time permitting,** consult the official Next.js 15 upgrade guide for detailed config flags and React 19 notes. 
