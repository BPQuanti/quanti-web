export const metadata = {
  title: "Privacy Policy | Quanti",
  description: "Privacy Policy for Quanti app and quanti-app.com.",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-300 py-16 px-6 sm:px-12 max-w-4xl mx-auto font-sans leading-relaxed">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-sm text-zinc-500 mb-8">Last Updated: October 5, 2026</p>
      <section className="space-y-6 text-sm sm:text-base">
        <p>
          Quanti (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Quanti when you use our website at{" "}
          <a href="https://quanti-app.com" className="text-violet-400 underline">
            quanti-app.com
          </a>{" "}
          or our mobile application (collectively, the &quot;Service&quot;).
        </p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Information We Collect</h2>
        <p>We collect information that you provide directly to us and data generated when you use our Service:</p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li>
            <strong>Waitlist & Account Information:</strong> Email address provided during waitlist sign-up or account creation.
          </li>
          <li>
            <strong>Financial & Account Data (Plaid Integration):</strong> When you connect financial accounts, we access financial transaction data, account balances, and account details provided via our integration partner, Plaid.{" "}
            <em>We do not store or process your banking credentials (username or password) on our servers.</em> Credentials are managed securely by Plaid.
          </li>
          <li>
            <strong>Device & Usage Data:</strong> IP address, browser type, device identifier, and interaction logs required for security, diagnostics, and performance optimization.
          </li>
        </ul>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. How We Use Your Information</h2>
        <p>We use the collected information solely for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li>Providing, operating, and maintaining the Quanti platform.</li>
          <li>Processing financial data to deliver personalized financial insights and features.</li>
          <li>Communicating product updates, waitlist progress, and account support messages.</li>
          <li>Detecting and preventing fraud, security breaches, or legal violations.</li>
        </ul>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Data Sharing and Third-Party Services</h2>
        <p>
          We do not sell, rent, or trade your personal or financial data. We share information only with service providers required to operate our application:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
          <li>
            <strong>Plaid Technologies, Inc.:</strong> Used to securely connect financial accounts. Plaid&apos;s handling of your data is governed by the{" "}
            <a
              href="https://plaid.com/legal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 underline"
            >
              Plaid End User Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Cloud Infrastructure & Analytics:</strong> Vercel and secure database providers for hosting and service analytics.
          </li>
        </ul>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Data Retention and Account Deletion</h2>
        <p>
          We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy. You have the right to request the deletion of your account and associated personal data at any time by contacting us at{" "}
          <a href="mailto:brian@quanti-app.com" className="text-violet-400 underline">
            brian@quanti-app.com
          </a>
          . Upon receiving your deletion request, all associated financial connections and personal identifiers will be permanently removed from our active databases.
        </p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Data Security</h2>
        <p>
          We implement industry-standard encryption protocols (TLS/SSL in transit and AES encryption at rest) to safeguard your data. While no transmission method over the internet is completely secure, we adhere to strict financial data security standards.
        </p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Contact Us</h2>
        <p>If you have questions or concerns regarding this Privacy Policy, please contact us at:</p>
        <p className="text-zinc-400">
          <strong>Quanti</strong>
          <br />
          Email:{" "}
          <a href="mailto:brian@quanti-app.com" className="text-violet-400 underline">
            brian@quanti-app.com
          </a>
          <br />
          Website:{" "}
          <a href="https://quanti-app.com" className="text-violet-400 underline">
            quanti-app.com
          </a>
        </p>
      </section>
    </main>
  );
}
