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
  8. Payment Screen & Tender Methods (Cash `F2`, Bank Card/GCash `F3`, Gift Cert `F5`, Coupon `F6`)
  9. Knowledge Check & Certification Readiness
- **Interactive POS Terminal Simulator:**
  - Full 5-screen navigation: Main, 2nd, 3rd, 4th, and Payment screens.
  - Page-specific function key grids (50+ function assignments from the training deck).
  - Physical keyboard shortcuts (press F1-F12 directly on desktop) or touch on-screen controls on mobile/tablets.
  - F3 Quantity multiplier flow (set quantity before scan).
  - F2 Item Inquiry / Lookup with promotional price display.
  - Training-only Manager Override simulation for voids, discounts, and reprints.
  - Realistic official receipt generation with training watermarks.
- **Automated Practical Assessment:**
  - Evaluates trainee action sequences in real time against scenario SOPs.
  - Detailed mistake logging, hint count, timer, and passing threshold score computation.
  - Persistent progress saving via local storage and Supabase.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS with NBS Design Tokens
- **Icons:** Lucide React
- **Authentication:** Supabase Auth (Google OAuth) + Local Demo Mode fallback
- **State Machine:** Pure deterministic POS state machine & reducer
- **Testing:** Vitest (100% passing unit & scenario test suites)

---

## Getting Started Locally

### 1. Prerequisites
- Node.js `v18+` or `v20+` or `v22+`
- npm `v9+` or `v10+`

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

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Automated Unit Tests
```bash
npm test
```

### 6. Production Build Check
```bash
npm run build
```

---

## Security & Safety Isolation

1. **Synthetic Data Only:** All products (`NBS-BK-001`, `NBS-PEN-002`), customer loyalty cards, and barcodes are synthetic.
2. **Zero Financial Connection:** No payment gateways or live bank APIs are used. Tendering cash or card only tests the cashier calculation and change logic.
3. **Mock Manager Override:** Any password entered in training authorization dialogs is accepted for training demonstrations without storing or requiring actual company supervisor credentials.
