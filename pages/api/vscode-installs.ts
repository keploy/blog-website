import { NextApiRequest, NextApiResponse } from 'next';

// Cache for server-side requests
let serverCache: { count: string; timestamp: number } | null = null;
const SERVER_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function formatInstallCount(count: number): string {
  if (count >= 1_000_000) {
    const millions = count / 1_000_000;
    return millions < 100
      ? `${(Math.round(millions * 10) / 10).toString().replace(/\.0$/, '')}M`
      : `${Math.round(millions)}M`;
  }
  if (count >= 100_000) {
    return `${Math.round(count / 1_000)}K`;
  }
  if (count >= 1_000) {
    return `${(Math.round((count / 1_000) * 10) / 10)
      .toString()
      .replace(/\.0$/, '')}K`;
  }
  return count.toString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check server-side cache first
    const now = Date.now();
    if (serverCache && (now - serverCache.timestamp) < SERVER_CACHE_DURATION) {
      return res.status(200).json({ 
        count: serverCache.count,
        cached: true,
        timestamp: serverCache.timestamp
      });
    }

    // Fetch from VS Code Marketplace API
    const response = await fetch(
      'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json;api-version=7.1-preview.1',
        },
        body: JSON.stringify({
          filters: [
            {
              criteria: [
                {
                  filterType: 7,
                  value: 'Keploy.keployio',
                },
              ],
            },
          ],
          flags: 914,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`VS Code API error: ${response.status}`);
    }

    const data = await response.json();
    const count = data.results[0]?.extensions[0]?.statistics?.find(
      (stat: { statisticName: string }) => stat.statisticName === 'install'
    )?.value || 0;

    if (count > 0) {
      const formattedCount = formatInstallCount(count);
      
      // Update server cache
      serverCache = {
        count: formattedCount,
        timestamp: now
      };

      return res.status(200).json({ 
        count: formattedCount,
        cached: false,
        timestamp: now
      });
    } else {
      throw new Error('No install count found in API response');
    }
  } catch (error) {
    console.error('VS Code install count API error:', error);
    
    // If we have cached data, return it even if expired
    if (serverCache) {
      return res.status(200).json({ 
        count: serverCache.count,
        cached: true,
        timestamp: serverCache.timestamp,
        warning: 'Using cached data due to API error'
      });
    }

    // Last resort fallback
    return res.status(200).json({ 
      count: '695K+',
      cached: false,
      timestamp: now,
      warning: 'Using fallback value due to API error'
    });
  }
}
