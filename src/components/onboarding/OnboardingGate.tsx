import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../../../context/AuthContext';
import BootScreen from '../../../components/BootScreen';
import { resolveOnboardingComplete, subscribeOnboardingGate } from '../../services/onboarding';
import OnboardingFlow from './OnboardingFlow';

type Props = {
  children: ReactNode;
};

export default function OnboardingGate({ children }: Props) {
  const { user, isDevBypass } = useAuth();
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [gateTick, setGateTick] = useState(0);

  useEffect(() => subscribeOnboardingGate(() => setGateTick((value) => value + 1)), []);

  useEffect(() => {
    let live = true;
    (async () => {
      if (isDevBypass || !user?.id) {
        if (live) {
          setNeedsOnboarding(false);
          setReady(true);
        }
        return;
      }
      setReady(false);
      const complete = await resolveOnboardingComplete(user.id);
      if (live) {
        setNeedsOnboarding(!complete);
        setReady(true);
      }
    })();
    return () => {
      live = false;
    };
  }, [user?.id, isDevBypass, gateTick]);

  if (!ready) {
    return <BootScreen />;
  }

  if (needsOnboarding) {
    return <OnboardingFlow onComplete={() => setNeedsOnboarding(false)} />;
  }

  return children;
}
