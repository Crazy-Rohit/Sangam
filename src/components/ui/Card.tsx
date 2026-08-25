import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  framed?: boolean
}

export function Card({ children, className = '', framed = true }: CardProps) {
  return (
    <article className={`card ${framed ? 'card-framed' : ''} ${className}`.trim()}>
      {children}
    </article>
  )
}

type SectionHeaderProps = {
  letter?: string
  kicker?: string
  title: string
  description?: string
}

export function SectionHeader({ letter, kicker, title, description }: SectionHeaderProps) {
  return (
    <header className="section-header">
      {letter ? <span className="section-letter">{letter}</span> : null}
      <div>
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <h2>{title}</h2>
        {description ? <p className="section-desc">{description}</p> : null}
      </div>
    </header>
  )
}
