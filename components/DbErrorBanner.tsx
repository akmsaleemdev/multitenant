interface DbErrorBannerProps {
  message?: string | null;
}

export function DbErrorBanner({ message }: DbErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-200">
      <p className="font-medium">Database connection failed</p>
      <p className="mt-1 text-red-300/90">
        On Vercel, add <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> from
        Supabase → Settings → API (secret key). Also set{' '}
        <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>. Do not use{' '}
        <code className="font-mono text-xs">db.*.supabase.co:5432</code> on serverless — it often
        fails with ENOTFOUND.
      </p>
      <p className="mt-2 font-mono text-xs opacity-80">{message}</p>
    </div>
  );
}
