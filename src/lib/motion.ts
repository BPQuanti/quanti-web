import { LayoutAnimation, Platform, UIManager } from 'react-native';

let androidReady = false;

function enableAndroidLayout() {
  if (androidReady || Platform.OS !== 'android') return;
  androidReady = true;
  const manager = UIManager as typeof UIManager & {
    setLayoutAnimationEnabledExperimental?: (enabled: boolean) => void;
  };
  manager.setLayoutAnimationEnabledExperimental?.(true);
}

export function easeLayout() {
  enableAndroidLayout();
  LayoutAnimation.configureNext({
    duration: 320,
    create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    update: { type: LayoutAnimation.Types.easeInEaseOut },
    delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  });
}
