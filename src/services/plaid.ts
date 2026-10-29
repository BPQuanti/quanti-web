import type { LinkExit, LinkSuccess, PlaidLinkSession } from 'react-native-plaid-link-sdk';

type OpenPlaidOptions = {
  linkToken: string;
  onSuccess?: (success: LinkSuccess) => void;
  onExit?: (exit: LinkExit) => void;
};

type OpenPlaidResult = {
  success: boolean;
  opened: boolean;
  session: PlaidLinkSession | null;
  error: string | null;
};

async function loadPlaid() {
  try {
    return await import('react-native-plaid-link-sdk');
  } catch {
    return null;
  }
}

export async function getPlaidAvailability() {
  try {
    const sdk = await loadPlaid();
    if (!sdk?.createPlaidLinkSession) {
      return {
        available: false,
        error: 'Plaid Link is unavailable in this environment.',
      };
    }
    return { available: true, error: null };
  } catch {
    return {
      available: false,
      error: 'Plaid Link native module failed to load.',
    };
  }
}

function fail(error: string): OpenPlaidResult {
  return { success: false, opened: false, session: null, error };
}

export async function openPlaidLinkModal({
  linkToken,
  onSuccess,
  onExit,
}: OpenPlaidOptions): Promise<OpenPlaidResult> {
  if (!linkToken) {
    return fail('A Plaid link_token is required to open Link.');
  }

  try {
    const sdk = await loadPlaid();
    if (!sdk?.createPlaidLinkSession) {
      return fail('Plaid Link is unavailable in this environment.');
    }

    const session = await sdk.createPlaidLinkSession({
      token: linkToken,
      onSuccess: (success) => {
        onSuccess?.(success);
      },
      onExit: (exit) => {
        onExit?.(exit);
      },
      onEvent: () => {},
    });

    await session.open();
    return { success: true, opened: true, session, error: null };
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Plaid Link failed to open.');
  }
}
