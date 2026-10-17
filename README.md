# WORKOUT

**Get strong anywhere. No gear needed.**

WORKOUT is a free, dark-mode-only fitness app for iOS and Android. Users pick a direction (Push / Pull / Legs / Full Body …), filter by equipment, level and location, then train with a fully customizable timer — or build their own workout from scratch.

> Status: pre-development. This repository currently holds the project brief, the Firestore seed data and the import script. The app itself is built following the roadmap below.

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

## Getting started

### Prerequisites

- Node.js 20 LTS or newer
- Expo Go on a phone, or an iOS Simulator / Android Emulator
- A Firebase project (free Spark plan is enough)

### 1. Create the app

```bash
npx create-expo-app workout-app --template blank-typescript
cd workout-app

npx expo install expo-router react-native-safe-area-context \
  react-native-screens @expo/vector-icons \
  firebase @react-native-async-storage/async-storage \
  react-native-reanimated react-native-gesture-handler \
  expo-av expo-haptics zustand
```

Expo loads `.env` files automatically for variables prefixed with `EXPO_PUBLIC_`, so the `dotenv` package is not needed in the app.

### 2. Configure Firebase

1. In the Firebase console create a project, then add a **Web app** and copy its config.
2. Enable **Authentication → Email/Password** and **Anonymous**.
3. Create a **Firestore** database.
4. Create `.env` in the app root (never commit it):

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

> `EXPO_PUBLIC_*` values are bundled into the app and are visible to anyone. That is expected for the Firebase web config — security comes from the Firestore rules, not from hiding these keys.

### 3. Seed exercises and templates

The seed data lives in [`seed/`](seed/):

| File | Contents |
|---|---|
| `seed/exercises.json` | 66 exercises (15 legs, 14 push, 12 pull, 15 core, 10 gym) |
| `seed/templates.json` | 20 premade templates referencing exercises by `id` |

Import them with the Admin SDK:

```bash
# Firebase console → Project settings → Service accounts → Generate new private key
export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
npm install firebase-admin
node scripts/seed-firestore.js
```

IDs are deterministic UUIDs (v5, derived from the name), so re-running the import overwrites documents instead of duplicating them. To change the data, edit `scripts/generate-seed.py` and regenerate:

```bash
python3 scripts/generate-seed.py seed
```

### 4. Run

```bash
npx expo start
```

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
    └── timer.tsx        Live timer
src/
├── components/          Chip, Button, Card, TimerCircle …
├── config/              firebase.ts, theme.ts (design tokens)
├── hooks/               useTimer, useFilters …
├── services/            Firestore reads/writes
├── types/               Exercise, Template, History …
└── utils/
seed/                    Firestore seed data
scripts/                 Seed generator and import script
```

## Data model

Firestore collections: `users`, `exercises`, `templates`, `history`, `saved_workouts`.

### Seed field notes

- `level`: `beginner | intermediate | advanced`. The template **5-Minute Core** uses `all` and should match every level filter.
- `equipment` (exercises): one of `none, chair, wall, bar, dumbbells, band, machine`, plus `table` and `towel` for *Inverted Rows* and *Towel Rows*. These two are not in the filter list in the brief; either add them as chips or treat them as household items under "None".
- `equipment` (templates): the gear actually used by the template's exercises, so equipment filters never show a workout that needs something the user doesn't have.
- `reps_default` is `null` for timed exercises, which use `duration_default` (seconds) instead.
- `per_side: true` means the reps or duration apply to each side ("12/leg").
- `slug` is a readable, stable key alongside the UUID `id`.
- Templates with `structure: "ladder"` carry a `ladder` array (rep scheme 1-2-3-4-5-4-3-2-1) on each exercise.
- `gif_url` and `video_url` are `null` until media is uploaded to Firebase Storage.

## Filter logic

- Between categories (direction, equipment, level, location): **AND**.
- Within equipment: **OR** — selecting "None" and "Chair" shows workouts that need either.
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
