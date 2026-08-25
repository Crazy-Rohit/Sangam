type BrandLogoProps = {
  size?: number
  /** `mark` is the emblem alone; `lockup` includes the SANGAM wordmark. */
  variant?: 'mark' | 'lockup'
  className?: string
}

export function BrandLogo({ size = 38, variant = 'mark', className = '' }: BrandLogoProps) {
  return (
    <img
      src={variant === 'lockup' ? '/sangam-logo.png' : '/sangam-mark.png'}
      alt="Sangam"
      width={size}
      className={`brand-logo brand-logo-${variant} ${className}`.trim()}
    />
  )
}
