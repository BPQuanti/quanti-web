import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Alert } from 'react-native';

const MOCK_PUBLIC_TOKEN = 'mock-public-token-sandbox';

const MOCK_ACCOUNT = {
  publicToken: MOCK_PUBLIC_TOKEN,
  institution: {
    name: 'Chase',
    institution_id: 'ins_3',
  },
  accounts: [
    {
      id: 'mock-checking-01',
      name: 'Plaid Checking',
      mask: '0000',
      type: 'depository',
      subtype: 'checking',
    },
  ],
  source: 'mock',
};

function isExpoGo() {
  const ownership = Constants.appOwnership;
  const environment = Constants.executionEnvironment;

  return (
    ownership === 'expo' ||
    ownership === Constants.AppOwnership?.Expo ||
    (environment === ExecutionEnvironment.StoreClient &&
      (ownership === 'expo' || ownership === Constants.AppOwnership?.Expo))
  );
}

function shouldUseMockPlaid() {
  // StoreClient is Expo Go *or* an expo-dev-client build. Mock only Expo Go
  // so a custom EAS development build can still open native Plaid Link.
  if (isExpoGo()) {
    return true;
  }
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient && isExpoGo()) {
    return true;
  }
  return false;
}

function runMockPlaid({ onSuccess, onExit }) {
  Alert.alert(
    'Plaid sandbox (Expo Go)',
    'Native Plaid Link is not available in Expo Go. Using a mock public token so the banking UI can be tested.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          onExit?.({
            error: null,
            metadata: { status: 'exited', source: 'mock' },
          });
        },
      },
      {
        text: 'Continue',
        onPress: () => {
          onSuccess?.(MOCK_ACCOUNT);
        },
      },
    ]
  );
}

function loadPlaidSdk() {
  try {
    // Native module is loaded only outside Expo Go.
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    return require('react-native-plaid-link-sdk');
  } catch {
    return null;
  }
}

export async function openPlaidLink({ linkToken, onSuccess, onExit } = {}) {
  try {
    if (shouldUseMockPlaid()) {
      runMockPlaid({ onSuccess, onExit });
      return { mocked: true };
    }

    const sdk = loadPlaidSdk();
    const createPlaidLinkSession = sdk?.createPlaidLinkSession;

    if (typeof createPlaidLinkSession !== 'function') {
      runMockPlaid({ onSuccess, onExit });
      return { mocked: true, error: 'Plaid SDK is not linked in this build.' };
    }

    const session = await createPlaidLinkSession({
      token: linkToken || '',
      onSuccess: (success) => {
        const metadata = success?.metadata || success || {};
        onSuccess?.({
          publicToken: success?.publicToken || success?.public_token,
          institution: metadata.institution || null,
          accounts: metadata.accounts || [],
          source: 'plaid',
          raw: success,
        });
      },
      onExit: (exit) => {
        onExit?.(exit || { error: null });
      },
    });

    if (typeof session?.open === 'function') {
      await session.open();
    }

    return { mocked: false };
  } catch (error) {
    const message = error?.message ? String(error.message) : 'Plaid Link failed to open.';
    runMockPlaid({
      onSuccess,
      onExit: (exit) => onExit?.({ ...exit, error: message }),
    });
    return { mocked: true, error: message };
  }
}
