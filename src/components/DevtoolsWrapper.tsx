import React from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Error boundary component to catch devtools popup errors
class DevtoolsErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.warn("ReactQueryDevtools error caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return null; // Silently fail, devtools won't render
        }

        return this.props.children;
    }
}

export default function DevtoolsWrapper() {
    return (
        <DevtoolsErrorBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
        </DevtoolsErrorBoundary>
    );
}