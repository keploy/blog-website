import type { NextApiRequest, NextApiResponse } from "next";

type VSMarketResponse = {
  results?: Array<{
    extensions?: Array<{
      statistics?: Array<{
        statisticName: string;
        value: number;
      }>;
    }>;
  }>;
};

type Data = {
  installs: number;
  cachedAt: string;
};

const EXTENSION_ID = "Keploy.keployio";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { error: string }>
) {
  try {
    const apiRes = await fetch(
      "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json;api-version=7.1-preview.1",
        },
        body: JSON.stringify({
          filters: [
            {
              criteria: [
                {
                  filterType: 7,
                  value: EXTENSION_ID,
                },
              ],
            },
          ],
          flags: 914,
        }),
        cache: "no-store",
      }
    );

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: "Failed to fetch installs" });
    }

    const data: VSMarketResponse = await apiRes.json();
    const installs =
      data?.results?.[0]?.extensions?.[0]?.statistics?.find(
        (s) => s.statisticName === "install"
      )?.value || 0;

    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
    return res.status(200).json({ installs, cachedAt: new Date().toISOString() });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected error" });
  }
}


