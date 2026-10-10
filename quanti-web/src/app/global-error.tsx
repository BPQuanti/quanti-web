"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-full bg-[#0b0712] text-[#f8fafc]">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Something went wrong.</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Please try again.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
