import { useEffect, useState } from 'react';

type Props = {
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
      {!loaded && (
        <div className="absolute inset-0 rounded-lg skeleton-shimmer" />
      )}

      <ins
        className="adsbygoogle block w-full h-full"
        style={{ display: 'block' }}
        data-ad-client="pub-3485005084287002" 
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}