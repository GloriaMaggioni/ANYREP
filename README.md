# WORKOUT

**Get strong anywhere. No gear needed.**

WORKOUT is a free, dark-mode-only fitness app for iOS and Android. Users pick a direction (Push / Pull / Legs / Full Body …), filter by equipment, level and location, then train with a fully customizable timer — or build their own workout from scratch.

> Status: **working base version.** All 13 screens run on the web (PC browser), iOS and Android through Expo. Data is stored locally on the device; Firebase sync is the next step (see [What's not done yet](#whats-not-done-yet)).

---

## Features (launch scope)

1. Filter-first workout discovery (direction, equipment, level, location)
2. 6 template structures: Rounds, Tabata, EMOM, AMRAP, Ladder, Custom
3. Customizable timer (work, rest between exercises, rest between rounds, rounds)
4. Library of 66 tagged exercises
5. 20 premade templates
6. Create workouts from scratch
7. Edit any template and swap exercises
8. Save custom workouts
9. Workout history, streaks and stats
10. Audio cues and haptic feedback

## Tech stack

| Area | Choice |
|---|---|
| App | React Native + Expo (TypeScript) |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Styling | StyleSheet or NativeWind |
| Backend | Firebase — Auth (email/password + anonymous), Firestore, Storage |
| Offline | AsyncStorage + Firestore persistence |
| Audio / haptics | expo-av, expo-haptics |
| Animations | React Native Reanimated |
| Icons | @expo/vector-icons (Ionicons) |

---

## Run it on your PC

Requires **Node.js 20 LTS or newer**.

```bash
git clone <this repo>
cd ANYREP
npm install
npm run web
```

The browser opens at `http://localhost:8081`. Choose **Continue as guest** (or sign in with any name and email) and you're in.

Other commands:

| Command | What it does |
|---|---|
| `npm run web` | Dev server in the browser, reloads on save |
| `npm start` | Dev server with a QR code — open it with Expo Go on your phone |
| `npm run build:web` | Static production build in `dist/` (host it on any static host with SPA fallback, e.g. `npx serve -s dist`) |
| `npm run typecheck` | TypeScript check |

### Keyboard shortcuts in the timer (PC)

- **Space**: start / pause / resume
- **→**: DONE (end the set) or skip the rest

## What works

- Login with a name + email, or as a guest; log out
- Home with greeting, streak, workout count, quick start of the last workout
- Quick direction chips plus a filter sheet (direction, equipment, level, location) with a live result count
- Workout preview with exercise descriptions
- Edit workout: name, structure, timer, rounds, direction/level/location, reps, reorder, remove, swap, add
- Exercise library with search and filters (add or swap mode)
- Start from scratch
- Save, list and delete custom workouts (premade workouts are never changed; editing one saves your own copy)
- Live timer for all 6 structures: 3-2-1 countdown, work, rest between exercises, rest between rounds, +1 REP, DONE, skip rest, pause/resume, end early
- Audio cues (web) and haptics (iOS/Android)
- Workout complete summary with save, share, repeat
- History, streak, totals and a 7-day chart; profile settings (level, location, sound on/off)
- Data persists across reloads (localStorage on web, AsyncStorage on mobile)

## What's not done yet

- **Firebase**: auth and data are local to the device. The store in `src/hooks/useStore.ts` mirrors the Firestore collections, so a sync layer can be added there. The seed import script below is ready for when the Firebase project exists.
- **Audio on iOS/Android**: cues are synthesized with the Web Audio API, so phones only get haptics for now (needs sound files + `expo-audio`).
- **Exercise GIFs/videos**: `gif_url` / `video_url` are empty.
- **Inter font**: used if installed on the system, otherwise the system font.

## Firebase (next step)

1. In the Firebase console create a project, then add a **Web app** and copy its config.
2. Enable **Authentication → Email/Password** and **Anonymous**, and create a **Firestore** database.
3. Create `.env` in the project root (never commit it):

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

> `EXPO_PUBLIC_*` values are bundled into the app and are visible to anyone. That is expected for the Firebase web config — security comes from the Firestore rules, not from hiding these keys.

### Seed exercises and templates

The seed data lives in [`seed/`](seed/) and is also bundled into the app, so the catalog works offline:

| File | Contents |
|---|---|
| `seed/exercises.json` | 66 exercises (15 legs, 14 push, 12 pull, 15 core, 10 gym) |
| `seed/templates.json` | 20 premade templates referencing exercises by `id` |

Import them with the Admin SDK:

```bash
# Firebase console → Project settings → Service accounts → Generate new private key
export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
npm install --no-save firebase-admin
npm run seed:firestore
```

IDs are deterministic UUIDs (v5, derived from the name), so re-running the import overwrites documents instead of duplicating them. To change the data, edit `scripts/generate-seed.py` and run `npm run seed:generate`.

---

## Project structure

```
app/
├── (auth)/login.tsx
├── (tabs)/
│   ├── index.tsx        Home
│   ├── workouts.tsx     Saved workouts
│   ├── create.tsx       Create from scratch
│   ├── stats.tsx        Stats
│   └── profile.tsx      Profile
└── workout/
    ├── [id].tsx         Workout preview
    ├── edit.tsx         Edit workout
    ├── library.tsx      Exercise library (add / swap)
    └── timer.tsx        Live timer, rests, workout complete
src/
├── components/          ui.tsx (Button, Chip, Card, Stepper…), WorkoutCard, TimerCircle, FilterSheet, WorkoutEditor
├── config/              theme.ts (design tokens), options.ts (filter/structure options)
├── hooks/               useStore (Zustand + persistence), useWorkoutTimer
├── services/            data.ts (catalog), feedback.ts (audio + haptics)
├── types/               Exercise, Template, HistoryEntry …
└── utils/               filters, timerEngine, stats (streak), format
seed/                    Firestore seed data
scripts/                 Seed generator and import script
```

## Data model

Firestore collections: `users`, `exercises`, `templates`, `history`, `saved_workouts`.

### Seed field notes

- `level`: `beginner | intermediate | advanced`. The template **5-Minute Core** uses `all` and should match every level filter.
- `equipment` (exercises): one of `none, chair, wall, bar, dumbbells, band, machine`, plus `table` and `towel` for *Inverted Rows* and *Towel Rows*. They are not in the brief's filter list, so the app adds them as two extra equipment chips.
- `equipment` (templates): the gear actually used by the template's exercises, so equipment filters never show a workout that needs something the user doesn't have.
- `reps_default` is `null` for timed exercises, which use `duration_default` (seconds) instead.
- `per_side: true` means the reps or duration apply to each side ("12/leg").
- `slug` is a readable, stable key alongside the UUID `id`.
- Templates with `structure: "ladder"` carry a `ladder` array (rep scheme 1-2-3-4-5-4-3-2-1) on each exercise.
- `gif_url` and `video_url` are `null` until media is uploaded to Firebase Storage.

## Filter logic

- Between categories (direction, equipment, level, location): **AND**.
- Within equipment: **OR** — tick everything you have; a workout shows up if all the gear it needs is ticked ("None" + "Chair" shows no-gear and chair workouts).
- "Upper" also matches Push and Pull days; "Lower" also matches Leg days. Workouts marked "Anywhere" match every location, and level "all" matches every level.
- No selection (or "Any") in a category means that category does not filter.

## Timer engine

```
IDLE → COUNTDOWN (3-2-1-GO) → WORKING → REST_EXERCISE → WORKING → …
     → REST_ROUND → WORKING → … → COMPLETE
```

Defaults: work 45 s, rest between exercises 15 s, rest between rounds 60 s, 4 rounds.

---

## Design system (summary)

| Token | Value |
|---|---|
| Background | `#0A0A0A` / `#141414` / card `#1A1A1A` |
| Border | `#2A2A2A` |
| Text | `#FFFFFF` / `#A0A0A0` / muted `#606060` |
| Accent | `#6C63FF` (purple), `#00D4AA` (teal) |
| Warning / Danger | `#FFB800` / `#FF4466` |
| Font | Inter (fallback SF Pro / Roboto) |
| Spacing | 8 pt grid: 4, 8, 16, 24, 32, 48, 64 |

Touch targets are at least 44 pt and text meets WCAG AA contrast.

## Roadmap

| Sprint | Weeks | Focus |
|---|---|---|
| 1 | 1–2 | Expo + Firebase setup, auth, seed data, navigation, static home |
| 2 | 3–4 | Filters, workout list, preview, timer engine, live timer + audio |
| 3 | 5–6 | Edit workout, exercise library and swap, create from scratch, save |
| 4 | 7–8 | History, stats, streaks, animations, testing, store submission |
| 5 | 9–10 | Social sharing, achievements, weekly challenges |
| 6 | 11–12 | Apple Watch, voice guidance, light theme, PDF export |

## Hiring a developer

A statement-of-work template is in [`docs/SOW-template.md`](docs/SOW-template.md).

## License

All rights reserved. Not yet licensed for redistribution.
