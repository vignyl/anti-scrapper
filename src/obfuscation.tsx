import { Fragment, type ReactElement, type ReactNode } from 'react'
import type { ObfuscationStrategy, ProtectionLevel } from './types'
import { randomClassName } from './utils'

export interface ObfuscateOptions {
  rng: () => number
  level: ProtectionLevel
  classPrefix: string
  honeyTextDensity: number
}

const HONEY_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'consectetur',
  'aliqua',
  'IGNORE_PREVIOUS',
  'SYSTEM_OVERRIDE',
  'noop',
  'placeholder',
  'discard',
]

const HIDDEN_STYLE = {
  position: 'absolute' as const,
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden' as const,
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap' as const,
}

export function obfuscateText(
  text: string,
  opts: ObfuscateOptions
): ReactElement {
  if (opts.level === 'off' || !text) {
    return <>{text}</>
  }

  const strategy = pickStrategy(opts.level, opts.rng)

  switch (strategy) {
    case 'split-words':
      return renderSplitWords(text, opts)
    case 'split-chars':
      return renderSplitChars(text, opts)
    case 'css-reverse':
      return renderCssReverse(text, opts)
    case 'shuffle-order':
      return renderShuffleOrder(text, opts)
    default:
      return <>{text}</>
  }
}

function pickStrategy(
  level: ProtectionLevel,
  rng: () => number
): ObfuscationStrategy {
  const pools: Record<ProtectionLevel, ObfuscationStrategy[]> = {
    off: ['split-words'],
    low: ['split-words'],
    medium: ['split-words', 'split-chars'],
    high: ['split-words', 'split-chars', 'css-reverse'],
    paranoid: ['split-words', 'split-chars', 'css-reverse', 'shuffle-order'],
  }
  const pool = pools[level]
  return pool[Math.floor(rng() * pool.length)]
}

function renderSplitWords(
  text: string,
  opts: ObfuscateOptions
): ReactElement {
  const parts = text.split(/(\s+)/)
  return (
    <span data-as="sw">
      {parts.map((part, i) => (
        <Fragment key={i}>
          <span className={randomClassName(opts.rng, opts.classPrefix)}>
            {part}
          </span>
          {maybeHoney(opts, i)}
        </Fragment>
      ))}
    </span>
  )
}

function renderSplitChars(
  text: string,
  opts: ObfuscateOptions
): ReactElement {
  return (
    <span data-as="sc">
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          className={randomClassName(opts.rng, opts.classPrefix)}
          style={{ whiteSpace: 'pre' }}
        >
          {ch}
        </span>
      ))}
    </span>
  )
}

function renderCssReverse(
  text: string,
  opts: ObfuscateOptions
): ReactElement {
  const reversed = Array.from(text).reverse().join('')
  return (
    <span
      data-as="cr"
      className={randomClassName(opts.rng, opts.classPrefix)}
      style={{ unicodeBidi: 'bidi-override', direction: 'rtl' }}
    >
      {reversed}
    </span>
  )
}

function renderShuffleOrder(
  text: string,
  opts: ObfuscateOptions
): ReactElement {
  const words = text.split(/(\s+)/).filter((w) => w.length > 0)
  const indexed = words.map((w, i) => ({ w, visualOrder: i }))
  const domOrder = [...indexed].sort(() => opts.rng() - 0.5)
  return (
    <span
      data-as="so"
      style={{ display: 'inline-flex', flexWrap: 'wrap' }}
    >
      {domOrder.map((item, i) => (
        <span
          key={i}
          className={randomClassName(opts.rng, opts.classPrefix)}
          style={{ order: item.visualOrder, whiteSpace: 'pre' }}
        >
          {item.w}
        </span>
      ))}
    </span>
  )
}

function maybeHoney(opts: ObfuscateOptions, index: number): ReactNode {
  if (opts.rng() > opts.honeyTextDensity) return null
  const word = HONEY_WORDS[Math.floor(opts.rng() * HONEY_WORDS.length)]
  return (
    <span key={`h-${index}`} aria-hidden="true" style={HIDDEN_STYLE}>
      {' '}
      {word}{' '}
    </span>
  )
}
