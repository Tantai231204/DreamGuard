import { LoadingSpinner } from "./LoadingSpinner";

/* ─── PageLoader ───────────────────────────────────────────────── */
export function PageLoader() {
  return (
    <LoadingSpinner
      fullScreen
      size="lg"
      text={[
        'Preparing your DreamGuard experience',
        'Loading your profile...',
        'Almost ready...',
        'Securing your space...',
      ]}
    />
  );
}