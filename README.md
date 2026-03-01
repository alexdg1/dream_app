# Dream Support Prototype App

Next.js scaffold for the private-first dream support product.

## What changed

This is now a real app shell rather than a static HTML mockup:

- Next app router structure
- client-side React state
- local persistence via `localStorage`
- multi-step capture flow:
  - dream capture
  - known-person inner-figure reflection
  - guided re-entry
  - re-entry summary
- realistic empty archive -> first dream saved -> archive growth flow
- per-dream detail view with capture + re-entry material
- source-informed local lens engine for symbolic, grounded, and support-first readings
- edit/delete support for saved dreams
- heuristic interpretation output per dream
- archive search and tag filtering
- pattern summary derived from saved dreams
- therapist-share selection and downloadable bundle export (`.txt` / `.json`)
- weekly follow-through tracking per dream
- PWA metadata and installable home-screen shell
- server-side OpenAI analysis route with local fallback
- mode-specific flow screens for symbolic, grounded, and support-first use cases

## Run

```bash
cd "/Users/alexdegiorgio/codex/home : health/dream-support-prototype-app"
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Optional OpenAI analysis

Set a server-side API key if you want `Dream Detail` to call OpenAI for deeper analysis:

```bash
OPENAI_API_KEY=your_key_here
```

Optional model override:

```bash
OPENAI_MODEL=gpt-4.1-mini
```

Without `OPENAI_API_KEY`, the app falls back to its local rule-based lens engine.

See `/Users/alexdegiorgio/codex/home : health/dream-support-prototype-app/VERCEL_SETUP.md` for the exact Vercel claim + env + redeploy steps.

## Phone install path

The likely first mobile distribution path is a PWA rather than a native App Store build.

After deployment:

1. Open the site in Safari on iPhone.
2. Tap `Share`.
3. Tap `Add to Home Screen`.

That gives you an app-style icon and standalone launch experience.

If you later want App Store distribution, the next step would be a native wrapper or a React Native/Expo build.

## Structure

- `app/layout.jsx`: app shell layout
- `app/page.jsx`: root page
- `app/globals.css`: shared styling
- `components/DreamSupportApp.jsx`: main interactive client component
- `lib/demo-data.js`: seeded example modes and onboarding content
- `lib/storage.js`: local persistence helpers

## Implemented flow

1. `Home` / onboarding
2. `Capture`
3. `Known People`
4. `Re-entry Start`
5. `Re-entry Scene`
6. `Re-entry Summary`
7. Save into archive
8. `Dream Detail` with interpretation + weekly follow-through
9. `Patterns` and `Therapist Share`

## Current limitations

- no backend or auth
- no server persistence
- baseline interpretation is local and rule-based; deeper analysis is optional via OpenAI
- OpenAI analysis is optional and requires server-side env configuration
- no therapist account model or export transport yet
- no advanced archive search, tagging ontology, or cross-dream motif clustering yet
