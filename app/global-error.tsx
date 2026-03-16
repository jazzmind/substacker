'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <h2>Something went wrong</h2>
          <p>{error.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1rem',
              marginTop: '1rem',
              cursor: 'pointer',
              borderRadius: '0.25rem',
              border: '1px solid #ccc',
              background: '#f5f5f5',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
