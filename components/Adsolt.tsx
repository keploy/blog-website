import { useEffect, useState } from 'react';


declare global {
  interface Window {
    adsbygoogle: any;
  }
}

type Props = {
  slotId: string;
  className?: string;
};

export default function AdSlot({ slotId, className = '' }: Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Wait for the script to load before calling adsbygoogle
    const script = document.createElement('script');
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3485005084287002";
    script.async = true;
    script.onload = () => {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    };
    document.head.appendChild(script);

    const timeout = setTimeout(() => setLoaded(true), 5000);
    return () => {
      clearTimeout(timeout);
      script.onload = null;
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {!loaded && <div className="absolute inset-0 rounded-lg skeleton-shimmer" />}

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
