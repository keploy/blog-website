// components/AdSlot.tsx
import { useEffect, useState } from 'react';

interface AdSlotProps {
  slotId: string;
  className?: string;
  layout?: string;
  layoutKey?: string;
  format?: string;
  fullWidthResponsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: {
      push: (params: unknown) => void;
      loaded?: boolean;
    };
  }
}

export default function AdSlot({
  slotId,
  className = '',
  layout = '',
  layoutKey = '',
  format = 'auto',
  fullWidthResponsive = true,
}: AdSlotProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Initialize adsbygoogle if it doesn't exist
        window.adsbygoogle = window.adsbygoogle || { push: () => {}, loaded: false };
        
        // Only push if not already loaded
        if (!window.adsbygoogle.loaded) {
          window.adsbygoogle.push({});
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }

    const timeout = setTimeout(() => setLoaded(true), 5000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg" />
      )}

      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3485005084287002"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-ad-layout={layout}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive={fullWidthResponsive.toString()}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}