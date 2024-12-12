import { NextResponse } from 'next/server';
import textToSpeech, { protos } from '@google-cloud/text-to-speech';

// Initialize client with credentials
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: './google-credentials.json'
});

export async function POST(request: Request) {
  const { text, language } = await request.json(); // Parse the incoming JSON request

  try {
    const languageCodes: { [key: string]: string } = {
      'english': 'en-IN',
      'hindi': 'hi-IN',
      'marathi': 'mr-IN',
      'gujarati': 'gu-IN'
    };

    // Configure the synthesis request
    const synthesisRequest: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text },
      voice: {
        languageCode: languageCodes[language] || 'en-IN',
        name: `${languageCodes[language]}-Wavenet-A`,
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
        pitch: 0,
        speakingRate: 1.0
      },
    };

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(synthesisRequest);
    const audioContent = response.audioContent;

    return new NextResponse(audioContent, {
      headers: {
        'Content-Type': 'audio/mp3',
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json({ 
      message: 'Error generating speech', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}