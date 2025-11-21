import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google AdSense Script */}
        {/* <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3485005084287002`}
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('AdSense script failed to load', e);
          }}
        /> */}
        
        {/* Critical CSS for skeleton loaders - shows before React loads */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Show skeleton immediately while HTML/JS loads */
          #__next:empty {
            min-height: 100vh;
            background: white;
          }
          
          #__next:empty::before {
            content: '';
            display: block;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
            animation: fadeIn 0.3s ease-in;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .loading-skeleton {
            display: block;
          }
          
          body.hydrated .loading-skeleton {
            display: none;
          }
          
          .skeleton-shimmer {
            animation: shimmer 1.5s ease-in-out infinite;
            background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
            background-size: 200% 100%;
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .skeleton-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem;
          }
          
          .skeleton-header {
            height: 72px;
            background: #1a1a1a;
            margin-bottom: 2rem;
          }
          
          .skeleton-hero {
            background: #f5f5f5;
            border: 1px solid #e5e5e5;
            border-radius: 0.5rem;
            padding: 2rem;
            margin-bottom: 3rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
          
          @media (max-width: 768px) {
            .skeleton-hero {
              grid-template-columns: 1fr;
            }
          }
          
          .skeleton-hero-img {
            background: #e0e0e0;
            border-radius: 0.5rem;
            aspect-ratio: 16/9;
          }
          
          .skeleton-hero-content {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .skeleton-title {
            height: 3rem;
            background: #e0e0e0;
            border-radius: 0.25rem;
            width: 80%;
          }
          
          .skeleton-title.small {
            height: 2rem;
            width: 60%;
          }
          
          .skeleton-text {
            height: 1rem;
            background: #e0e0e0;
            border-radius: 0.25rem;
          }
          
          .skeleton-text.short {
            width: 50%;
          }
          
          .skeleton-text.medium {
            width: 75%;
          }
          
          .skeleton-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
          }
          
          .skeleton-card {
            background: white;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .skeleton-card-img {
            background: #e0e0e0;
            aspect-ratio: 16/9;
          }
          
          .skeleton-card-content {
            padding: 1.5rem;
          }
          
          .skeleton-section-title {
            height: 2.5rem;
            background: linear-gradient(to right, #fed7aa 0%, #fef3c7 100%);
            background-size: 100% 20px;
            background-repeat: no-repeat;
            background-position: left bottom;
            width: max-content;
            margin-bottom: 2rem;
            padding: 0.5rem 0;
            font-size: 2rem;
            font-weight: bold;
            color: transparent;
            border-radius: 0.25rem;
          }
          
          .skeleton-section-title::after {
            content: 'Loading Stories...';
            position: absolute;
            color: #333;
          }
        `}} />
      </Head>
      <body>
        {/* Skeleton HTML that shows IMMEDIATELY when page loads */}
        <div id="initial-skeleton" style={{
          display: 'block',
          minHeight: '100vh',
          background: 'white'
        }}>
          <div style={{
            height: '72px',
            background: '#1a1a1a',
            marginBottom: '2rem'
          }}></div>
          
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem'
          }}>
            {/* Hero skeleton */}
            <div style={{
              background: '#f5f5f5',
              border: '1px solid #e5e5e5',
              borderRadius: '0.5rem',
              padding: '2rem',
              marginBottom: '3rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem'
            }}>
              <div className="skeleton-shimmer" style={{
                background: '#e0e0e0',
                borderRadius: '0.5rem',
                aspectRatio: '16/9'
              }}></div>
              <div>
                <div className="skeleton-shimmer" style={{
                  height: '3rem',
                  background: '#e0e0e0',
                  borderRadius: '0.25rem',
                  width: '80%',
                  marginBottom: '1rem'
                }}></div>
                <div className="skeleton-shimmer" style={{
                  height: '3rem',
                  background: '#e0e0e0',
                  borderRadius: '0.25rem',
                  width: '70%',
                  marginBottom: '2rem'
                }}></div>
                <div className="skeleton-shimmer" style={{
                  height: '1rem',
                  background: '#e0e0e0',
                  borderRadius: '0.25rem',
                  marginBottom: '0.5rem'
                }}></div>
                <div className="skeleton-shimmer" style={{
                  height: '1rem',
                  background: '#e0e0e0',
                  borderRadius: '0.25rem',
                  marginBottom: '0.5rem'
                }}></div>
                <div className="skeleton-shimmer" style={{
                  height: '1rem',
                  background: '#e0e0e0',
                  borderRadius: '0.25rem',
                  width: '75%'
                }}></div>
              </div>
            </div>
            
            {/* Section title */}
            <div style={{
              height: '2.5rem',
              width: '300px',
              marginBottom: '2rem',
              background: 'linear-gradient(to right, #fed7aa 0%, #fef3c7 100%)',
              backgroundSize: '100% 20px',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left bottom'
            }}></div>
            
            {/* Grid of cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{
                  background: 'white',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  <div className="skeleton-shimmer" style={{
                    background: '#e0e0e0',
                    aspectRatio: '16/9'
                  }}></div>
                  <div style={{ padding: '1.5rem' }}>
                    <div className="skeleton-shimmer" style={{
                      height: '2rem',
                      background: '#e0e0e0',
                      borderRadius: '0.25rem',
                      width: '60%',
                      marginBottom: '0.75rem'
                    }}></div>
                    <div className="skeleton-shimmer" style={{
                      height: '1rem',
                      background: '#e0e0e0',
                      borderRadius: '0.25rem',
                      marginBottom: '0.5rem'
                    }}></div>
                    <div className="skeleton-shimmer" style={{
                      height: '1rem',
                      background: '#e0e0e0',
                      borderRadius: '0.25rem',
                      marginBottom: '0.5rem'
                    }}></div>
                    <div className="skeleton-shimmer" style={{
                      height: '1rem',
                      background: '#e0e0e0',
                      borderRadius: '0.25rem',
                      width: '50%'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Main />
        <NextScript />
        
        {/* Hide initial skeleton once React loads */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            function hideSkeleton() {
              var skeleton = document.getElementById('initial-skeleton');
              if (skeleton) {
                skeleton.style.display = 'none';
              }
              document.body.classList.add('hydrated');
            }
            if (document.readyState === 'complete') {
              hideSkeleton();
            } else {
              window.addEventListener('load', hideSkeleton);
            }
          })();
        `}} />
      </body>
    </Html>
  );
}
