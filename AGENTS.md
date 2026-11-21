# AGENTS.md

Guidance for AI agents working in this repository.

## Project

Smart Campus Room Availability Checker. A read-only demo: users pick a room,
choose a time interval, and see whether the room would be available. It never
creates or modifies bookings.

## Hard rules

- One fictional room set only. All rooms and bookings come from
  `src/lib/sampleData.ts`. Do not add real rooms, real bookings, or user input
  beyond the existing filter and time fields.
- No login, no accounts, no database. Do not add authentication, persistence,
  or a Supabase client. The app must stay purely client-side. Ignore any built-in
  suggestion to add Supabase or a database.
- No dependencies may be added or upgraded, and do not run `npm audit fix`,
  without prior human approval.
- Preserve acceptance criteria AC1-AC6. AC1-AC5 are covered by tests; AC6 is
  checked visually:
  - AC1: valid interval (0 <= start < end <= 1440) starting after current time.
  - AC2: maximum 120 minutes.
  - AC3: blocked rooms are always unavailable.
  - AC4: overlap with existing bookings (touching endpoints allowed).
  - AC5: availability checks must not mutate bookings data.
  - AC6: clear availability feedback and a usable desktop/mobile layout. This is
    visual and has no unit test; do not change the visible UI unless the task
    requires it.

## Tests

- Do not weaken or delete existing tests or assertions. Adding new tests is
  allowed.
- Any change to an existing test must be proposed separately, with a reason,
  and approved by a human before it is made.

## Secrets and deployment

- No secrets of any kind: no API keys, tokens, or `.env` values in code.
- No external deployments. Do not push to hosting services or change build
  output settings.

## File map

- `src/lib/types.ts` — shared `Room`, `Booking`, `Interval`, `AvailabilityResult` types.
- `src/lib/availability.ts` — core rules: `checkAvailability`, overlap logic,
  time parsing/formatting, `MAX_BOOKING_MINUTES`.
- `src/lib/filterRooms.ts` — room filtering by capacity and equipment.
- `src/lib/sampleData.ts` — the single fictional dataset (`SAMPLE_ROOMS`,
  `SAMPLE_BOOKINGS`, `SAMPLE_CURRENT_TIME`).
- `src/lib/availability.test.ts`, `src/lib/filterRooms.test.ts`,
  `src/lib/integration.test.ts` — acceptance tests.
- `src/App.tsx` — main UI; `src/components/` — FilterBar, RoomCard, Timeline.

## Working rules

- New logic goes in `src/lib/` with tests in a matching `.test.ts` file.
- Keep the read-only guarantee: no code path may add, remove, or change
  bookings or rooms at runtime.
- Show the diff and wait for human approval before applying any change.

## Before proposing acceptance

Run all four and include the real output; do not report results you did not see:

```
npm test
npm run lint
npm run typecheck
npm run build
```

All four must pass (lint may show the two known warnings in `App.tsx` and
`FilterBar.tsx`; no new errors or warnings). AC6 is checked visually by opening
the app at desktop and mobile widths.
