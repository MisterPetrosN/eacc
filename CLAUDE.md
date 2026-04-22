# EACC Platform

Next.js 14, TypeScript, Tailwind, googleapis

## Data Layer
- Google Sheets (7 tabs via lib/sheets.ts)
- Tabs: spots, prices, config, commodities, agents, lottery, spreads
- Exchange rates from live API (exchangerate-api.com)

## API Routes
- `/api/dashboard` - All dashboard data, revalidate 60s
- `/api/agent/[id]` - Personal agent stats

## Pages
- `/dashboard` - Main commodity price dashboard
- `/me` - Personal agent stats (query: ?agent=spot-firstname)
- `/leaderboard` - Weekly accuracy rankings
- `/invite` - Agent recruitment (query: ?ref=agent-id)
- `/lottery` - Weekly prize draws
- `/spread` - Cross-border trade calculator

## Fonts
- Outfit: Display/numbers, weight 400-900, `font-outfit`
- Space Grotesk: UI text, weight 400-700, `font-space-grotesk`

## Design System (CSS variables in globals.css)
- `--green`: #1A5C36 (primary)
- `--green-mid`: #2E7D52
- `--green-light`: #3DAA6A
- `--green-pale`: #EBF7EF
- `--amber`: #F59E0B (accent)
- `--amber-bg`: #FFFBEB
- `--orange`: #F97316
- `--red`: #EF4444
- `--ink`: #111827 (text)
- `--ink2/3/4`: Secondary text colors
- `--border`: #E5E7EB
- `--surface`: #F0F2F5 (background)

## Key Patterns
- All data from Google Sheets, cached 60s (unstable_cache)
- Client-side auto-refresh every 60s (setInterval)
- Text-to-speech via Web Speech API (hooks/useSpeech.ts)
- Lucide React for icons
- Price display: `font-outfit font-black price-display` class

## Components
- `Sidebar.tsx` - Desktop navigation (68px fixed left)
- `BottomNav.tsx` - Mobile navigation (fixed bottom)
- `SpotCard.tsx` - Individual market price card
- `HeroCard.tsx` - Benchmark average display
- `Skeleton.tsx` - Loading state components

## Environment Variables
```
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SPREADSHEET_ID=
```
