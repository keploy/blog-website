import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: { push: (params: unknown) => void }[];
  }
}

interface AdBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  adSlot: string;
  adFormat?: string;
}

const AdBanner = ({ 
  adSlot,
  adFormat = "auto",
  ...props 
}: AdBannerProps) => {
  useEffect(() => {
    const loadAd = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({
          push(params: unknown): void {
          }
        });
      } catch (err) {
        console.error("AdSense error:", err);
      }
    };

    // Check if adsbygoogle script is loaded
    if (window.adsbygoogle) {
      loadAd();
    } else {
      const timer = setTimeout(() => {
        if (window.adsbygoogle) {
          loadAd();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="w-full my-4">
      <div
        className="adsbygoogle"
        style={{ 
          display: 'block',
          minHeight: '90px',
          width: '100%',
          overflow: 'hidden'
        }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        {...props}/>
    </div>
  );
};

export default AdBanner;