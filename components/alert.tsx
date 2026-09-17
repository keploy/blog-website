import Container from './container'
import cn from 'classnames'

export interface AlertProps {
  preview?: boolean
  className?: string
}

export default function Alert({ preview = false, className = '' }: AlertProps) {
  if (!preview) {
    return null
  }

  return (
    <div
      role="alert"
      className={cn('border-b bg-accent-7 border-accent-7 text-white', className)}
    >
      <Container>
        <div className="py-2 text-center text-sm">
          This is a page preview.{' '}
          <a
            href="/api/exit-preview"
            className="underline hover:text-cyan duration-200 transition-colors"
          >
            Click here
          </a>{' '}
          to exit preview mode.
        </div>
      </Container>
    </div>
  )
}
