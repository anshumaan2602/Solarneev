# SOLARNEEV website

The SOLARNEEV home page: rooftop solar packages, a subsidy calculator beside a 3D house, and a
call-back form. English is at `/`, Hindi at `/hi/`; the language switch changes the page in place.

Built with Next.js 16 (App Router) as a static export, so `npm run build` produces plain files in
`out/` that any static host can serve.

## Run it

Needs Node.js 20.9 or later.

```bash
npm install
npm run dev        # http://localhost:3000 (Hindi: http://localhost:3000/hi/)
npm run build      # writes the site to out/
npm run preview    # serves out/ at http://localhost:3000
npm test           # calculator, formatting, copy and form tests
npm run lint
npm run typecheck
```

## The forms

The call-back form and the farm-pump form email their details through
[Web3Forms](https://web3forms.com) (free for 250 submissions a month).

1. Create an access key at web3forms.com for the inbox that should receive leads.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_WEB3FORMS_KEY`.
3. Rebuild. The key is built into the page, so changing it means building again.

Without a key the forms still check what was typed, then say the message could not be sent and
show the phone number. They never pretend to have sent anything.

## Where to change things

| To change | Edit |
|---|---|
| Any page text | `src/content/en.ts` and `src/content/hi.ts` (same keys in both) |
| Founder and team names, review names and bills, the Hindi tagline | `src/content/shared.ts` |
| Form menu choices, and the English wording the lead email shows for each | `leadValues` in `src/content/shared.ts`, plus each choice's label in the two content files |
| Phone numbers, email, address, website, the "Our work so far" numbers, society and business price per kW | `src/config/site.ts` |
| Home price list, states (sunshine, tariff, top-ups), slider steps | `src/lib/calc/data.ts` |
| Subsidy, loan and savings rules | `src/lib/calc/calc.ts` |
| Colours and font stacks | `src/app/globals.css` |
| Title and description for search results | `meta` in the two content files |

Text in `[brackets]` is a placeholder from the design waiting for real details: names, photos,
reviews, the Google rating and the year in "rooftops solarised since [YEAR]". The "Our work so
far" figures in `src/config/site.ts` start as `null`: the page shows the design's sample figure for
each one and labels the numbers as samples until every figure is filled in.

Prices and subsidies are also quoted in the page text (the hero, the system-type cards, the FAQ).
If you change a price or a rule, `npm test` fails until those sentences match the calculator again.

## Deploying

Upload the contents of `out/` to any static host. On Netlify, Vercel or Cloudflare Pages: build
command `npm run build`, output directory `out`, and `NEXT_PUBLIC_WEB3FORMS_KEY` as an environment
variable. Set the production address in `src/config/site.ts` (`url`); it is used for the canonical
and language links search engines read.

## How it is put together

- `src/app/(en)` and `src/app/(hi)` are the two language versions, each with its own `<html lang>`
  and metadata. Both render `src/components/SitePage.tsx`.
- `src/components/sections/` has one component per section, each with its own `.module.css`.
- `src/lib/calc/` holds the calculator: data, the estimate, state changes, and the text it shows.
  These are plain functions with tests next to them.
- `src/lib/scene/solarScene.ts` draws the 3D house with three.js, loaded only in the browser. It
  only draws while something moves and stops while the house is off screen.
- Each page arrives with its own language's text; the other language downloads when the visitor
  points at (or taps) the language switch.

Notes:

- three.js is pinned to 0.128.0 on purpose. The design was drawn with that release, and later
  ones changed lighting, colour handling and shadows. Upgrading means re-tuning the scene.
- Fonts are the design's Google Fonts, downloaded at build time and served from this site. The
  build needs internet access to fetch them.

## Changes from the design

- The 3D house only stays pinned while it sits beside the calculator. In the design it also pinned
  between 1000 and 1063 px wide, where it covered the calculator below it.
- The language switch also changes the address, the canonical link and the share details, so
  links, reloads, Back and Forward, and shared pages keep the language.
- The forms send, with checks on name and mobile number (Devanagari digits are fine), and messages
  for success and failure.
- "Calculate" on a package row opens that package in Uttar Pradesh, the state the table is priced
  for, so the calculator shows the same net cost as the row.
- The loan EMI for systems over 3 kW uses the higher rate (8%) on the whole loan, as the loan
  section's text describes. The design charged 6% on the first ₹2 lakh at every size.
- The system-type cards say their "after subsidy" prices include the UP top-up.
- The tariff and homes boxes can be cleared and retyped without the figures jumping: the estimate
  keeps the last number in range, and an entry out of range is outlined in red.
- The sample-stats note points at `src/config/site.ts` instead of the design tool's settings.
