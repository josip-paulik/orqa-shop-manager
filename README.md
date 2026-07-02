# ORQA Shop Manager

ORQA Shop Manager is a React + TypeScript dashboard-style app for managing orders and users.

It includes:
- Authentication flow (login + guarded routes)
- Order management with create/edit/delete, status updates, and handler assignment
- User management with create/edit/delete and inline status updates
- Centralized state management with mocked async requests and throttling
- Theme switching (light/dark) via CSS variables
- Danger mode toggle for intentional request failure testing

## Software Versions

### Runtime / Tooling
- Node.js: `v24.18.0`
- npm: `11.18.0`
- Vite: `^8.1.1`
- TypeScript: `~6.0.2`
- ESLint: `^10.6.0`
- Prettier: `^3.9.4`

### Core Libraries
- React: `^19.2.7`
- React DOM: `^19.2.7`
- React Router DOM: `^7.18.1`
- Redux Toolkit: `^2.12.0`
- React Redux: `^9.3.0`
- Phosphor Icons: `^2.1.10`

## Run Locally

```bash
npm install
npm run dev
```

Useful scripts:

```bash
npm run build
npm run lint
npm run preview

npx prettier -write . ---for formating
```

## Important Behavior Notes

- `receipt` and `amount` on an order are currently fully custom and independent fields.
- This means the receipt text is not parsed to calculate the amount, and changing one does not automatically update the other.

## Danger Mode

Danger Mode is an interview/testing helper that intentionally fails requests so error handling paths can be demonstrated quickly.

- Location: top header toggle button (warning icon + label)
- When enabled: mocked requests fail intentionally and return an error state
- Scope: affects request flows across the dashboard
- Persistence: toggle value is stored in local storage and restored on refresh

Notes:
- This mode is useful to verify graceful error handling in tables, modals, and forms.
- Disable Danger Mode to resume normal request behavior.

## Most Challenging Part

The most challenging part of this project was state/store management.

I had limited previous experience with store management, so designing reusable async flows (load/create/update/delete), keeping UI state in sync, and handling loading/error behavior across pages required the most effort.

## What I Prioritized

- Reusability
- Scalability
- Theming flexibility

In practice, this means components and state logic were structured to be reused and extended, and the theme switcher was added so future brand/style changes do not require major redevelopment.

## What I Would Improve With More Time

1. Accessibility improvements
   - Font size controls
   - High contrast mode
   - Additional inclusive UX enhancements

2. More elaborate product/receipt system
   - Receipt represented as a real list of items
   - Amount calculated as a true sum from that list

3. Language switching (i18n)
   - Replace fixed text with a modern localization system
   - Make the app ready for broader user groups

4. Filtering, sorting and pagination
   - Searching by status, amount or handler
   - Sort by any relevant data
   - On table pages, update URL as filter value changes, so the filter can be easily shared and preserved
