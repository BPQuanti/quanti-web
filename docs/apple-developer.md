# Apple Developer deployment

Quanti ships from this repo with Expo SDK 57. The iOS bundle id is `com.quanti.app`. HealthKit, Sign in with Apple, and Plaid are native modules, so day-to-day UI can run in Expo Go, and a store or TestFlight build has to be an EAS build.

## What you need first

- An Apple Developer Program membership ($99/year).
- An Expo account. EAS Build is available on the free plan.
- This app’s bundle id left as `com.quanti.app` in `app.json`.
- HealthKit and Sign in with Apple turned on for that App ID. `app.json` already requests those entitlements, plus the Health, Location, and Photo usage strings.

Encryption export is already set: `ios.config.usesNonExemptEncryption` is `false`.

## Expo Go versus a device build

```sh
npx expo start --go --host lan
```

Use that for UI that stays inside Expo Go. HealthKit and the Plaid Link SDK are not in Expo Go. For those, install a development build:

```sh
npx eas-cli@latest login
npx eas-cli@latest build --platform ios --profile development
```

`eas.json` already has three profiles:

- `development` — dev client, internal distribution, physical device (simulator is off).
- `preview` — internal distribution for testers.
- `production` — App Store / TestFlight binary.

## Production build and TestFlight

```sh
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios
```

On the first submit, EAS asks for the Apple ID and can create the distribution certificate and provisioning profile. The build shows up in App Store Connect after Apple finishes processing, usually 10–15 minutes, and can then be added to TestFlight.

To build and hand the binary to submit in one step:

```sh
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

Optional, once the app exists in App Store Connect: put its Apple ID (App Information → General → Apple ID) on the production submit profile in `eas.json` as `submit.production.ios.ascAppId`.

For a non-interactive submit later, create an App Store Connect API key with `npx eas-cli@latest credentials --platform ios`.

## App Review notes that match this product

- Sign in with email. Skip Login is a dev bypass and is not the review path.
- Privacy Policy: https://quanti-app.com/privacy
- Terms of Service: https://quanti-app.com/terms
- Account deletion is in the app under Hub → Legal & Privacy → Account Data Deletion.
- Health data is used for habit coaching. The policy states it is not sold or used for advertising.
- Bank linking is read-only through Plaid. Quanti does not receive bank passwords.
- Directives are habit coaching, not medical or financial advice.

Cancel an Apple subscription in iOS Settings → Apple ID → Subscriptions. Deleting the Quanti account does not cancel the App Store subscription.
