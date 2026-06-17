import type { ReactNode } from 'react'

export interface HoneyTextProps {
  children: ReactNode
}

export function HoneyText({ children }: HoneyTextProps) {
  return (
    <span
      aria-hidden="true"
      data-as="ht"
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
