import Image from 'next/image'

interface LogoProps {
  // 'dark'  = logo as-is (black text + red icon) for light/white backgrounds
  // 'light' = logo CSS-inverted to all-white for dark backgrounds like the footer
  variant?: 'dark' | 'light'
  // Rendered height in px (width scales from natural 247:120 aspect ratio)
  height?: number
  className?: string
}

export function ElectricMallLogo({ variant = 'dark', height = 44, className = '' }: LogoProps) {
  const naturalW = 247
  const naturalH = 120
  const renderW  = Math.round((height * naturalW) / naturalH)

  return (
    <Image
      src="/images/electricmall-logo-v2.png"
      alt="Electric Mall Nigeria"
      width={renderW}
      height={height}
      priority
      className={`${variant === 'light' ? 'brightness-0 invert' : ''} ${className}`.trim()}
      style={{ height, width: renderW }}
    />
  )
}
