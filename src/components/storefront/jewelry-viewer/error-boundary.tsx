"use client";

import { Component, type ReactNode } from "react";

export class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("3D model failed to load:", error);
    this.props.onError?.();
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
