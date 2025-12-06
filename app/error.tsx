/**
 * Global error page for E-Track
 * Shows when there's an error
 */

'use client';

import { ErrorPage } from '@/components/ui/error';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const handleRetry = () => {
    reset();
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <ErrorPage
      title="Something went wrong"
      message={error.message || 'An unexpected error occurred. Please try again.'}
      onRetry={handleRetry}
      onHome={handleHome}
    />
  );
}
