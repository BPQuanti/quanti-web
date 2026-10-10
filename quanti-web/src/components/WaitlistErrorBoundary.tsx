"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export default class WaitlistErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Waitlist UI failed", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-4 text-left">
          <p className="text-sm font-semibold text-rose-200">Something went wrong.</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">Please try again.</p>
          <button
            type="button"
            onClick={() => this.setState({ failed: false })}
            className="mt-3 inline-flex h-10 items-center rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm font-medium text-slate-100"
          >
            Reset form
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
