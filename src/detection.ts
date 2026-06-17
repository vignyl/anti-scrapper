import type { BotDetectionResult, BotSignals } from './types'
import { isSSR } from './utils'

const KNOWN_BOTS: RegExp[] = [
  /Googlebot/i,
  /Bingbot/i,
  /Slurp/i,
  /DuckDuckBot/i,
  /Baiduspider/i,
  /YandexBot/i,
  /facebot/i,
  /facebookexternalhit/i,
  /LinkedInBot/i,
  /Twitterbot/i,
  /Applebot/i,
  /ClaudeBot/i,
  /anthropic-ai/i,
  /GPTBot/i,
  /CCBot/i,
  /PerplexityBot/i,
  /Bytespider/i,
  /Amazonbot/i,
]

export function detectBot(allowedBots: string[] = []): BotDetectionResult {
  if (isSSR()) {
    return {
      isBot: false,
      isHeadless: false,
      isAllowedBot: false,
      isAccessibility: false,
      score: 0,
      signals: emptySignals(),
    }
  }

  const ua = navigator.userAgent || ''
  const allowedMatch = allowedBots.find((b) =>
    ua.toLowerCase().includes(b.toLowerCase())
  )
  const matchedBot =
    KNOWN_BOTS.find((re) => re.test(ua))?.source.replace(/\\/g, '') ?? null

  const signals: BotSignals = {
    hasWebdriver: Boolean((navigator as Navigator & { webdriver?: boolean }).webdriver),
    hasPlugins: navigator.plugins ? navigator.plugins.length > 0 : false,
    hasLanguages: Array.isArray(navigator.languages)
      ? navigator.languages.length > 0
      : false,
    permissionsAnomaly: detectPermissionsAnomaly(),
    chromeRuntime: detectChromeRuntime(),
    userAgentMatch: matchedBot,
    prefersReducedMotion: safeMatchMedia('(prefers-reduced-motion: reduce)'),
    forcedColors: safeMatchMedia('(forced-colors: active)'),
  }

  let score = 0
  if (signals.hasWebdriver) score += 0.55
  if (signals.permissionsAnomaly) score += 0.15
  if (matchedBot) score += 0.8
  score = Math.min(score, 1)

  const isAllowedBot = Boolean(allowedMatch)
  const isHeadless = signals.hasWebdriver
  const isAccessibility = signals.prefersReducedMotion || signals.forcedColors

  return {
    isBot: score > 0.5 || isAllowedBot,
    isHeadless,
    isAllowedBot,
    isAccessibility,
    score,
    signals,
  }
}

function emptySignals(): BotSignals {
  return {
    hasWebdriver: false,
    hasPlugins: false,
    hasLanguages: false,
    permissionsAnomaly: false,
    chromeRuntime: false,
    userAgentMatch: null,
    prefersReducedMotion: false,
    forcedColors: false,
  }
}

function safeMatchMedia(query: string): boolean {
  try {
    return Boolean(window.matchMedia && window.matchMedia(query).matches)
  } catch {
    return false
  }
}

function detectPermissionsAnomaly(): boolean {
  try {
    const p = (navigator as Navigator & { permissions?: unknown }).permissions
    return !p
  } catch {
    return false
  }
}

function detectChromeRuntime(): boolean {
  try {
    const chrome = (window as Window & { chrome?: { runtime?: unknown } }).chrome
    return Boolean(chrome && chrome.runtime)
  } catch {
    return false
  }
}
