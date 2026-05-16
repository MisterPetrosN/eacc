import { NextRequest, NextResponse } from 'next/server';

// Hugging Face Kinyarwanda TTS using MMS (Massively Multilingual Speech)
const HF_MODEL = 'facebook/mms-tts-kin';
// New HF Inference Router endpoint (2024+)
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Limit text length for safety
    const sanitizedText = text.slice(0, 500);

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.error('[TTS] HUGGINGFACE_API_KEY not configured');
      return NextResponse.json(
        { error: 'TTS service not configured' },
        { status: 503 }
      );
    }

    // Call Hugging Face Inference API
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: sanitizedText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TTS] Hugging Face API error:', response.status, errorText);

      // Handle model loading (cold start)
      if (response.status === 503) {
        return NextResponse.json(
          { error: 'Model is loading, please try again in a few seconds' },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'TTS generation failed' },
        { status: response.status }
      );
    }

    // Response is audio/flac from MMS model
    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/flac',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('[TTS] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
