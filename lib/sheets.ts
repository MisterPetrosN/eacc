import { google } from 'googleapis';
import { unstable_cache } from 'next/cache';

// Initialize Google Sheets API
function getAuth() {
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !privateKey) {
    throw new Error('Missing Google Sheets credentials');
  }

  return new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

// Fetch a sheet tab and return as array of objects
async function fetchSheetTab(tabName: string): Promise<Record<string, string>[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error('Missing GOOGLE_SPREADSHEET_ID');
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: tabName,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  const headers = rows[0] as string[];
  const data: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj: Record<string, string> = {};

    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });

    data.push(obj);
  }

  return data;
}

// Cached version with 60 second revalidation
export const getSheetTab = unstable_cache(
  async (tabName: string) => {
    return fetchSheetTab(tabName);
  },
  ['sheet-tab'],
  { revalidate: 60 }
);

// Fetch live exchange rates from API
async function fetchLiveExchangeRates(): Promise<{ ugx_to_usd: number; rwf_to_usd: number } | null> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();

    if (data.rates?.UGX && data.rates?.RWF) {
      return {
        ugx_to_usd: 1 / data.rates.UGX,
        rwf_to_usd: 1 / data.rates.RWF,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Default fallback rates
const DEFAULT_RATES = {
  ugx_to_usd: 1 / 3700,
  rwf_to_usd: 1 / 1280,
};

// Exchange rate fetching with priority:
// 1. Google Sheet config (if ugx_rate and rwf_rate are set)
// 2. Live API
// 3. Hardcoded defaults
async function fetchExchangeRates(): Promise<{
  ugx_to_usd: number;
  rwf_to_usd: number;
  source: 'sheet' | 'api' | 'default';
}> {
  try {
    // First, try to get rates from the config sheet
    const configRows = await fetchSheetTab('config');
    const config: Record<string, string> = {};
    configRows.forEach((row) => {
      if (row.key) {
        config[row.key] = row.value || '';
      }
    });

    // Check if sheet has exchange rates defined
    const sheetUgxRate = parseFloat(config.ugx_rate || config.ugx_to_usd || '');
    const sheetRwfRate = parseFloat(config.rwf_rate || config.rwf_to_usd || '');

    if (!isNaN(sheetUgxRate) && !isNaN(sheetRwfRate) && sheetUgxRate > 0 && sheetRwfRate > 0) {
      // Sheet has valid rates - use them
      // If rates are given as "3700" (units per USD), convert to "per USD"
      // If rates are given as "0.00027" (USD per unit), use directly
      const ugxToUsd = sheetUgxRate > 1 ? 1 / sheetUgxRate : sheetUgxRate;
      const rwfToUsd = sheetRwfRate > 1 ? 1 / sheetRwfRate : sheetRwfRate;

      return {
        ugx_to_usd: ugxToUsd,
        rwf_to_usd: rwfToUsd,
        source: 'sheet',
      };
    }

    // Check if live API is enabled (default: true)
    const useLiveApi = config.use_live_exchange_rates !== 'false';

    if (useLiveApi) {
      // Try live API
      const liveRates = await fetchLiveExchangeRates();
      if (liveRates) {
        return {
          ...liveRates,
          source: 'api',
        };
      }
    }

    // Fallback to defaults
    return {
      ...DEFAULT_RATES,
      source: 'default',
    };
  } catch {
    // On any error, return defaults
    return {
      ...DEFAULT_RATES,
      source: 'default',
    };
  }
}

export const getExchangeRates = unstable_cache(
  fetchExchangeRates,
  ['exchange-rates'],
  { revalidate: 300 } // Cache for 5 minutes
);
