import {
  useMemo,
  createElement,
  type ElementType,
  type ReactNode,
} from 'react'
import { useAntiScrapper } from './context'
import { obfuscateText } from './obfuscation'
import { embedWatermark } from './watermark'
import { createRng, hashSeed } from './utils'
import type { ProtectionLevel } from './types'

export interface ProtectedRegionProps {
  children: string
  level?: ProtectionLevel
  as?: ElementType
  className?: string
  fallback?: ReactNode
  seoFallback?: ReactNode
  watermark?: string
}

export function ProtectedRegion({
  children,
  level,
  as: Tag = 'span',
  className,
  fallback = null,
  seoFallback,
  watermark,
}: ProtectedRegionProps) {
  const config = useAntiScrapper()
  const effectiveLevel = level ?? config.level
  const detection = config.detection

  const sessionSeed = useMemo(() => {
    if (config.seed) return hashSeed(config.seed)
    return hashSeed(children)
  }, [config.seed, children])

  if (config.debug) {
    return createElement(
      Tag,
      {
        className,
        'data-as-debug': true,
        style: { outline: '2px dashed magenta', outlineOffset: '2px' },
      },
      children
    )
  }

  if (!config.hydrated) {
    const noscriptContent =
      seoFallback !== undefined ? seoFallback : children
    return createElement(
      Tag,
      { className, suppressHydrationWarning: true },
      createElement(
        'span',
        {
          'aria-hidden': 'true',
          style: { display: 'none' },
        },
        ' '
      ),
      createElement('noscript', null, noscriptContent)
    )
  }

  if (detection?.isAllowedBot) {
    return createElement(Tag, { className }, children)
  }

  if (config.accessibilitySafe && detection?.isAccessibility) {
    return createElement(Tag, { className }, children)
  }

  if (detection?.isBot && !detection.isAllowedBot) {
    return createElement(Tag, { className }, fallback)
  }

  const textToRender = watermark
    ? embedWatermark(children, watermark)
    : children

  const rng = createRng(
    sessionSeed ^ Math.floor(Math.random() * 0x7fffffff)
  )

  return createElement(
    Tag,
    { className },
    obfuscateText(textToRender, {
      rng,
      level: effectiveLevel,
      classPrefix: config.classPrefix,
      honeyTextDensity: config.honeyTextDensity,
    })
  )
}
