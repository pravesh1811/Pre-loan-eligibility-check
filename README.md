# DhanBazaar

A browser-only loan preeligibility app built with React, Vite, Tailwind CSS and TypeScript. Built by : Pravesh Dhavale.

## Development

Use Node.js 20.19+ (or 22+). From this repository:

```sh
npm ci
npm run dev -- --port 5173
```

```sh
npm test
npm run build
npm run preview -- --port 4173
```

The three screens collect basic details, income and loan requirements, then show eligibility. Form details are saved under `dhanbazaar-v1` in browser localStorage; start a new check clears them. No backend, credentials, or external API is required. Avoid entering real personal information on a shared browser.

All Phase 1 rules are in `src/rules/policyEngine.ts`. Bureau scores are randomly simulated from 300 to 900 on each eligibility check and never fetched from a credit bureau. The maximum is rounded down to whole rupees. Tenure is in months, salary and existing EMIs are monthly, and amounts are in INR. Name accepts ASCII letters and spaces between words. Mobile and pincode require 10 and 6 digits respectively with a nonzero first digit.

This estimate is illustrative, not an actual loan offer. The CI runs policy tests and builds the app. GitHub Pages deployment requires enabling GitHub Actions write access and Pages for the `gh-pages` branch in repository settings.
