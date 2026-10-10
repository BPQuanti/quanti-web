"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center text-slate-50">
      <p className="text-sm font-semibold text-indigo-300">Quanti</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Something went wrong.</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Please try again.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
