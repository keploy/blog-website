import { CMS_NAME, CMS_URL } from '../lib/constants'

export interface IntroProps {
  title?: string;
  tagline?: string;
  className?: string;
}

export default function Intro({
  title = 'Blog.',
  tagline = 'A statically generated blog example using Next.js and',
  className = '',
}: IntroProps) {
  return (
    <section className={lex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12 }>
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        {title}
      </h1>
      <h4 className="text-center md:text-left text-lg mt-5 md:pl-8">
        {tagline}{' '}
        <a
          href={CMS_URL}
          className="underline hover:text-success duration-200 transition-colors"
        >
          {CMS_NAME}
        </a>
        .
      </h4>
    </section>
  )
}
