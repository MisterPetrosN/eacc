# Isoko Prices - Google Sheet Guide

This document explains each tab in the Google Sheet and how to manage data.

**Sheet URL:** [Open Google Sheet](https://docs.google.com/spreadsheets/d/1ooSVAxYchu1racuP6D-SGK-yTLDjZi_b0hDXEbTGgXk/edit)

**Data Refresh:** Changes appear on the website within **1-2 minutes** (60s server cache + 30s client refresh).

---

## Tab Overview

| Tab | Purpose | Update Frequency |
|-----|---------|------------------|
| `spots` | Market locations | Rarely (when adding new markets) |
| `prices` | Daily price data | Daily (main data entry) |
| `commodities` | Product definitions | Rarely (when adding products) |
| `config` | App settings | As needed |
| `agents` | Reporter profiles | Weekly |
| `lottery` | Weekly draw history | Weekly (after Sunday draw) |
| `spreads` | Cross-border routes | Rarely |
| `price_fallbacks` | Auto-derive missing prices | Rarely |

---

## 1. `spots` - Market Locations

Defines all market locations tracked by the system.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | text | Yes | Unique identifier (lowercase, no spaces). Example: `kimironko`, `goma` |
| `name` | text | Yes | Display name. Example: `Kimironko`, `Goma` |
| `country` | text | Yes | Country code: `RW`, `UG`, `CD`, `XB` (cross-border) |
| `region` | text | Yes | Region/province name |
| `flag` | emoji | Yes | Country flag emoji |
| `priority` | boolean | No | `TRUE` = featured market |
| `active` | boolean | Yes | `TRUE` = shows on dashboard, `FALSE` = hidden |
| `lat` | number | No | Latitude for maps |
| `lng` | number | No | Longitude for maps |
| `notes` | text | No | Internal notes |

### Example Row
```
id: kimironko
name: Kimironko
country: RW
region: Kigali
flag: 🇷🇼
priority: TRUE
active: TRUE
lat: -1.9403
lng: 30.1217
notes: Main benchmark market
```

### Actions
- **Add new market:** Add row with unique `id`, set `active: TRUE`
- **Hide market:** Set `active: FALSE`
- **Feature market:** Set `priority: TRUE`

---

## 2. `prices` - Daily Price Data

**This is the main data entry tab.** One row per spot + commodity combination.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `spot_id` | text | Yes | Must match `id` from spots tab |
| `commodity_id` | text | Yes | Must match `id` from commodities tab |
| `price` | number | Yes | Price value (no currency symbol) |
| `currency` | text | Yes | `RWF`, `UGX`, `CDF`, `TZS`, `USD` |
| `change_pct` | number | No | Percent change from yesterday. Example: `1.5` or `-2.3` |
| `updated_at` | date | Yes | Date of price. Format: `2025-05-17` |
| `reported_by` | text | No | Agent name who reported |
| `status` | text | Yes | `live`, `pending`, or `stale` |

### Example Row
```
spot_id: kimironko
commodity_id: maize
price: 500
currency: RWF
change_pct: 1.2
updated_at: 2025-05-17
reported_by: Ted
status: live
```

### Daily Workflow
1. Add new rows for today's prices
2. Set `updated_at` to today's date
3. Calculate `change_pct` from yesterday's price: `((today - yesterday) / yesterday) * 100`
4. Set `status: pending` initially, change to `live` after verification

### Tips
- Keep historical data (don't delete old rows)
- The system uses the **latest row** for each spot+commodity
- Missing prices show as "—" on dashboard

---

## 3. `commodities` - Product Definitions

Defines which commodities are tracked.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | text | Yes | Unique identifier (lowercase, underscores OK). Example: `maize`, `irish_potatoes` |
| `name` | text | Yes | Display name |
| `icon` | emoji | Yes | Emoji icon for the commodity |
| `status` | text | Yes | `live` = active, `coming` = coming soon (blurred) |
| `launch_note` | text | No | Note shown for "coming soon" items |
| `tab_order` | number | Yes | Sort order in filter pills (0, 1, 2...) |

### Current Commodities
| ID | Name | Icon | Status |
|----|------|------|--------|
| `maize` | Maize | 🌽 | live |
| `beans` | Beans | 🫘 | live |
| `rice` | Rice | 🍚 | live |
| `cooking_bananas` | Igitoki | 🍌 | live |
| `irish_potatoes` | Potatoes | 🥔 | live |
| `maize_powder` | Maize Powder | 🌾 | live |
| `diesel` | Diesel | 🚛 | live |
| `petrol` | Petrol | 🏍️ | live |

### Actions
- **Add new commodity:** Add row, set `status: coming` first, then `live` when ready
- **Hide commodity:** Set `status: coming` (shows blurred)
- **Reorder pills:** Change `tab_order` values

---

## 4. `config` - App Settings

Key-value configuration for the entire app.

### Format
| Column | Description |
|--------|-------------|
| `key` | Setting name |
| `value` | Setting value |

### Available Settings

#### Display Settings
| Key | Example | Description |
|-----|---------|-------------|
| `greeting` | `Mwaramutse` | Custom greeting override |
| `lean_season_days` | `45` | Days until lean season ends |
| `lean_season_window` | `Jul 15 – Aug 30` | Lean season date range text |

#### Price Fluctuation (Live Animation)
| Key | Example | Description |
|-----|---------|-------------|
| `fluctuation_enabled` | `TRUE` | Enable ±2% price animations |
| `fluctuation_pct` | `2` | Max fluctuation percentage |
| `fluctuation_interval_sec` | `30` | Seconds between fluctuations |

#### Exchange Rates
| Key | Example | Description |
|-----|---------|-------------|
| `rwf_rate` | `1280` | RWF per 1 USD (overrides API) |
| `ugx_rate` | `3700` | UGX per 1 USD (overrides API) |
| `use_live_exchange_rates` | `TRUE` | Use live API rates if sheet rates not set |

#### Hero Card Changes
| Key | Example | Description |
|-----|---------|-------------|
| `hero_change_maize` | `2.3` | Percent change shown on maize hero |
| `hero_change_beans` | `-1.5` | Percent change shown on beans hero |
| `hero_change_rice` | `0.8` | Percent change shown on rice hero |

#### Cross-Border
| Key | Example | Description |
|-----|---------|-------------|
| `spread_usd` | `28` | Current spread in USD/MT |
| `spread_status` | `profitable` | `profitable` or `watch` |

#### Lottery
| Key | Example | Description |
|-----|---------|-------------|
| `weekly_jackpot_usd` | `15` | Base jackpot amount |
| `ticket_value_usd` | `0.50` | Value per ticket |
| `reports_per_ticket` | `3` | Reports needed for 1 ticket |

#### Agent Accuracy
| Key | Example | Description |
|-----|---------|-------------|
| `accuracy_threshold_good` | `90` | Green badge threshold |
| `accuracy_threshold_review` | `70` | Yellow badge threshold |

#### WhatsApp
| Key | Example | Description |
|-----|---------|-------------|
| `twilio_number` | `250788000000` | WhatsApp number for JOIN messages |

---

## 5. `agents` - Reporter Profiles

Tracks field agents who report prices.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | text | Yes | Full name |
| `phone` | text | Yes | Phone number (with country code) |
| `spot_id` | text | Yes | Primary market assignment |
| `active` | boolean | Yes | `TRUE` = active reporter |
| `streak` | number | No | Consecutive days reported |
| `tickets_month` | number | No | Lottery tickets this month |
| `accuracy_pct` | number | No | Accuracy percentage (0-100) |
| `notes` | text | No | Internal notes |

### Actions
- **Add agent:** Add row with phone and spot assignment
- **Deactivate agent:** Set `active: FALSE`
- **Update stats:** Modify `streak`, `tickets_month`, `accuracy_pct` weekly

---

## 6. `lottery` - Weekly Draw History

Records weekly lottery draws.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `week_start` | date | Yes | Monday of the week |
| `winner_name` | text | Yes | Winner's name |
| `winner_spot` | text | Yes | Winner's market |
| `prize_usd` | number | Yes | Prize amount |
| `total_entries` | number | Yes | Total tickets in draw |
| `gold_bonus` | boolean | No | `TRUE` if gold bonus was active |
| `drawn_at` | datetime | No | When draw occurred |
| `paid_at` | datetime | No | When payment was sent |
| `notes` | text | No | Internal notes |

### Weekly Workflow
1. After Sunday 6pm draw, add new row
2. Fill winner details
3. Set `drawn_at` timestamp
4. After payment, set `paid_at` timestamp

---

## 7. `spreads` - Cross-Border Routes

Defines arbitrage routes for the spread calculator.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | text | Yes | Unique route ID |
| `route_name` | text | Yes | Display name. Example: `Uganda → Rwanda` |
| `buy_spot_id` | text | Yes | Source market ID |
| `sell_spot_id` | text | Yes | Destination market ID |
| `freight_default` | number | Yes | Default freight cost ($/MT) |
| `phyto_default` | number | Yes | Phytosanitary certificate cost |
| `customs_default` | number | Yes | Customs/duty cost |
| `agent_fee_default` | number | Yes | Agent/broker fee |
| `contingency_default` | number | Yes | Buffer for unexpected costs |
| `status` | text | Yes | `active` or `inactive` |
| `notes` | text | No | Internal notes |

---

## 8. `price_fallbacks` - Auto-Derive Missing Prices

Automatically generates prices for markets without direct reports.

### Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `source_spot` | text | Yes | Market to copy from |
| `target_spot` | text | Yes | Market to generate price for |
| `min_pct` | number | Yes | Minimum % offset. Example: `-5` |
| `max_pct` | number | Yes | Maximum % offset. Example: `5` |

### Example
```
source_spot: kimironko
target_spot: remera
min_pct: -3
max_pct: 3
```
This means: If `remera` has no price, derive it from `kimironko` with ±3% random offset.

---

## Common Tasks

### Add a New Market
1. Add row to `spots` tab with unique `id`
2. Set `active: TRUE`
3. Add price rows to `prices` tab
4. (Optional) Add to `price_fallbacks` if you want auto-derived prices

### Add a New Commodity
1. Add row to `commodities` tab
2. Set `status: coming` initially
3. Set `tab_order` for position in filter
4. Add price rows to `prices` tab
5. Change `status: live` when ready

### Update Daily Prices
1. Add new rows to `prices` tab for today
2. Set `updated_at` to today's date
3. Calculate and enter `change_pct`
4. Set `status: live`

### Run Weekly Lottery
1. Count tickets from `agents` tab (`tickets_month`)
2. Run random draw
3. Add winner to `lottery` tab
4. Reset `tickets_month` to 0 for all agents

### Adjust Exchange Rates
1. Go to `config` tab
2. Set `rwf_rate` and `ugx_rate` values
3. Or set `use_live_exchange_rates: FALSE` to use only sheet rates

---

## Troubleshooting

### Prices not showing
- Check `spot_id` matches exactly (case-sensitive)
- Check `commodity_id` matches exactly
- Check commodity `status` is `live`
- Check spot `active` is `TRUE`

### Market not appearing
- Check `active: TRUE` in spots tab
- Check the market ID is in the dashboard code's `cityConfigs`

### Exchange rates wrong
- Check `rwf_rate` and `ugx_rate` in config
- Values should be "units per 1 USD" (e.g., 1280 for RWF)

### Data seems stale
- Wait 1-2 minutes for cache to refresh
- Hard refresh browser (Cmd+Shift+R)

---

## Support

For technical issues, check the repository: https://github.com/MisterPetrosN/eacc
