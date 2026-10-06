import Link from "next/link";

const SUPPORT_EMAIL = "brian@quanti-app.com";

const linkClass = "transition-colors hover:text-violet-400";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#2d2442] px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-sm text-zinc-400 sm:flex-row sm:items-center">
        <div className="text-center font-normal sm:text-left">
          <p>© 2026 Quanti Technologies LLC. All rights reserved.</p>
          <p className="mt-1">
            Support:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-5">
          <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
            Contact
          </a>
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
          <Link href="/terms" className={linkClass}>
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
