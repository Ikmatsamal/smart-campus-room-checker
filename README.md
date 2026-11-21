# Smart Campus Room Availability Checker

A read-only demo that checks whether a campus room is free for a chosen time
interval. It uses fictional sample data only: no login, no database, no real
bookings, and it never creates or changes bookings.

## Run

```
npm install
npm run dev
```

## Checks

```
npm test
npm run lint
npm run typecheck
npm run build
```

## Structure

- `src/lib/availability.ts`: availability rules (AC1-AC5), time parsing and formatting
- `src/lib/filterRooms.ts`: filtering rooms by capacity and equipment
- `src/lib/sampleData.ts`: the fictional rooms and bookings
- `src/components/`, `src/App.tsx`: the interface
- `AGENTS.md`: rules for AI agents working in this repository

## Known limitations

- Dev dependencies have known `npm audit` findings; production dependencies show none (`npm audit --omit=dev`).
- Two lint warnings are known (`App.tsx` useMemo, `FilterBar.tsx` fast refresh).
- AC6 (desktop/mobile feedback) is checked visually, not by a unit test.
