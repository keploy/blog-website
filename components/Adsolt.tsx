import { useEffect, useState } from 'react';

type Props = {
  /** Google-AdSense slot id, e.g. `"1234567890"` */
  slotId: string;
  className?: string;
};

/**
 * Responsive AdSense slot with shimmering skeleton while the ad loads.
 */
export default function AdSlot({ slotId, className = '' }: Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}

    // Fallback: if Google never fires onLoad, stop shimmering after 5 s
    const t = setTimeout(() => setLoaded(true), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* skeleton */}
      {!loaded && (
        <div className="absolute inset-0 rounded-lg skeleton-shimmer" />
      )}

      <ins
        className="adsbygoogle block w-full h-full"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}   
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}