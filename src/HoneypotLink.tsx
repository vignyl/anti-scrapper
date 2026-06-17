import type { MouseEvent } from 'react'
import { useAntiScrapper } from './context'

export interface HoneypotLinkProps {
  href?: string
  onTrigger?: () => void
  label?: string
}

export function HoneypotLink({
  href = '/__honeypot__',
  onTrigger,
  label = 'Do not follow',
}: HoneypotLinkProps) {
  const { fireHoneypot } = useAntiScrapper()

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    fireHoneypot({ source: 'link', href, timestamp: Date.now() })
    onTrigger?.()
  }

  return (
    <a
      href={href}
      aria-hidden="true"
      tabIndex={-1}
      rel="nofollow noindex"
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      {label}
    </a>
  )
}
