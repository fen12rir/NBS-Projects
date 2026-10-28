# National Book Store (NBS) — POS Training Platform & Simulator

An official employee learning management web application combining structured POS cashier curriculum with a high-fidelity, safe practical POS terminal simulator. Built from the approved 120-slide **POS Cashier's Newbie Training Deck**.

---

## Features

- **NBS-Inspired Visual Portal:** Styled with National Book Store's retail aesthetic (NBS Official Red `#E4002B`, Montserrat typography, sharp editorial lines, clear navigation).
- **Safe Training Sandbox:** Isolated from live inventory, sales, or banking networks. All items, barcodes, loyalty numbers, and payments are synthetic.
- **Local Demo Mode:** Automatically enabled when Supabase environment variables are absent. Clearly marked with warning banners so it is never mistaken for a live authenticated session.
- **9 Core Training Modules:**
  1. POS Basics & 12 Screen Regions
  2. Start of Day, Login, and Logout (`CTRL+ALT+C`, `F5`, `F8`)
  3. Item Lookup & Customer Loyalty (`F2`, `F3`, LNC, LNQR)
  4. Main-Page Keys & Transaction Basics (Quantity `F3`, Item Void `F7`, Trx Void `F8`, Suspend `F9`)
  5. Second-Page Functions & Discounts (Senior/PWD `F6`, Recall `F7`, Reprint `F2`)
  6. Third-Page Functions & Readings (Cashier `Y` Reading `F8`, Terminal `Z` Reading `F9`, `SDV` `F10`)
  7. Fourth-Page Functions & Exceptions (`TRX Comment` `F3`, Zero-Rated `F7`, Return `F8`, Refund `F10`)
  8. Payment Screen & Tender Methods (Cash `F2`, Bank Card/GCash/Maya `F3`, Gift Cert `F5`, Coupon `F6`, LNQR Sulit Coins)
  9. Knowledge Check & Certification Readiness
- **Interactive POS Terminal Simulator:**
  - Full 5-screen navigation: Main, 2nd, 3rd, 4th, and Payment screens.
  - Page-specific function key grids (50+ function assignments from the training deck).
  - Physical keyboard shortcuts (press F1-F12 directly on desktop) or touch on-screen controls on mobile/tablets.
  - F3 Quantity multiplier flow (set quantity before scan).
  - F2 Item Inquiry / Lookup with search and promotional price display.
  - Contextual button guards (Payment, Item Void `F7`, Trx Void `F8`, and Suspend `F9` automatically disable and gray out when no items are scanned).
  - Cash drawer simulation (drawers pop open on cash transactions and exact amount tenders).
  - Comprehensive Payment & Loyalty Flows:
    - Cash tender with automatic dynamic change calculation.
    - LNQR Sulit Coins redemption, split payment tender, and earned Sulit Coins notification.
    - Terminal receipt generation for BDO / Credit Cards, GCash, and Maya.
    - Dedicated TRX Comment screen, Zero-Rated VAT processing, Returns, and Refunds.
  - Realistic official receipts with training watermarks and detailed breakdown of tenders and reference numbers.
- **Automated Practical Assessment:**
  - Evaluates trainee action sequences in real time against scenario SOPs.
  - Detailed mistake logging, hint count, timer, and passing threshold score computation.
  - Persistent progress saving via local storage and Supabase.

---

## Tech Stack

- **Framework:** Next.js `14.2.35` (App Router)
- **Runtime:** Node.js `v18.17+`, `v20+`, or `v22+` (Tested on `v22.19.0`)
- **Language:** TypeScript `5.7.3` (Strict mode, ES2017 target)
- **Styling:** Tailwind CSS `3.4.17` with PostCSS & NBS Design Tokens
- **Icons:** Lucide React (`0.475.0`)
- **Authentication:** Supabase Auth (Google OAuth) + Local Demo Mode fallback
- **State Machine:** Pure deterministic POS state machine & reducer
- **Validation:** Zod (`3.24.2`)
- **Testing:** Vitest (`3.0.6`) with `@vitejs/plugin-react`
- **Linting:** ESLint with `eslint-config-next` (`next/core-web-vitals`)

---

## Getting Started Locally

### 1. Prerequisites
- **Node.js:** `v18.17.0+` (Node `v20.x` or `v22.x` recommended, tested on `v22.19.0`)
- **npm:** `v9+` or `v10+`

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*Note: If no Supabase credentials are provided, the system boots into **Local Demo Mode** automatically.*

### 4. Available Scripts

| Command | Description | Default Port / URL |
| :--- | :--- | :--- |
| `npm run dev` | Starts local Next.js development server | `http://localhost:3000` |
| `npm run dev:turbo` | Starts development server with Turbopack | `http://localhost:3000` |
| `npm run build` | Compiles production build and optimizes routes | — |
| `npm run start` | Serves compiled production build | `http://localhost:3000` |
| `npm run lint` | Runs Next.js ESLint validation | — |
| `npm test` | Runs automated unit and scenario test suites | — |
| `npm run test:watch` | Runs Vitest in interactive watch mode | — |

---

## Security & Safety Isolation

1. **Synthetic Data Only:** All products (`NBS-BK-001`, `NBS-PEN-002`), customer loyalty cards, and barcodes are synthetic.
2. **Zero Financial Connection:** No payment gateways or live bank APIs are used. Tendering cash or card only tests the cashier calculation and change logic.
3. **Mock Manager Override:** Any password entered in training authorization dialogs is accepted for training demonstrations without storing or requiring actual company supervisor credentials.
