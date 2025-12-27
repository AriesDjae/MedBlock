import React, { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center text-white">
          <div className="p-6 rounded-xl bg-white/10">
            <h1 className="text-2xl font-bold">Terjadi error!!</h1>
            <p className="text-white/80">Cek Console untuk detail.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
