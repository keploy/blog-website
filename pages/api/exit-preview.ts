import type { NextApiRequest, NextApiResponse } from 'next'

export default async function exit(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  // Exit Draft/Preview Mode
  if (typeof res.setDraftMode === 'function') {
    res.setDraftMode({ enable: false })
  } else if (typeof (res as any).clearPreviewData === 'function') {
    ;(res as any).clearPreviewData()
  }

  // Redirect the user back to the index page.
  res.writeHead(307, { Location: '/' })
  res.end()
}

