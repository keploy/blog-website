import { ReactNode } from 'react'

export interface IntroProps {
  title?: string
  description?: ReactNode | string
}

export default function Intro({ title = 'Blog.', description }: IntroProps) {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12" aria-label="Introduction">
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        {title}
      </h1>
      {description && (
        <div className="text-center md:text-left text-lg mt-5 md:pl-8">
          {description}
        </div>
      )}
    </section>
  )
}
