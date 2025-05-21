"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center space-y-6 text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h2 className="text-3xl font-semibold text-primary">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground">
          We encountered an unexpected issue. Please try again, or contact support if the problem persists.
        </p>
        {error?.message && (
            <p className="text-sm text-destructive/80 bg-destructive/10 p-3 rounded-md">
                Error details: {error.message}
            </p>
        )}
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          size="lg"
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
