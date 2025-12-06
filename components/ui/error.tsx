'use client';
/**
 * Error components for E-Track
 * Reusable error states and error boundaries
 */

import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
  onHome?: () => void;
  className?: string;
}

export function ErrorPage({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  showRetry = true,
  showHome = true,
  onRetry,
  onHome,
  className,
}: ErrorPageProps) {
  return (
    <div className={cn('flex min-h-screen items-center justify-center', className)}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-center space-x-4">
          {showRetry && (
            <button
              onClick={onRetry}
              className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          )}
          {showHome && (
            <button
              onClick={onHome}
              className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <Home className="h-4 w-4" />
              <span>Go Home</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ErrorCardProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ErrorCard({
  title = 'Error',
  message = 'Something went wrong',
  showRetry = false,
  onRetry,
  className,
}: ErrorCardProps) {
  return (
    <div className={cn('rounded-lg border border-red-200 bg-red-50 p-4', className)}>
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <ErrorPage
          title="Application Error"
          message={this.state.error?.message || 'An unexpected error occurred'}
          onRetry={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

interface NotFoundPageProps {
  title?: string;
  message?: string;
  showHome?: boolean;
  onHome?: () => void;
}

export function NotFoundPage({
  title = 'Page Not Found',
  message = "The page you're looking for doesn't exist.",
  showHome = true,
  onHome,
}: NotFoundPageProps) {
  const router = useRouter();
  
  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <AlertTriangle className="h-8 w-8 text-gray-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mb-6 text-gray-600">{message}</p>
        {showHome && (
          <button
            onClick={handleHome}
            className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </button>
        )}
      </div>
    </div>
  );
}
