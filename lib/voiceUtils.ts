// Voice utilities for reading prices aloud using Hugging Face Kinyarwanda TTS
// Falls back to Web Speech API for non-Kinyarwanda languages

import {
  type Locale,
  localeToLower,
  getCommodityName,
  buildPriceAnnouncement,
  ttsPhrases
} from './i18n';

export type SupportedLanguage = Locale;

interface PriceData {
  value: number | null;
  change: number | null;
  unit?: string;
}

interface CityPrices {
  maize?: PriceData;
  beans?: PriceData;
  rice?: PriceData;
  cooking_bananas?: PriceData;
  irish_potatoes?: PriceData;
  maize_powder?: PriceData;
  diesel?: PriceData;
  petrol?: PriceData;
  soya?: PriceData;
  palm_oil?: PriceData;
  fuel?: PriceData;
  gold?: PriceData;
}

// Track current audio playback
let currentAudio: HTMLAudioElement | null = null;
let isCurrentlySpeaking = false;

// Check if we're in browser
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// Check if Web Speech API is available (fallback for non-Kinyarwanda)
export function isSpeechSupported(): boolean {
  return isBrowser() && 'speechSynthesis' in window;
}

// Stop any ongoing speech
export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  isCurrentlySpeaking = false;

  // Also stop Web Speech API if it's running
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

// Check if currently speaking
export function isSpeaking(): boolean {
  return isCurrentlySpeaking;
}

// Speak text using Hugging Face Kinyarwanda TTS
async function speakWithHuggingFace(text: string): Promise<void> {
  if (!isBrowser()) return;

  try {
    isCurrentlySpeaking = true;

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.warn('[Voice] TTS API error:', error.error);

      // If model is loading, retry after delay
      if (response.status === 503) {
        console.log('[Voice] Model loading, retrying in 3s...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        return speakWithHuggingFace(text);
      }

      throw new Error(error.error || 'TTS failed');
    }

    // Response is audio/flac from MMS model
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Stop any previous audio
    stopSpeaking();

    // Play the audio
    currentAudio = new Audio(audioUrl);
    isCurrentlySpeaking = true;

    currentAudio.onended = () => {
      isCurrentlySpeaking = false;
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };

    currentAudio.onerror = () => {
      console.warn('[Voice] Audio playback error');
      isCurrentlySpeaking = false;
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };

    await currentAudio.play();
  } catch (error) {
    console.error('[Voice] Hugging Face TTS error:', error);
    isCurrentlySpeaking = false;
    throw error;
  }
}

// Speak text using Web Speech API (fallback)
function speakWithWebSpeech(text: string, lang: string = 'en-US'): void {
  if (!isSpeechSupported()) {
    console.log(`[Voice] Speech not supported. Would say: ${text}`);
    return;
  }

  stopSpeaking();
  isCurrentlySpeaking = true;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onend = () => {
    isCurrentlySpeaking = false;
  };

  utterance.onerror = () => {
    isCurrentlySpeaking = false;
  };

  window.speechSynthesis.speak(utterance);
}

// Main speak function - uses HF for Kinyarwanda, Web Speech for others
export async function speak(text: string, lang: SupportedLanguage = 'RW'): Promise<void> {
  if (!isBrowser()) return;

  const lowerLang = localeToLower(lang);

  // Use Hugging Face for Kinyarwanda
  if (lowerLang === 'rw') {
    try {
      await speakWithHuggingFace(text);
    } catch {
      // Fall back to Web Speech if HF fails
      console.log('[Voice] Falling back to Web Speech API');
      speakWithWebSpeech(text, 'rw-RW');
    }
    return;
  }

  // Use Web Speech API for other languages
  const langCodes: Record<string, string> = {
    en: 'en-US',
    rw: 'rw-RW',
    fr: 'fr-FR',
    sw: 'sw-KE',
  };

  speakWithWebSpeech(text, langCodes[lowerLang] || 'en-US');
}

// Speak prices for a city
export async function speakPrices(
  cityName: string,
  prices: CityPrices,
  currency: string,
  lang: SupportedLanguage = 'RW'
): Promise<void> {
  if (!isBrowser()) return;

  const phrases = ttsPhrases[lang] || ttsPhrases.RW;

  // Build the speech text
  let text = phrases.priceIntro.replace('{city}', cityName) + ' ';

  const commodityOrder = ['maize', 'beans', 'rice', 'cooking_bananas', 'irish_potatoes', 'maize_powder', 'diesel', 'petrol'];

  for (const commodity of commodityOrder) {
    const price = prices[commodity as keyof CityPrices];
    if (!price || price.value === null) continue;

    const name = getCommodityName(commodity, lang);
    const value = Math.round(price.value);
    const change = price.change;

    text += `${name}, ${value.toLocaleString()} ${currency}`;

    if (change !== null && change !== 0) {
      const changeText = change > 0
        ? phrases.priceUp.replace('{percent}', Math.abs(change).toFixed(1))
        : phrases.priceDown.replace('{percent}', Math.abs(change).toFixed(1));
      text += `, ${changeText}`;
    }

    text += '. ';
  }

  await speak(text, lang);
}

// Speak a single commodity price
export async function speakCommodityPrice(
  spotName: string,
  commodityId: string,
  price: number | null,
  currency: string,
  unit: 'kg' | 'L' = 'kg',
  lang: SupportedLanguage = 'RW'
): Promise<void> {
  if (!isBrowser()) return;

  const phrases = ttsPhrases[lang] || ttsPhrases.RW;

  if (!price) {
    const commodityName = getCommodityName(commodityId, lang);
    await speak(`${phrases.noData} ${commodityName} ${spotName}`, lang);
    return;
  }

  const text = buildPriceAnnouncement(lang, commodityId, price, currency, unit, spotName);
  await speak(text, lang);
}

// Speak Kigali average price (for HeroCard)
export async function speakKigaliAverage(
  commodityId: string,
  price: number | null,
  unit: 'kg' | 'L' = 'kg',
  lang: SupportedLanguage = 'RW'
): Promise<void> {
  if (!isBrowser() || !price) return;

  const text = buildPriceAnnouncement(lang, commodityId, price, 'RWF', unit, 'Kigali');
  await speak(text, lang);
}

// Play a small beep for audio feedback
export function playTapSound(): void {
  if (!isBrowser()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
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
  } catch {
    // Silent fail - audio feedback is nice-to-have
  }
}
