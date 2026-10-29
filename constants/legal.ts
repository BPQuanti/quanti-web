export const LEGAL_UPDATED = 'October 28, 2026';
export const LEGAL_ENTITY = 'Quanti Technologies LLC';
export const SUPPORT_EMAIL = 'brian@quanti-app.com';
export const SITE_URL = 'https://quanti-app.com';

export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  title: string;
  updated: string;
  sections: LegalSection[];
};

export const privacyPolicy: LegalDocument = {
  title: 'Privacy Policy',
  updated: LEGAL_UPDATED,
  sections: [
    {
      title: 'Who this covers',
      blocks: [
        {
          kind: 'p',
          text: `${LEGAL_ENTITY} ("Quanti," "we," "us") provides the Quanti mobile app and the website at ${SITE_URL}. This policy describes the personal information those products collect, how it is used, and the choices you have. It applies to the app, the waitlist site, and related support email.`,
        },
      ],
    },
    {
      title: 'Information we collect',
      blocks: [
        {
          kind: 'p',
          text: 'We collect only what we need to run your account, coach daily habits, and keep the service secure.',
        },
        {
          kind: 'ul',
          items: [
            'Account data: email address, authentication identifiers, username, avatar, and subscription status.',
            'Waitlist data: email address, referral code, and waitlist position when you join on the website.',
            'Product data you generate: focus directives, execution notes, voice-context transcripts used to write those directives, and device habit summaries.',
            'Device and diagnostic data: app version, coarse device type, and error logs needed to operate and secure the service. We do not use this for advertising.',
          ],
        },
      ],
    },
    {
      title: 'Health and biometrics (Apple HealthKit)',
      blocks: [
        {
          kind: 'p',
          text: 'If you grant Health access, Quanti reads sleep, daylight, ambient noise, and step cadence from Apple HealthKit. Those samples are processed on your device into daily summaries. The summaries are stored in your Quanti account on Supabase and protected by row-level security so a row is readable and writable only by the signed-in user who owns it.',
        },
        {
          kind: 'p',
          text: 'Health data is never sold, rented, or used for advertising or marketing. We do not use HealthKit data for data mining unrelated to the habit features you turn on, and we do not share it with advertisers, data brokers, or social networks. You can stop further collection by turning off Health access for Quanti in the iOS Settings app. That system permission is controlled by Apple, not by a switch inside Quanti.',
        },
      ],
    },
    {
      title: 'Digital habit metrics (Screen Time)',
      blocks: [
        {
          kind: 'p',
          text: 'If you allow Screen Time, DeviceActivity, or Family Controls access, Quanti collects screen-time category totals, phone pickup counts, and notification counts. Those values are stored as tokenized daily summaries, not as a timeline of what you did in each app.',
        },
        {
          kind: 'p',
          text: 'Quanti does not access or store individual browsing history, raw keystrokes, message contents, or the specific activity inside an app. Category totals are used to verify focus directives, such as late-night screen time, and to show digital-balance trends.',
        },
      ],
    },
    {
      title: 'Financial data (Plaid)',
      blocks: [
        {
          kind: 'p',
          text: 'If you link a bank, transactions and account metadata are retrieved through Plaid’s read-only connection. Quanti uses that data to calculate financial velocity and impulse-spend risk. Your bank username, password, and multi-factor codes are entered in Plaid’s interface. Those credentials never touch Quanti servers.',
        },
        {
          kind: 'p',
          text: 'Plaid’s own privacy policy governs Plaid’s handling of the connection. When you delete your Quanti account, we ask our servers to revoke the stored bank connection and then delete the related records.',
        },
      ],
    },
    {
      title: 'Private by default',
      blocks: [
        {
          kind: 'p',
          text: 'Quanti is a personal coaching product. Your profile, directives, voice context, health summaries, screen-time rollups, and bank-derived signals are for you. We do not operate a friends graph, public leaderboard, or duels. Other members cannot search for you, see your score, or challenge you.',
        },
      ],
    },
    {
      title: 'How we use information',
      blocks: [
        {
          kind: 'ul',
          items: [
            'To create and secure your account and to sync the device you sign in on.',
            'To generate a daily focus directive from the telemetry and voice context you provide, and to remember that directive on this account.',
            'To send waitlist, product, and support messages you asked for. Marketing email includes an unsubscribe path.',
            'To detect abuse, debug failures, and meet legal duties.',
          ],
        },
        {
          kind: 'p',
          text: 'Where the GDPR applies, we rely on contract (running the account you requested), consent (Health, Screen Time, and bank permissions, which you can withdraw), legitimate interests (security and product integrity), and legal obligation. Where the CCPA/CPRA applies, we do not sell personal information and we do not share it for cross-context behavioral advertising.',
        },
      ],
    },
    {
      title: 'Who we share it with',
      blocks: [
        {
          kind: 'p',
          text: 'We do not sell or rent personal information. We share it only with processors that run the service, and only for that purpose:',
        },
        {
          kind: 'ul',
          items: [
            'Supabase, for authentication and the database that stores your account rows under row-level security.',
            'Plaid, when you choose to link a bank.',
            'Apple, for sign-in, HealthKit, Screen Time permissions, and in-app purchases.',
            'Email delivery and website hosting providers, for waitlist messages and the public site.',
          ],
        },
        {
          kind: 'p',
          text: 'We may also disclose information if the law requires it, or to protect Quanti, our users, or the public from fraud or security harm. If we are involved in a merger or sale, we will notify you before your information becomes subject to a different privacy policy.',
        },
      ],
    },
    {
      title: 'Retention, security, and location',
      blocks: [
        {
          kind: 'p',
          text: 'We keep account information while your account is open and for a short period afterward to complete deletion, resolve disputes, and meet accounting or security duties. Habit summaries, health summaries, and directives are deleted when the account is deleted. Server connections use TLS. Database access is limited by row-level security and service credentials that are not shipped in the app.',
        },
        {
          kind: 'p',
          text: 'Data may be processed in the United States and in other countries where our infrastructure providers operate. If we transfer GDPR personal data internationally, we use an appropriate safeguard such as standard contractual clauses.',
        },
      ],
    },
    {
      title: 'Your rights: access, deletion, and opt-out',
      blocks: [
        {
          kind: 'p',
          text: 'Depending on where you live, including the EEA, UK, and California, you can request access, correction, deletion, a copy, or a limit on certain processing. You will not be discriminated against for exercising these rights. We may need to confirm that the request comes from the account email.',
        },
        {
          kind: 'ul',
          items: [
            `Access or correction: email ${SUPPORT_EMAIL} with the subject "Access request" from the address on the account. We will respond within the time the law requires, generally 45 days under the CCPA and one month under the GDPR.`,
            'Deletion in the app: open Privacy, then Delete Account. Type DELETE to confirm. That request revokes the Plaid connection and deletes the profile, habit summaries, and directives tied to the login.',
            `Deletion by email: email ${SUPPORT_EMAIL} with the subject "Data deletion request." Include the account email and, if you also joined the website waitlist, that address.`,
            'Opt out of sale or share: Quanti does not sell personal information and does not share it for cross-context behavioral advertising. Email "Do not sell or share" if you want that preference recorded anyway.',
            'Opt out of marketing email: use the unsubscribe link in the message, or email us. Service messages about your account or security may continue.',
            'Appeal: if we deny a request, reply to that decision and we will review it. You may also contact your local data protection authority or the California Privacy Protection Agency.',
          ],
        },
        {
          kind: 'p',
          text: 'California residents may request the categories of personal information collected, the sources, the business purpose, and the categories of recipients. We collect identifiers, commercial information such as subscription status, health summaries, limited internet or device activity in summary form, and inferences such as daily focus directives. We do not collect precise location for advertising.',
        },
      ],
    },
    {
      title: 'Children',
      blocks: [
        {
          kind: 'p',
          text: 'Quanti is not directed to anyone under 18. We do not knowingly collect personal information from children. If you believe a child has given us information, email us and we will delete it.',
        },
      ],
    },
    {
      title: 'Changes and contact',
      blocks: [
        {
          kind: 'p',
          text: `We will post changes on this page and update the date above. If a change materially expands how we use health or financial data, we will provide a clearer notice in the app or by email. Questions and privacy requests go to ${LEGAL_ENTITY}, ${SUPPORT_EMAIL}, ${SITE_URL}.`,
        },
      ],
    },
  ],
};

