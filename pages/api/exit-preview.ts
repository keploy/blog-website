import type { NextApiRequest, NextApiResponse } from 'next'

export default async function exit(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  if (typeof res.clearPreviewData === 'function') {
    res.clearPreviewData()
  }

  if (typeof (res as any).setDraftMode === 'function') {
    ;(res as any).setDraftMode({ enable: false })
  }

  res.writeHead(307, { Location: '/' })
  res.end()
}
