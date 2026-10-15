# TSK — Tokyo Star Kings Cricket Club Portal

A responsive React + Vite + Tailwind CSS portal with a navy/gold sports identity.

## Features
- Club overview and motto
- Team Info tab requests the Tokyo Star Kings public CricClubs team page through a Vercel server-side function; player search is preserved
- Roster sync status, manual refresh, and a direct link to the official CricClubs roster
- Availability form with WhatsApp message sharing
- 20-over / 40-over milestone tracker (still demo data; not connected to player career statistics)
- Season archives, contact cards, and registration form demo

## CricClubs roster integration — important feasibility note

The team page configured in this project is:

`https://cricclubs.com/cricketorjp/viewTeam.do?teamId=2732&clubId=21278`

I could not verify an official, documented public CricClubs API for this team's roster. Public community documentation describes some **unofficial** CricClubs live-score overlay endpoints, but those are match-scoped and are not a confirmed, supported roster API. The portal therefore uses a **best-effort server-side fetch of the public team page**, looking for links that identify player profiles. It does not put the request in the browser, and it does not fabricate player names if the page is blocked or its structure changes.

This automatic sync is experimental until tested on the deployed Vercel project. CricClubs may block automated requests or change its HTML, in which case the Team Info tab shows an error and links directly to the official roster. For reliable production sync, ask CricClubs/Japan Cricket Association for an approved roster API or export/feed and integrate that supported interface instead.

## Run locally
Requirements: Node.js 18+

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The Vite development server does not automatically run the `/api/players` Vercel Function, so roster sync must be tested on Vercel or with the Vercel CLI (`vercel dev`).

## Production build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

Import this project/repository in Vercel. Use the Vite preset, build command `npm run build`, and output directory `dist`. Vercel will also deploy `api/players.js` as a serverless function. No API key is configured or required for the experimental public-page fetch.

## Demo notes
- Milestone tracker figures, match schedules/results, standings, and contact details remain illustrative. The Team Info roster is separate from the milestone demo data.
- Registration confirmation is simulated; no email is sent and no registration is persisted.
- WhatsApp sharing opens a prefilled message for the user to review and send.
