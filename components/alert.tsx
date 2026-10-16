import Container from './container'
import { EXAMPLE_PATH } from '../lib/constants'

export interface AlertProps {
  preview?: boolean;
  message?: string;
  className?: string;
}

export default function Alert({ preview, message, className = '' }: AlertProps) {
  if (!preview && !message) return null;
  return (
    <div
      className={order-b  }
    >
      <Container>
        <div className="py-2 text-center text-sm">
          {preview ? (
            <>
              This is a page preview.{' '}
              <a
                href="/api/exit-preview"
                className="underline hover:text-cyan duration-200 transition-colors"
              >
                Click here
              </a>{' '}
              to exit preview mode.
            </>
          ) : (
            <span>{message}</span>
          )}
        </div>
      </Container>
    </div>
  )
}
