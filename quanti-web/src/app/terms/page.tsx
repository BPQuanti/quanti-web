export const metadata = {
  title: "Terms of Service | Quanti",
  description: "Terms of Service for Quanti app and quanti-app.com.",
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-300 py-16 px-6 sm:px-12 max-w-4xl mx-auto font-sans leading-relaxed">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-sm text-zinc-500 mb-8">Last Updated: October 5, 2026</p>
      <section className="space-y-6 text-sm sm:text-base">
        <p>
          Welcome to Quanti. By accessing our website at{" "}
          <a href="https://quanti-app.com" className="text-violet-400 underline">
            quanti-app.com
          </a>{" "}
          or using the Quanti mobile application (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
        </p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Description of Service</h2>
        <p>
          Quanti provides financial analytics, tracking, and account aggregation tools designed to help users manage their financial information.
        </p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Eligibility & Registration</h2>
        <p>
          You must be at least 18 years of age to use the Service. By registering or joining our waitlist, you represent and warrant that the information you provide is accurate, complete, and current.
        </p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Third-Party Financial Data (Plaid)</h2>
        <p>
          Quanti uses Plaid Technologies, Inc. (&quot;Plaid&quot;) to connect with your financial accounts. By using our financial integration tools, you grant Quanti and Plaid the right, power, and authority to act on your behalf to access and retrieve your account information from the relevant financial institution.
        </p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Intellectual Property</h2>
        <p>
          All content, visual interfaces, code, graphics, and software associated with Quanti are the intellectual property of Quanti. You may not copy, modify, distribute, or reverse engineer any part of our Service without prior written authorization.
        </p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Disclaimer of Financial Advice</h2>
        <p>
          The content and tools provided by Quanti are for informational and educational purposes only and do not constitute financial, investment, legal, or tax advice. You are responsible for evaluating your financial decisions.
        </p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Quanti shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.
        </p>
        <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Contact Information</h2>
        <p>If you have questions about these Terms, please reach out to us:</p>
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
