import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localDateStamp } from '../services/directiveHistory';

/** Device-local calendar day. Updates on foreground and around midnight. */
export function useLocalCalendarDate() {
  const [date, setDate] = useState(localDateStamp);

  useEffect(() => {
    const sync = () => {
      const next = localDateStamp();
      setDate((prev) => (prev === next ? prev : next));
    };
    sync();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sync();
      }
    });
    const timer = setInterval(sync, 30_000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);

  return date;
}
