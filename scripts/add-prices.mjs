import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars manually
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1].trim()] = value;
  }
});

const auth = new google.auth.JWT({
  email: env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = env.GOOGLE_SPREADSHEET_ID;

const today = new Date().toISOString().split('T')[0];

// Price data to add
const priceRows = [
  ['huye', 'beans', '950', 'RWF', '', today, '', 'live'],
  ['huye', 'potatoes', '600', 'RWF', '', today, '', 'live'],
  ['huye', 'cooking_banana', '500', 'RWF', '', today, '', 'live'],
  ['huye', 'maize_flour', '850', 'RWF', '', today, '', 'live'],
  ['huye', 'rice', '1040', 'RWF', '', today, '', 'live'],
  ['musanze', 'beans', '1000', 'RWF', '', today, '', 'live'],
  ['musanze', 'potatoes', '500', 'RWF', '', today, '', 'live'],
  ['musanze', 'cooking_potatoes', '470', 'RWF', '', today, '', 'live'],
  ['musanze', 'maize_grains', '550', 'RWF', '', today, '', 'live'],
  ['musanze', 'maize_flour', '950', 'RWF', '', today, '', 'live'],
  ['musanze', 'rice', '1400', 'RWF', '', today, '', 'live'],
  ['goma', 'beans', '1100', 'RWF', '', today, '', 'live'],
  ['goma', 'potatoes', '600', 'RWF', '', today, '', 'live'],
  ['goma', 'cooking_banana', '550', 'RWF', '', today, '', 'live'],
  ['goma', 'maize_grains', '600', 'RWF', '', today, '', 'live'],
  ['goma', 'maize_flour', '1200', 'RWF', '', today, '', 'live'],
  ['goma', 'rice', '1700', 'RWF', '', today, '', 'live'],
  ['rubavu', 'beans', '800', 'RWF', '', today, '', 'live'],
  ['rubavu', 'potatoes', '500', 'RWF', '', today, '', 'live'],
  ['rubavu', 'cooking_banana', '500', 'RWF', '', today, '', 'live'],
  ['rubavu', 'maize_grains', '550', 'RWF', '', today, '', 'live'],
  ['rubavu', 'maize_flour', '1200', 'RWF', '', today, '', 'live'],
  ['rubavu', 'rice', '1400', 'RWF', '', today, '', 'live'],
];

// Commodity data to add
const commodityRows = [
  ['potatoes', 'Potatoes', '🥔', 'live', '', '10'],
  ['cooking_banana', 'Cooking Banana', '🍌', 'live', '', '11'],
  ['cooking_potatoes', 'Cooking Potatoes', '🥔', 'live', '', '12'],
  ['maize_grains', 'Maize Grains', '🌽', 'live', '', '13'],
  ['maize_flour', 'Maize Flour', '🌽', 'live', '', '14'],
];

async function main() {
  console.log('Adding commodities...');
  const commoditiesRes = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'commodities',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: commodityRows },
  });
  console.log(`Added ${commoditiesRes.data.updates?.updatedRows || 0} commodity rows`);

  console.log('Adding prices...');
  const pricesRes = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'prices',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: priceRows },
  });
  console.log(`Added ${pricesRes.data.updates?.updatedRows || 0} price rows`);

  console.log('Done!');
}

main().catch(console.error);
