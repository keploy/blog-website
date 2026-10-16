import React from 'react'

export interface ShareButtonProps {
  title?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({ title = '', url = '', className = '' }: ShareButtonProps) {
  const shareText = title ? encodeURIComponent(title) : '';
  const shareUrl = url ? encodeURIComponent(url) : '';

  return (
    <div className={lex items-center gap-2 }>
      <a
        href={https://twitter.com/intent/tweet?text=&url=}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
        className="text-gray-500 hover:text-orange-500 transition-colors duration-150 p-2 rounded-full border border-gray-200 hover:border-orange-400"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a
        href={https://www.linkedin.com/sharing/share-offsite/?url=}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="text-gray-500 hover:text-blue-600 transition-colors duration-150 p-2 rounded-full border border-gray-200 hover:border-blue-400"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      </a>
    </div>
  )
}
