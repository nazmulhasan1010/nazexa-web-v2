'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
      <h2 className="mb-4 text-xl font-bold text-red-600">Something went wrong!</h2>
      <p className="mb-6 text-gray-600">{error.message}</p>
      <button
        onClick={() => reset()}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