export const termsOfService: LegalDocument = {
  title: 'Terms of Service',
  updated: LEGAL_UPDATED,
  sections: [
    {
      title: 'Agreement',
      blocks: [
        {
          kind: 'p',
          text: `These terms are a contract between you and ${LEGAL_ENTITY} for the Quanti app and the website at ${SITE_URL}. By creating an account, joining the waitlist, or using the service, you agree to these terms and to the Privacy Policy. If you do not agree, do not use Quanti.`,
        },
      ],
    },
    {
      title: 'The service',
      blocks: [
        {
          kind: 'p',
          text: 'Quanti is a personal habit and productivity coach. You say where you are and where you want to go. It summarizes signals you choose to connect, such as sleep, screen time, and spending, optionally refined by a short voice check-in, and turns those into one daily 1% directive toward that destination. There is no public board, friends list, or duel.',
        },
      ],
    },
    {
      title: 'Accounts and acceptable use',
      blocks: [
        {
          kind: 'p',
          text: 'You must be at least 18 years old. You are responsible for the accuracy of your account details, for keeping your sign-in private, and for activity under your account. Tell us promptly if you believe the account is being used without your permission.',
        },
        {
          kind: 'ul',
          items: [
            'Do not break the law or impersonate another person.',
            'Do not probe, scrape, or disrupt the service, or attempt to bypass row-level security or another person’s account.',
            'Do not upload content you do not have the right to share.',
            'Do not use Quanti to build a competing dataset or to resell access.',
          ],
        },
        {
          kind: 'p',
          text: 'We may suspend or close an account that violates these terms, creates a security risk, or remains unused where the law allows. You may stop using Quanti and request deletion at any time.',
        },
      ],
    },
    {
      title: 'Subscriptions and the OG Founder tier',
      blocks: [
        {
          kind: 'p',
          text: 'Some features are free. Paid access is billed as an auto-renewing subscription through your Apple ID when you confirm the purchase. The OG Founder tier offered to the first 500 waitlist members is $49 per year. The price, currency, and term shown on Apple’s purchase sheet at checkout are the terms of that charge.',
        },
        {
          kind: 'ul',
          items: [
            'A subscription renews for the same period unless you cancel at least 24 hours before the end of the current period.',
            'Cancel in iOS Settings, then your name, then Subscriptions. Deleting the app, or deleting your Quanti account, does not by itself cancel an Apple subscription.',
            'Apple handles the charge, the receipt, and refunds under Apple’s policies and applicable law. Quanti does not store your full payment card number.',
            'If a free trial is offered, the trial length and the price after the trial are shown before you confirm. Cancel before the trial ends to avoid the first paid renewal.',
            'Taxes may be added by Apple where required.',
          ],
        },
      ],
    },
    {
      title: 'No medical, financial, or clinical advice',
      blocks: [
        {
          kind: 'p',
          text: 'Quanti AI directives and spending or sleep summaries are habit and productivity coaching only. They do not constitute medical, mental-health, financial, investment, tax, or clinical advice, and they are not a diagnosis or a recommendation to buy, sell, or hold anything. Health and bank figures can be delayed, incomplete, or wrong. Decisions about your health, money, or safety are yours, and you should consult a qualified professional when that decision needs one.',
        },
      ],
    },
    {
      title: 'Your content and our intellectual property',
      blocks: [
        {
          kind: 'p',
          text: 'You keep ownership of the account information and connected-data summaries you submit. You give Quanti a limited license to host, process, and display that information solely to operate the personal coaching features you use. The app, site, models, text, and branding are owned by Quanti or its licensors. You may not copy or reverse engineer them except where the law forbids that limit.',
        },
      ],
    },
    {
      title: 'Third-party services',
      blocks: [
        {
          kind: 'p',
          text: 'Apple Health, Screen Time, Plaid, and Apple payments are third-party services with their own terms. Quanti is not responsible for a bank, Apple, or Plaid outage, or for a permission you decline. If a connection fails, related coaching may be unavailable until it succeeds.',
        },
      ],
    },
    {
      title: 'Disclaimers and liability',
      blocks: [
        {
          kind: 'p',
          text: 'The service is provided “as is” and “as available.” To the extent the law allows, Quanti disclaims implied warranties of merchantability, fitness for a particular purpose, and non-infringement. Quanti does not warrant that directives will be accurate, that a streak or score will produce a particular outcome, or that the service will be uninterrupted.',
        },
        {
          kind: 'p',
          text: 'To the maximum extent permitted by law, Quanti is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or goodwill. Quanti’s total liability for a claim arising out of the service is limited to the amount you paid Quanti for the service in the three months before the claim, or fifty U.S. dollars if you paid nothing. Some places do not allow these limits, so they apply only as far as they are allowed. Nothing in these terms limits liability for fraud or for death or personal injury caused by negligence where the law forbids that limit.',
        },
      ],
    },
    {
      title: 'Disputes and changes',
      blocks: [
        {
          kind: 'p',
          text: 'These terms are governed by the laws of the United States and the state in which Quanti Technologies LLC is organized, without regard to conflict-of-law rules, except where a consumer protection law in your country requires otherwise. Before filing a claim, email us and give us 30 days to try to resolve it. We may update these terms by posting a new version with a new date. Continued use after the update takes effect means you accept the new terms. If you do not accept them, stop using Quanti and request deletion.',
        },
        {
          kind: 'p',
          text: `Questions about these terms: ${LEGAL_ENTITY}, ${SUPPORT_EMAIL}, ${SITE_URL}.`,
        },
      ],
    },
  ],
};
