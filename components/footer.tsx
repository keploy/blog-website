import Container from './container'
import { EXAMPLE_PATH } from '../lib/constants'

export interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={g-accent-1 border-t border-accent-2 }>
      <Container>
        <div className="py-28 flex flex-col lg:flex-row items-center">
          <h3 className="text-4xl lg:text-5xl font-bold tracking-tighter leading-tight text-center lg:text-left mb-10 lg:mb-0 lg:pr-4 lg:w-1/2">
            Built with Next.js & Keploy.
          </h3>
          <div className="flex flex-col sm:flex-row justify-center items-center lg:pl-4 lg:w-1/2">
            <a
              href="https://keploy.io/docs"
              className="mx-3 bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-3 px-12 lg:px-8 duration-200 transition-colors mb-6 sm:mb-0 rounded-md"
            >
              Read Documentation
            </a>
            <a
              href={https://github.com/keploy/keploy}
              className="mx-3 font-bold hover:underline"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
