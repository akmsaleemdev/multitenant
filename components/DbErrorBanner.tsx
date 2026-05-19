interface DbErrorBannerProps {
  message?: string | null;
}

export function DbErrorBanner({ message }: DbErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      <p className="font-medium">Database connection failed</p>
      <p className="mt-1 text-red-800">
        Check <code className="font-mono text-xs">DATABASE_URL</code> on Vercel. If your password
        contains <code className="font-mono text-xs">@</code> or <code className="font-mono text-xs">$</code>,
        URL-encode it (e.g. <code className="font-mono text-xs">@</code> →{' '}
        <code className="font-mono text-xs">%40</code>).
      </p>
      <p className="mt-2 font-mono text-xs opacity-80">{message}</p>
    </div>
  );
}
