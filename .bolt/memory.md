# Project memory

## Product intent & audience

- Room/venue availability checker app built with Vite + React.
- Users submit availability queries and receive an Available / Not available result with a reason.
- Optional "Explain availability" feature provides a short, mock AI explanation of the result for transparency/help.

## Brand personality & voice

- Production-quality, polished, not generic.
- Clear, concise UI copy (e.g. "AI explanation (mock)" labeling).

## Visual design & UX direction

- Result panel uses color-coded banners: green = Available, red = Not available.
- Explain availability button sits directly under the result banner.
- Explanation panel supports show/hide toggle and resets when the availability result changes to avoid stale content.
- Fallback UX: if explanation generation fails, existing reason text is shown instead.
- Stack: Tailwind CSS classes, Lucide React icons, React hooks, JSX.
- Path alias `@/` → `src/` for imports; avoid deep relative paths.

## Decisions, constraints & rationale

- `src/lib/availability.ts` is the authoritative availability logic and must not be modified.
- 42 existing tests must continue to pass; builds and lint must stay clean (no new warnings).
- Mock explanation adapter only consumes the final `checkAvailability` result (`available` + `reason`); it cannot alter the decision or bookings.
- No real APIs, API keys, login, database, or real personal data.
- Files added/changed: `src/lib/explainAvailability.ts` (mock adapter), `src/components/ExplainAvailability.tsx` (UI), `src/App.tsx` (mount panel under result banner).
- Avoid installing extra UI/icon/theme packages unless explicitly requested.

## Open questions & assumptions

- Assumes availability result shape includes `available: boolean` and `reason: string`.
- Mock explanation intentionally limited to ≤2 sentences and labeled as mock; real AI integration is out of scope.