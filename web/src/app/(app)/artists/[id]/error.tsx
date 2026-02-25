'use client';

import { RouteError } from '@/components/shared/route-error';

export default function ArtistDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} title="Failed to load artist profile" />;
}
