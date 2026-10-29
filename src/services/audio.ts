import {
  AudioModule,
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';

type RecorderHandle = InstanceType<typeof AudioModule.AudioRecorder>;

let activeRecorder: RecorderHandle | null = null;

type AudioPermissionStatus = {
  granted: boolean;
  available: boolean;
  canAskAgain: boolean;
  status: string;
  error: string | null;
};

function mapAudioPermission(response: { granted?: boolean; canAskAgain?: boolean; status?: string }): AudioPermissionStatus {
  const status = String(response.status || (response.granted ? 'granted' : 'undetermined'));
  return {
    granted: Boolean(response.granted) || status === 'granted',
    available: true,
    canAskAgain: status !== 'denied' || Boolean(response.canAskAgain),
    status,
    error: null,
  };
}

export async function getAudioPermissionStatus(options?: { requestIfNeeded?: boolean }) {
  try {
    const current = await getRecordingPermissionsAsync();
    if (current.granted || !options?.requestIfNeeded) {
      return mapAudioPermission(current);
    }

    const next = await requestRecordingPermissionsAsync();
    const mapped = mapAudioPermission(next);
    if (!mapped.granted && mapped.status === 'denied') {
      return {
        ...mapped,
        error:
          'This install cannot show the iOS microphone prompt. Rebuild the development client so NSMicrophoneUsageDescription is in Info.plist.',
      };
    }
    return mapped;
  } catch (error) {
    return {
      granted: false,
      available: false,
      canAskAgain: true,
      status: 'undetermined',
      error: error instanceof Error ? error.message : 'Microphone permission check failed.',
    };
  }
}

export async function requestMicrophonePermission() {
  const status = await getAudioPermissionStatus({ requestIfNeeded: true });
  return status;
}

export async function stopAndUnloadRecording() {
  const recorder = activeRecorder;
  activeRecorder = null;

  if (!recorder) {
    return { uri: null as string | null };
  }

  let uri = recorder.uri;

  try {
    await recorder.stop();
    uri = recorder.uri ?? uri;
  } catch {
    // Recorder may already be stopped in Expo Go / unlinked builds.
  }

  try {
    recorder.remove?.();
  } catch {
    // SharedObject teardown is best-effort.
  }

  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    });
  } catch {
    // Audio session restore is best-effort.
  }

  return { uri };
}

export async function startVoiceCheckIn() {
  try {
    if (activeRecorder) {
      await stopAndUnloadRecording();
    }

    const status = await getAudioPermissionStatus({ requestIfNeeded: true });
    if (!status.granted) {
      return { started: false as const, recording: null };
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
    await recorder.prepareToRecordAsync();
    recorder.record();
    activeRecorder = recorder;

    return { started: true as const, recording: recorder };
  } catch {
    activeRecorder = null;
    return { started: false as const, recording: null };
  }
}

export async function stopVoiceCheckIn() {
  return stopAndUnloadRecording();
}
