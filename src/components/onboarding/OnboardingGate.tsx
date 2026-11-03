import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../../../context/AuthContext';
import BootScreen from '../../../components/BootScreen';
import { resolveOnboardingComplete, subscribeOnboardingGate } from '../../services/onboarding';

const OnboardingFlow = lazy(() => import('./OnboardingFlow'));

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
      try {
        const complete = await resolveOnboardingComplete(user.id);
        if (live) {
          setNeedsOnboarding(!complete);
          setReady(true);
        }
      } catch (caught) {
        console.warn('[Onboarding] gate failed', caught);
        if (live) {
          setNeedsOnboarding(false);
          setReady(true);
        }
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
    return (
      <Suspense fallback={<BootScreen />}>
        <OnboardingFlow onComplete={() => setNeedsOnboarding(false)} />
      </Suspense>
    );
  }

  return children;
}
