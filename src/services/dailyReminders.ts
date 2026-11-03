import { Platform } from 'react-native';
import { checkNotificationPermission } from './permissions';
import { getTodayLog, localDateStamp } from './directiveHistory';
import { ensureGuidedQuestion, getGuidedQuestion } from './guidedQuestion';

const MORNING_ID = 'quanti-morning-question';
const EVENING_ID = 'quanti-evening-mark';
const CHANNEL_ID = 'quanti-daily';
const MORNING_HOUR = 8;
const EVENING_HOUR = 20;

async function loadNotifications() {
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

function atHour(base: Date, hour: number, minute = 0) {
  const next = new Date(base);
  next.setHours(hour, minute, 0, 0);
  return next;
}

function clipBody(text: string, max = 160) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) {
    return cleaned;
  }
  return `${cleaned.slice(0, max - 1).trim()}…`;
}

export function installNotificationHandler() {
  loadNotifications()
    .then((Notifications) => {
      if (!Notifications) {
        return;
      }
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    })
    .catch(() => {});
}

export async function syncDailyReminders(opts?: { markedToday?: boolean }) {
  try {
    const Notifications = await loadNotifications();
    if (!Notifications?.scheduleNotificationAsync) {
      return;
    }
    const permission = await checkNotificationPermission();
    if (permission.state !== 'granted') {
      return;
    }

    if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Daily compass',
        importance: Notifications.AndroidImportance?.DEFAULT,
      });
    }

    await Notifications.cancelScheduledNotificationAsync(MORNING_ID).catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(EVENING_ID).catch(() => {});

    const now = new Date();
    const today = localDateStamp(now);
    const morningToday = atHour(now, MORNING_HOUR);
    const eveningToday = atHour(now, EVENING_HOUR);
    const marked = opts?.markedToday ?? Boolean((await getTodayLog(today))?.status);

    let morningWhen = morningToday;
    let morningDate = today;
    if (now >= morningToday || marked) {
      morningWhen = atHour(now, MORNING_HOUR);
      morningWhen.setDate(morningWhen.getDate() + 1);
      morningDate = localDateStamp(morningWhen);
    }
    const morningRecord =
      (await getGuidedQuestion(morningDate).catch(() => null)) ??
      (await ensureGuidedQuestion({ date: morningDate, source: 'mark' }).catch(() => null));
    const triggerType = Notifications.SchedulableTriggerInputTypes?.DATE ?? 'date';
    const trigger = {
      type: triggerType,
      date: morningWhen,
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    };

    await Notifications.scheduleNotificationAsync({
      identifier: MORNING_ID,
      content: {
        title: 'Optional question',
        body: clipBody(morningRecord?.question || 'Skip if last night’s mark already sized today’s 1%.'),
        data: { kind: 'question' },
      },
      trigger: trigger as never,
    });

    let eveningWhen = eveningToday;
    if (marked || now >= eveningToday) {
      eveningWhen = atHour(now, EVENING_HOUR);
      eveningWhen.setDate(eveningWhen.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      identifier: EVENING_ID,
      content: {
        title: 'Did you do it?',
        body: 'Executed, partial, or shifted. Tonight writes tomorrow.',
        data: { kind: 'mark' },
      },
      trigger: {
        type: triggerType,
        date: eveningWhen,
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      } as never,
    });
  } catch (caught) {
    console.warn('[Reminders] schedule skipped', caught);
  }
}
