const WEBHOOK_URL = process.env.EXPO_PUBLIC_DISCORD_FEEDBACK_WEBHOOK_URL;

export function isFeedbackWebhookConfigured() {
  return typeof WEBHOOK_URL === 'string' && WEBHOOK_URL.startsWith('https://discord.com/api/webhooks/');
}

function clipField(value: string, max = 1000) {
  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 3)}...`;
}

export async function sendInAppFeedback(input: { text: string; userId?: string | null }) {
  const text = clipField(input.text);
  if (!text) {
    throw new Error('Write a note first.');
  }
  if (!isFeedbackWebhookConfigured() || !WEBHOOK_URL) {
    throw new Error('Feedback is not configured on this build.');
  }

  const body = {
    username: 'Quanti In-App Feedback',
    embeds: [
      {
        title: '⚡ New Alpha Feedback',
        color: 3447003,
        fields: [
          { name: 'Feedback', value: text },
          { name: 'User ID', value: clipField(input.userId || 'anonymous', 256), inline: true },
          { name: 'Platform', value: 'iOS Alpha', inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  let response: Response;
  try {
    response = await fetch(process.env.EXPO_PUBLIC_DISCORD_FEEDBACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the team. Check your connection and try again.');
  }

  if (response.status !== 200 && response.status !== 204) {
    throw new Error('The team did not receive that. Try again in a moment.');
  }
}
