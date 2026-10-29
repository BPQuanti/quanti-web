# Apple Developer setup

Quanti is an Expo SDK 57 app. The iOS bundle id in `app.json` is `com.quanti.app`. Expo Go can show the Focus, Radar, Momentum, and Hub tabs. HealthKit, Plaid, and Screen Time need a signed EAS build.

## 1. Enroll

1. Sign in at [developer.apple.com/programs](https://developer.apple.com/programs) with the Apple ID that will own the app.
2. Enroll in the Apple Developer Program. The membership is $99 per year.
3. After Apple approves the membership, open [App Store Connect](https://appstoreconnect.apple.com) and confirm the same team is selected.

You also need a free Expo account. EAS Build can create the iOS distribution certificate and provisioning profile after you sign in to Apple from the CLI.

## 2. Register the App ID

1. In the Apple Developer portal, open Certificates, Identifiers & Profiles → Identifiers.
2. Add an App ID with bundle id `com.quanti.app`.
3. Enable these capabilities on that App ID:
   - HealthKit
   - Sign in with Apple
   - App Groups
   - Family Controls, after Apple approves the request below

`app.json` already sets HealthKit, Sign in with Apple, the Health, Location, and Photo usage strings, and `ios.config.usesNonExemptEncryption: false`.

## 3. App Group

Screen Time summaries have to be written by a Device Activity extension and read by the Quanti app. Both targets must share one App Group.

1. Identifiers → App Groups → add `group.com.quanti.app`.
2. Open the `com.quanti.app` App ID and attach that group.
3. When the Device Activity extension exists, attach the same group to the extension’s App ID.

The group id to use everywhere is `group.com.quanti.app`.

## 4. Family Controls entitlement

Family Controls is a restricted entitlement. Apple does not turn it on just because it is listed in a profile.

1. Request access from Apple for the Family Controls capability on `com.quanti.app`. Describe Quanti as a habit coach that reads category totals, pickup counts, and notification counts, and that it does not read browsing history, keystrokes, or the contents of other apps.
2. After Apple approves the request, enable Family Controls on the App ID.
3. Add the entitlement `com.apple.developer.family-controls` to the app and to the Device Activity extension.
4. Rebuild with EAS so the new entitlement is in the provisioning profile.

Until that approval lands, do not ship a build that requires the entitlement. Expo Go does not include Family Controls or Device Activity.

## 5. TestFlight with EAS

`eas.json` already has `development`, `preview`, and `production` profiles. Install and sign in once:

```sh
npx eas-cli@latest login
```

Development build for a physical iPhone, including the native modules Expo Go cannot load:

```sh
npx eas-cli@latest build --platform ios --profile development
```

Production binary, then upload to App Store Connect:

```sh
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios
```

Or build and submit together:

```sh
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

The first submit asks for the Apple ID. EAS can create the distribution certificate and provisioning profile. The build appears in TestFlight after Apple finishes processing, usually 10–15 minutes. Add testers from App Store Connect.

For a later non-interactive submit, create an App Store Connect API key:

```sh
npx eas-cli@latest credentials --platform ios
```

When the app exists in App Store Connect, copy App Information → Apple ID into `eas.json` as `submit.production.ios.ascAppId`.

## 6. Review notes

- Reviewers should sign in with email. Skip Login is a development bypass.
- Privacy Policy: https://quanti-app.com/privacy
- Terms of Service: https://quanti-app.com/terms
- Account deletion is Hub → Legal & Privacy → Account Data Deletion.
- Health data and screen-time summaries are for habit coaching. They are not sold or used for advertising.
- Bank linking is read-only through Plaid.
- Directives are habit coaching, not medical or financial advice.
- The OG Founder subscription advertised to the first 500 waitlist members is $49 per year. Cancel it in iOS Settings → Apple ID → Subscriptions. Deleting the Quanti account does not cancel the App Store subscription.
