import Alert from './alert'
import Footer from './footer'
import Meta, { MetaProps } from './meta'

export interface LayoutProps {
  preview?: boolean;
  children: React.ReactNode;
  metaProps?: MetaProps;
  className?: string;
}

export default function Layout({ preview, children, metaProps, className = '' }: LayoutProps) {
  return (
    <>
      <Meta {...metaProps} />
      <div className={min-h-screen }>
        <Alert preview={preview} />
        <main>{children}</main>
      </div>
      <Footer />
    </>
  )
}
