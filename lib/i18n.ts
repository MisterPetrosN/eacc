// Re-export from existing i18n implementation
export { useLanguage as useTranslation, type Language as Locale, LANGUAGE_NAMES } from './i18n/LanguageContext';

// Map uppercase language codes to lowercase for TTS
export function localeToLower(locale: string): 'en' | 'rw' | 'fr' | 'sw' {
  const map: Record<string, 'en' | 'rw' | 'fr' | 'sw'> = {
    EN: 'en',
    RW: 'rw',
    FR: 'fr',
    SW: 'sw',
  };
  return map[locale] || 'rw';
}

// Commodity name mapping (for TTS and display)
export const commodityTranslations: Record<string, Record<string, string>> = {
  EN: {
    maize: 'Maize',
    beans: 'Beans',
    rice: 'Rice',
    cooking_bananas: 'Cooking bananas',
    irish_potatoes: 'Irish potatoes',
    maize_powder: 'Maize powder',
    diesel: 'Diesel',
    petrol: 'Petrol',
    soya: 'Soya',
    palm_oil: 'Palm oil',
    gold: 'Gold',
    fuel: 'Fuel',
  },
  RW: {
    maize: 'Ibigori',
    beans: 'Ibishyimbo',
    rice: 'Umuceri',
    cooking_bananas: 'Igitoki',
    irish_potatoes: 'Ibirayi',
    maize_powder: 'Ifu y\'ibigori',
    diesel: 'Mazutu',
    petrol: 'Lisansi',
    soya: 'Soya',
    palm_oil: 'Amavuta ya palme',
    gold: 'Zahabu',
    fuel: 'Lisansi',
  },
  FR: {
    maize: 'Maïs',
    beans: 'Haricots',
    rice: 'Riz',
    cooking_bananas: 'Bananes à cuire',
    irish_potatoes: 'Pommes de terre',
    maize_powder: 'Farine de maïs',
    diesel: 'Diesel',
    petrol: 'Essence',
    soya: 'Soja',
    palm_oil: 'Huile de palme',
    gold: 'Or',
    fuel: 'Carburant',
  },
  SW: {
    maize: 'Mahindi',
    beans: 'Maharage',
    rice: 'Mchele',
    cooking_bananas: 'Ndizi za kupika',
    irish_potatoes: 'Viazi',
    maize_powder: 'Unga wa mahindi',
    diesel: 'Dizeli',
    petrol: 'Petroli',
    soya: 'Soya',
    palm_oil: 'Mafuta ya mawese',
    gold: 'Dhahabu',
    fuel: 'Mafuta',
  },
};

// Get commodity name in current locale
export function getCommodityName(commodityId: string, locale: string = 'RW'): string {
  return commodityTranslations[locale]?.[commodityId] || commodityTranslations.EN[commodityId] || commodityId;
}

// TTS phrase templates for each language
export const ttsPhrases: Record<string, Record<string, string>> = {
  EN: {
    priceIntro: 'Prices for {city} today.',
    commodityPrice: '{commodity}, {price} {currency}.',
    priceUp: 'up {percent} percent',
    priceDown: 'down {percent} percent',
    unchanged: 'unchanged',
    noData: 'no data available',
    perKg: 'per kilogram',
    perLiter: 'per liter',
    kigaliAverage: 'The Kigali city average {commodity} price is {price} Rwandan Francs per {unit}.',
  },
  RW: {
    priceIntro: 'Ibiciro muri {city} uyu munsi.',
    commodityPrice: '{commodity}, {price} {currency}.',
    priceUp: 'byazamutse {percent} ku ijana',
    priceDown: 'byagabanutse {percent} ku ijana',
    unchanged: 'ntibyahindutse',
    noData: 'nta makuru ahari',
    perKg: 'kuri kiro',
    perLiter: 'kuri litiro',
    kigaliAverage: 'Ikigereranyo cy\'igiciro cya {commodity} i Kigali ni {price} Amafaranga y\'u Rwanda kuri {unit}.',
  },
  FR: {
    priceIntro: 'Prix pour {city} aujourd\'hui.',
    commodityPrice: '{commodity}, {price} {currency}.',
    priceUp: 'en hausse de {percent} pourcent',
    priceDown: 'en baisse de {percent} pourcent',
    unchanged: 'inchangé',
    noData: 'pas de données',
    perKg: 'par kilogramme',
    perLiter: 'par litre',
    kigaliAverage: 'Le prix moyen de {commodity} à Kigali est de {price} Francs Rwandais par {unit}.',
  },
  SW: {
    priceIntro: 'Bei za {city} leo.',
    commodityPrice: '{commodity}, {price} {currency}.',
    priceUp: 'imepanda asilimia {percent}',
    priceDown: 'imeshuka asilimia {percent}',
    unchanged: 'haijabadilika',
    noData: 'hakuna data',
    perKg: 'kwa kilo',
    perLiter: 'kwa lita',
    kigaliAverage: 'Bei ya wastani ya {commodity} Kigali ni {price} Faranga za Rwanda kwa {unit}.',
  },
};

// Build TTS text for a price announcement
export function buildPriceAnnouncement(
  locale: string,
  commodityId: string,
  price: number,
  currency: string,
  unit: 'kg' | 'L' = 'kg',
  cityName: string = 'Kigali'
): string {
  const phrases = ttsPhrases[locale] || ttsPhrases.RW;
  const commodityName = getCommodityName(commodityId, locale);
  const unitName = unit === 'L' ? phrases.perLiter : phrases.perKg;

  // Format price with thousands separator for speech
  const priceFormatted = Math.round(price).toLocaleString();

  if (cityName === 'Kigali') {
    return phrases.kigaliAverage
      .replace('{commodity}', commodityName)
      .replace('{price}', priceFormatted)
      .replace('{unit}', unitName.replace('kuri ', '').replace('per ', '').replace('par ', '').replace('kwa ', ''));
  }

  return phrases.commodityPrice
    .replace('{commodity}', commodityName)
    .replace('{price}', priceFormatted)
    .replace('{currency}', currency);
}
