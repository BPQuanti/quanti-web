import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Quanti",
  description: "Delete your Quanti account and associated data.",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-[#09090B] px-6 py-16 font-sans text-[#A1A1AA] sm:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C084FC]">Account</p>
      <h1 className="mt-3 text-3xl font-bold text-[#FAFAFA]">Settings</h1>
      <p className="mt-4 max-w-2xl leading-7">
        Account deletion for the Quanti app runs from Profile, then Settings, then Delete account. That
        action revokes stored bank connections, removes chat and profile records, and deletes the login.
      </p>
      <section className="mt-8 rounded-2xl border border-[#27272A] bg-[#18181B] p-6">
        <h2 className="text-lg font-semibold text-[#FAFAFA]">Delete account</h2>
        <p className="mt-3 text-sm leading-6">
          The signed-in app sends your session to the account deletion API. Bank access tokens are
          decrypted only on the server, revoked with Plaid, and then removed with the rest of the account.
          Health samples stored for the account are deleted. The iPhone Health permission itself is turned
          off in the iOS Settings app.
        </p>
        <p className="mt-4 text-sm">
          <a href="/privacy" className="text-[#C084FC] underline">
            Privacy Policy
          </a>
        </p>
      </section>
    </main>
  );
}
