import type { ReactNode } from 'react'

type BadgeProps = {
  tone?: 'brass' | 'forest' | 'ink' | 'warn'
  children: ReactNode
}

export function Badge({ tone = 'brass', children }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
