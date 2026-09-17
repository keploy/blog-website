import type { NextApiRequest, NextApiResponse } from 'next'

export default async function exit(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  // Clear preview data cookies
  if (typeof res.clearPreviewData === 'function') {
    res.clearPreviewData()
  }

  // Support draft mode if available
  if (typeof (res as any).setDraftMode === 'function') {
    ;(res as any).setDraftMode({ enable: false })
  }

  // Redirect the user back to the index page.
  res.writeHead(307, { Location: '/' })
  res.end()
}
