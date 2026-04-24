# EACC Platform

Next.js 14, TypeScript, Tailwind, googleapis

## Data Layer
- Google Sheets (7 tabs via lib/sheets.ts)
- Tabs: spots, prices, config, commodities, agents, lottery, spreads
- Exchange rates: P2P scraper (Globex/Binance) > admin override > cached

## API Routes
- `/api/dashboard` - All dashboard data, revalidate 60s
- `/api/agent/[id]` - Personal agent stats
- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/cron/daily-fix` - Daily price fix (08:00 CAT)
- `/api/cron/streak-update` - Agent streak updates
- `/api/cron/quorum-check` - Market quorum alerts
- `/api/cron/lottery-draw` - Weekly lottery (Sunday 18:00)

## Pages

### Public
- `/dashboard` - Main commodity price dashboard
- `/me` - Personal agent stats (query: ?agent=spot-firstname)
- `/leaderboard` - Weekly accuracy rankings
- `/invite` - Agent recruitment (query: ?ref=agent-id)
- `/lottery` - Weekly prize draws
- `/spread` - Cross-border trade calculator

### Admin (protected via NextAuth + Google OAuth)
- `/admin` - Overview with countdown, quorum, fix preview, moderation
- `/admin/reports` - All price reports (placeholder)
- `/admin/users` - User management (placeholder)
- `/admin/users/[phone]` - User detail (placeholder)
- `/admin/markets` - Market configuration (placeholder)
- `/admin/lottery` - Lottery management (placeholder)
- `/admin/alerts` - Alert rules (placeholder)
- `/admin/system` - System health (placeholder)

## Fonts
- Outfit: Display/numbers, weight 400-900, `font-outfit`
- Space Grotesk: UI text, weight 400-700, `font-space-grotesk`

## Visual Identity — Locked Design Tokens

### Type Scale (LOCKED)
| Role | Size | Weight | Usage |
|---|---|---|---|
| Hero number | 76px | 700 | Benchmark 322 |
| Hero currency | 34px | 700 | Benchmark RWF |
| Section number | 56px | 700 | Lean season 45 |
| Section unit | 22px | 700 | "days", "$" |
| Metric number | 44px | 700 | Cross-border $28 |
| Card title | 17px | 500 | "Best prices across the region" |
| Entity label | 15-16px | 500 | Commodity names, cities |
| Metadata | 11-12px | 500 | Labels, units, legends |

**Rules:**
- Never use weight 400 for prices
- Never use weight < 500 for any label
- Never use font-size < 11px anywhere
- Only use weight 500 or 700, nothing between

### Five Pill Categories

1. **SectionLabelPill** (uppercase small-caps)
   - Usage: BENCHMARK, LEAN SEASON ALERT, CROSS-BORDER
   - 11.5px, weight 500, uppercase, tracking 0.06em
   - padding: 7px 14px

2. **EntityPill** (sentence case)
   - Usage: 📍 Kigali city average, 🌽 Maize, 🇷🇼 Rusumo
   - 14px, weight 500
   - padding: 8px 15px

3. **ModifierPill** (date ranges, units)
   - Usage: Jul 15 – Aug 30, per MT, Cross-border
   - 11.5px, weight 500, parent color at 0.15 alpha bg
   - padding: 6px 12px

4. **CurrencyChip** (colored by currency)
   - Usage: All price displays
   - 15px, weight 700, tabular-nums
   - Currency suffix: 11px, weight 500, opacity 0.85
   - padding: 5px 12px

5. **StatusPill** (semantic meaning)
   - Success: #EAF3DE bg, #3B6D11 text
   - Warning: #FAEEDA bg, #854F0B text
   - Error: #FCEBEB bg, #A32D2D text
   - Neutral: #F1EFE8 bg, #444441 text
   - 13px, weight 600/700, padding: 6px 13px

### Currency Color System (Global Lock)
```css
--ccy-rwf-bg: #EAF3DE;  --ccy-rwf-fg: #3B6D11;  /* Rwanda green */
--ccy-ugx-bg: #E6F1FB;  --ccy-ugx-fg: #185FA5;  /* Uganda blue */
--ccy-cdf-bg: #FAEEDA;  --ccy-cdf-fg: #854F0B;  /* DRC amber */
--ccy-tzs-bg: #FBE4E4;  --ccy-tzs-fg: #8F2222;  /* Tanzania red */
--ccy-usd-bg: #F1EFE8;  --ccy-usd-fg: #444441;  /* USD neutral */
--ccy-etb-bg: #FAECE7;  --ccy-etb-fg: #4A1B0C;  /* Ethiopia reserved */
--ccy-kes-bg: #FBEAF0;  --ccy-kes-fg: #72243E;  /* Kenya reserved */
```

**Currency Rules:**
1. Never show price without currency chip
2. Goma/Bukavu use RWF (green), not CDF
3. Gold always USD (gray), never converted
4. WhatsApp: emoji flag + bold price + currency code

### Core Colors
```css
--green: #1A5C36;      /* primary */
--green-mid: #2E7D52;
--green-light: #3DAA6A;
--green-pale: #EBF7EF;
--amber: #F59E0B;      /* accent */
--amber-bg: #FFFBEB;
--orange: #F97316;
--red: #EF4444;
--ink: #111827;        /* text */
--ink2/3/4: secondary text
--border: #E5E7EB;
--surface: #F0F2F5;    /* background */
```

## Components

### Shared Pills (components/shared/Pills.tsx)
```tsx
<SectionLabelPill>BENCHMARK</SectionLabelPill>
<EntityPill icon="📍">Kigali city average</EntityPill>
<ModifierPill>Jul 15 – Aug 30</ModifierPill>
<CurrencyChip value={305} currency="RWF" />
<CurrencyChip value={350} currency="RWF" muted prefix="≈" />
<StatusPill variant="success" showDot>Profitable</StatusPill>
<ChangePill delta={2.3} />
<SpreadPill spread={12} />
```

### Public Components
- `CityCard.tsx` - City price card with all commodities
- `HeroCard.tsx` - Benchmark average (76px price, 34px currency)
- `BestPriceComparison.tsx` - Regional price comparison
- `Sidebar.tsx` - Desktop navigation
- `BottomNav.tsx` - Mobile navigation

### Admin Components (components/admin/)
- `AdminNav.tsx` - Admin sidebar
- `AdminHeader.tsx` - Admin header
- `FixCountdown.tsx` - Countdown to 08:00 CAT
- `QuorumStatus.tsx` - Market reporting health
- `FixPreviewTable.tsx` - Tomorrow's fix preview
- `PendingModeration.tsx` - Outlier reports queue

## Do Not
- Mix Title Case with sentence case — sentence case everywhere except uppercase pills
- Use raw text for any quantity, date, or entity — everything is a pill
- Create new pill categories without updating this spec
- Use color to convey meaning without also using shape or icon (colorblind safety)
- Use font-weight 600 anywhere — use 500 for medium, 700 for bold

## Environment Variables
```
# Google Sheets
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SPREADSHEET_ID=

# NextAuth (Admin)
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAILS=admin@example.com

# Cron Jobs
CRON_SECRET=
```
