const { withInfoPlist, AndroidConfig } = require('expo/config-plugins');

const MICROPHONE_USAGE =
  'Quanti uses your microphone to transcribe optional voice context for directive refinement.';

module.exports = function withMicrophoneUsage(config) {
  config = withInfoPlist(config, (mod) => {
    mod.modResults.NSMicrophoneUsageDescription = MICROPHONE_USAGE;
    return mod;
  });

  return AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.RECORD_AUDIO',
    'android.permission.MODIFY_AUDIO_SETTINGS',
  ]);
};
