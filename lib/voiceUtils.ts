// Voice utilities for reading prices aloud using Web Speech API

export type SupportedLanguage = 'en' | 'rw' | 'sw' | 'lg';

interface PriceData {
  value: number | null;
  change: number | null;
  unit?: string;
}

interface CityPrices {
  maize?: PriceData;
  beans?: PriceData;
  soya?: PriceData;
  rice?: PriceData;
  palm_oil?: PriceData;
  fuel?: PriceData;
  gold?: PriceData;
}

const commodityNames: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    maize: 'Maize',
    beans: 'Beans',
    soya: 'Soya',
    rice: 'Rice',
    palm_oil: 'Palm oil',
    fuel: 'Fuel',
    gold: 'Gold',
  },
  rw: {
    maize: 'Ibigori',
    beans: 'Ibishyimbo',
    soya: 'Soya',
    rice: 'Umuceri',
    palm_oil: 'Amavuta ya palme',
    fuel: 'Lisansi',
    gold: 'Zahabu',
  },
  sw: {
    maize: 'Mahindi',
    beans: 'Maharage',
    soya: 'Soya',
    rice: 'Mchele',
    palm_oil: 'Mafuta ya mawese',
    fuel: 'Mafuta',
    gold: 'Dhahabu',
  },
  lg: {
    maize: 'Kasooli',
    beans: 'Ebijanjaalo',
    soya: 'Soya',
    rice: 'Omuceere',
    palm_oil: 'Amafuta ga palmu',
    fuel: 'Amafuta',
    gold: 'Zaabu',
  },
};

const phrases: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    intro: 'Prices for {city} today.',
    up: 'up {percent} percent',
    down: 'down {percent} percent',
    unchanged: 'unchanged',
    noData: 'no data',
    perGram: 'per gram',
  },
  rw: {
    intro: 'Ibiciro muri {city} uyu munsi.',
    up: 'byazamutse {percent} ku ijana',
    down: 'byagabanutse {percent} ku ijana',
    unchanged: 'ntibyahindutse',
    noData: 'nta makuru',
    perGram: 'kuri garamu',
  },
  sw: {
    intro: 'Bei za {city} leo.',
    up: 'imepanda asilimia {percent}',
    down: 'imeshuka asilimia {percent}',
    unchanged: 'haijabadilika',
    noData: 'hakuna data',
    perGram: 'kwa gramu',
  },
  lg: {
    intro: 'Emiwendo mu {city} leero.',
    up: 'eyaze {percent} ku kikumi',
    down: 'ekendeeze {percent} ku kikumi',
    unchanged: 'tekyuuse',
    noData: 'tewali data',
    perGram: 'buli garamu',
  },
};

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakPrices(
  cityName: string,
  prices: CityPrices,
  currency: string,
  lang: SupportedLanguage = 'en'
): void {
  if (!isSpeechSupported()) {
    console.log(`[Voice] Speech not supported. Would read prices for ${cityName}`);
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const langPhrases = phrases[lang] || phrases.en;
  const langCommodities = commodityNames[lang] || commodityNames.en;

  // Build the speech text
  let text = langPhrases.intro.replace('{city}', cityName) + ' ';

  const commodityOrder = ['maize', 'beans', 'soya', 'rice', 'palm_oil', 'fuel', 'gold'];

  for (const commodity of commodityOrder) {
    const price = prices[commodity as keyof CityPrices];
    if (!price || price.value === null) continue;

    const name = langCommodities[commodity] || commodity;
    const value = price.value;
    const change = price.change;
    const isGold = commodity === 'gold';

    text += `${name}, ${value} ${isGold ? 'dollars' : currency}`;

    if (isGold) {
      text += ` ${langPhrases.perGram}`;
    }

    if (change !== null && change !== 0) {
      const changeText = change > 0
        ? langPhrases.up.replace('{percent}', Math.abs(change).toFixed(1))
        : langPhrases.down.replace('{percent}', Math.abs(change).toFixed(1));
      text += `, ${changeText}`;
    }

    text += '. ';
  }

  // Create and speak the utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Set language code for better pronunciation
  const langCodes: Record<SupportedLanguage, string> = {
    en: 'en-US',
    rw: 'rw-RW', // May fall back to default
    sw: 'sw-KE',
    lg: 'lg-UG', // May fall back to default
  };

  utterance.lang = langCodes[lang] || 'en-US';
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if (!isSpeechSupported()) return false;
  return window.speechSynthesis.speaking;
}

// Play a small beep for audio feedback
export function playTapSound(): void {
  if (typeof window === 'undefined') return;

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Silent fail - audio feedback is nice-to-have
    console.log('[Voice] Could not play tap sound');
  }
}
