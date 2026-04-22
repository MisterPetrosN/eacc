# EACC - East African Commodities Company

A live commodity price intelligence platform with agent gamification, personal stats, leaderboard, and referral system. All data is read from Google Sheets - no database needed.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data**: Google Sheets via googleapis
- **Fonts**: Outfit (display) + Space Grotesk (UI)
- **Icons**: Lucide React
- **Deploy**: Vercel

## Features

- **Dashboard**: Live commodity prices from multiple markets
- **My Stats**: Personal agent statistics and progress tracking
- **Leaderboard**: Weekly rankings by accuracy
- **Lottery**: Weekly prize draws based on ticket entries
- **Spread Calculator**: Cross-border trade profitability calculator
- **Invite**: Referral system for agent recruitment

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd eacc
npm install
```

### 2. Set Up Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Google Sheets API**:
   - Go to APIs & Services > Library
   - Search for "Google Sheets API"
   - Click Enable
4. Create a Service Account:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "Service Account"
   - Name it (e.g., "eacc-sheets-reader")
   - Click Create (no special permissions needed)
5. Create a Key:
   - Click on your new service account
   - Go to Keys > Add Key > Create new key
   - Choose JSON format
   - Download and save securely

### 3. Set Up Google Sheets

1. Create a new Google Spreadsheet
2. Create 7 tabs with these exact names:
   - `spots`
   - `prices`
   - `config`
   - `commodities`
   - `agents`
   - `lottery`
   - `spreads`
3. Import the sample data from `sample-data/` folder:
   - Open each tab
   - File > Import > Upload
   - Select the corresponding CSV
   - Choose "Replace current sheet"
4. Share the spreadsheet:
   - Click Share
   - Add the service account email (from the JSON key file)
   - Give "Viewer" access

### 4. Configure Environment Variables

Copy the example env file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-from-url
```

The spreadsheet ID is the long string in your Google Sheets URL:
`https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Google Sheets Structure

### spots
| Column | Type | Description |
|--------|------|-------------|
| id | string | Unique spot identifier (e.g., "kimironko") |
| name | string | Display name |
| country | string | Country code: RW, UG, CD, XB |
| region | string | Region name |
| flag | string | Flag emoji |
| priority | boolean | Show prominently |
| active | boolean | Currently active |
| lat | string | Latitude |
| lng | string | Longitude |
| notes | string | Internal notes |

### prices
| Column | Type | Description |
|--------|------|-------------|
| spot_id | string | References spots.id |
| maize_rwf | number | Maize price in RWF/kg |
| beans_rwf | number | Beans price in RWF/kg |
| soya_rwf | number | Soya price in RWF/kg |
| rice_rwf | number | Rice price in RWF/kg |
| palm_oil_rwf | number | Palm oil price in RWF/kg |
| gold_usd | number | Gold price in USD/oz |
| updated_at | datetime | ISO timestamp |
| reported_by | string | Agent name |
| change_pct | number | Price change percentage |
| status | string | live, pending, or stale |

### config
| Column | Type | Description |
|--------|------|-------------|
| key | string | Configuration key |
| value | string | Configuration value |

Key config values:
- `greeting`: Dashboard greeting text
- `weekly_jackpot_usd`: Base prize amount
- `lean_season_days`: Days until lean season
- `spread_usd`: Current spread value
- `hero_change_maize`: Maize price change %
- `reports_per_ticket`: Reports needed per ticket
- `ugx_rate`: UGX per USD rate (e.g., 3700). If set, overrides live API
- `rwf_rate`: RWF per USD rate (e.g., 1280). If set, overrides live API
- `use_live_exchange_rates`: Set to "false" to disable live API fallback (default: true)

**Exchange Rate Priority:**
1. Google Sheet (`ugx_rate` and `rwf_rate` in config tab)
2. Live API (exchangerate-api.com)
3. Hardcoded defaults (3700 UGX, 1280 RWF)

### commodities
| Column | Type | Description |
|--------|------|-------------|
| id | string | Commodity identifier |
| name | string | Display name |
| icon | string | Emoji icon |
| status | string | live or coming |
| launch_note | string | Note for coming soon items |
| tab_order | number | Display order |

### agents
| Column | Type | Description |
|--------|------|-------------|
| name | string | Agent full name |
| phone | string | Phone number |
| spot_id | string | References spots.id |
| active | boolean | Currently active |
| streak | number | Current reporting streak |
| tickets_month | number | Tickets earned this month |
| accuracy_pct | number | Accuracy percentage |
| notes | string | Internal notes |

### lottery
| Column | Type | Description |
|--------|------|-------------|
| week_start | date | Week start date |
| winner_name | string | Winner's name |
| winner_spot | string | Winner's spot |
| prize_usd | number | Prize amount |
| total_entries | number | Total tickets that week |
| gold_bonus | boolean | Gold bonus active |
| drawn_at | datetime | Draw timestamp |
| paid_at | datetime | Payment timestamp |
| notes | string | Internal notes |

### spreads
| Column | Type | Description |
|--------|------|-------------|
| id | string | Spread route identifier |
| route_name | string | Display name |
| buy_spot_id | string | Buy location spot_id |
| sell_spot_id | string | Sell location spot_id |
| freight_default | number | Default freight cost |
| phyto_default | number | Default phyto cost |
| customs_default | number | Default customs cost |
| agent_fee_default | number | Default agent fee |
| contingency_default | number | Default contingency |
| status | string | active or inactive |
| notes | string | Internal notes |

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in project settings
5. Deploy

```bash
# Or use Vercel CLI
vercel --prod
```

## API Endpoints

- `GET /api/dashboard` - All dashboard data
- `GET /api/agent/[id]` - Agent personal stats

## Audio Features

The app uses the Web Speech API for text-to-speech. Click any speaker icon to hear prices read aloud.

## License

Proprietary - East African Commodities Company
