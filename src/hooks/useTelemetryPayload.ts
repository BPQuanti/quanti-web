import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { subscribeArcSettings } from '../services/arcSettings';
import { consumePendingOnboardingVoice } from '../services/onboarding';
import { assembleAnonymizedPayload } from '../services/telemetryPayload';
import { subscribeTelemetrySettings } from '../services/telemetrySettings';
import type { DailyTelemetryPayload } from '../types/telemetry';

export function useTelemetryPayload() {
  const { user } = useAuth();
  const [payload, setPayload] = useState<DailyTelemetryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const voiceRef = useRef<string | undefined>(undefined);
  const voiceDurationRef = useRef<number | undefined>(undefined);

  const refreshTelemetry = useCallback(async (optionalVoiceTranscript?: string, durationSeconds?: number) => {
    const pending = consumePendingOnboardingVoice();
    if (pending && typeof optionalVoiceTranscript !== 'string') {
      voiceRef.current = pending.transcript;
      voiceDurationRef.current = pending.durationSeconds;
    }
    if (typeof optionalVoiceTranscript === 'string') {
      voiceRef.current = optionalVoiceTranscript.trim() || undefined;
      if (!voiceRef.current) {
        voiceDurationRef.current = undefined;
      }
    }
    if (typeof durationSeconds === 'number') {
      voiceDurationRef.current = durationSeconds;
    }
    const id = ++requestId.current;
    setError(null);
    setLoading(true);
    try {
      const next = await assembleAnonymizedPayload(voiceRef.current, {
        voiceDurationSeconds: voiceDurationRef.current,
      });
      if (id !== requestId.current) {
        return next;
      }
      setPayload(next);
      return next;
    } catch (caught) {
      if (id !== requestId.current) {
        return null;
      }
      const message = caught instanceof Error ? caught.message : 'Telemetry could not be assembled.';
      if (message === 'NO_ARC_SELECTED') {
        setPayload(null);
        setError(null);
        return null;
      }
      setError(message);
      return null;
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    voiceRef.current = undefined;
    voiceDurationRef.current = undefined;
    setPayload(null);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      refreshTelemetry().catch(() => {});
    }, [refreshTelemetry, user?.id])
  );

  useEffect(() => {
    const unsubSettings = subscribeTelemetrySettings(() => {
      refreshTelemetry().catch(() => {});
    });
    const unsubArc = subscribeArcSettings(() => {
      refreshTelemetry().catch(() => {});
    });
    return () => {
      unsubSettings();
      unsubArc();
    };
  }, [refreshTelemetry]);

  return { payload, loading, error, refreshTelemetry };
}
