import { ReactNode } from 'react'
import Alert from './alert'
import Footer from './footer'
import Meta, { MetaProps } from './meta'

export interface LayoutProps {
  preview?: boolean
  children: ReactNode
  meta?: MetaProps
}

export default function Layout({ preview = false, children, meta }: LayoutProps) {
  return (
    <>
      <Meta {...meta} />
      <div className="min-h-screen">
        {preview && <Alert preview={preview} />}
        <main>{children}</main>
      </div>
      <Footer />
    </>
  )
}
