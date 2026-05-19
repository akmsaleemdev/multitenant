'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-600">
        {error.message || 'A server error occurred. This is often caused by an invalid DATABASE_URL on Vercel.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
      >
        Try again
      </button>
    </div>
  );
}
