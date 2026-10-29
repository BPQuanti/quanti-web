import { supabase } from '../lib/supabase';
import { edgeFunctionUrl } from './supabaseFunctions';

const TIMEOUT_MS = 45_000;

function guessAudioMeta(uri: string) {
  const lower = uri.split('?')[0]?.toLowerCase() ?? '';
  if (lower.endsWith('.wav')) {
    return { filename: 'voice-checkin.wav', mimeType: 'audio/wav' };
  }
  if (lower.endsWith('.mp3')) {
    return { filename: 'voice-checkin.mp3', mimeType: 'audio/mpeg' };
  }
  if (lower.endsWith('.caf')) {
    return { filename: 'voice-checkin.caf', mimeType: 'audio/x-caf' };
  }
  return { filename: 'voice-checkin.m4a', mimeType: 'audio/m4a' };
}

function bytesToBase64(bytes: Uint8Array) {
  const chunk = 0x8000;
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += chunk) {
    const slice = bytes.subarray(offset, offset + chunk);
    binary += String.fromCharCode(...slice);
  }
  if (typeof globalThis.btoa !== 'function') {
    throw new Error('Base64 encoding is unavailable on this runtime.');
  }
  return globalThis.btoa(binary);
}

async function readRecordingAsBase64(uri: string) {
  console.log('[Voice] reading recording bytes', { uri });
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Could not read recorded audio (${response.status}).`);
  }
  const buffer = await response.arrayBuffer();
  if (!buffer.byteLength) {
    throw new Error('Recorded audio file was empty.');
  }
  console.log('[Voice] recording byte length', buffer.byteLength);
  return bytesToBase64(new Uint8Array(buffer));
}

export async function transcribeVoiceRecording(options: {
  uri: string;
  durationSeconds?: number | null;
}) {
  const target = edgeFunctionUrl('transcribe-voice');
  if (!target) {
    throw new Error('Supabase is not configured; transcription cannot run.');
  }

  const { data, error } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (error || !accessToken) {
    throw new Error(error?.message || 'Sign in is required before transcribing voice.');
  }

  const meta = guessAudioMeta(options.uri);
  const audioBase64 = await readRecordingAsBase64(options.uri);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  console.log('[Voice] posting audio to transcribe-voice', {
    filename: meta.filename,
    mimeType: meta.mimeType,
    durationSeconds: options.durationSeconds ?? null,
    base64Chars: audioBase64.length,
  });

  try {
    const response = await fetch(target.url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: target.anon,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_base64: audioBase64,
        mime_type: meta.mimeType,
        filename: meta.filename,
        duration_seconds: options.durationSeconds ?? null,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      transcript?: string;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(payload.error || `Transcription function failed (${response.status}).`);
    }

    const transcript = payload.transcript?.trim();
    if (!transcript) {
      throw new Error(payload.error || 'Whisper returned an empty transcript.');
    }

    console.log('[Voice] whisper transcript', transcript);
    return { transcript };
  } finally {
    clearTimeout(timer);
  }
}
