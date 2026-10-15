# TSK — Tokyo Star Kings Cricket Club Portal

A responsive React + Vite + Tailwind CSS demo portal with Lucide icons and a navy/gold sports identity.

## Features
- Club overview, motto and objectives
- Searchable squad cards with mock stats
- Availability form with email validation and WhatsApp `wa.me` message sharing
- 20-over / 40-over milestone tracking, editable demo totals, near-milestone analysis and copy/WhatsApp broadcast
- Season archives filtered by format and year, with schedule, results and points table tabs
- Club contact cards
- Player registration with simulated confirmation

## Run locally
Requirements: Node.js 18+

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Production build
```bash
npm run build
npm run preview
```

## Important demo notes
- All player, match, standings and contact data are illustrative. Replace them with official club data before publishing.
- The registration confirmation is simulated in the browser. No email is actually sent and no data is persisted.
- To send real notifications, connect a backend/API and an email provider; never put private email credentials in frontend code.
- WhatsApp sharing opens a prefilled message for the user to review and send. The app does not send messages automatically.
- Player cards use stylized initials instead of fabricated headshots. Swap in licensed club photos if available.
