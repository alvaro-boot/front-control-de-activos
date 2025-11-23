'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Algo salió mal
        </h2>
        <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 btn btn-primary"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

