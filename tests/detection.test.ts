import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { detectBot } from '../src/detection'

describe('detectBot', () => {
  let originalUserAgent: string

  beforeEach(() => {
    originalUserAgent = navigator.userAgent
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    })
  })

  function setUA(ua: string) {
    Object.defineProperty(navigator, 'userAgent', {
      value: ua,
      configurable: true,
    })
  }

  it('marque les Googlebot comme allowed bot si listé', () => {
    setUA(
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    )
    const result = detectBot(['Googlebot'])
    expect(result.isAllowedBot).toBe(true)
    expect(result.isBot).toBe(true)
  })

  it("ne marque pas un user-agent humain comme bot", () => {
    setUA(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
    const result = detectBot([])
    expect(result.isAllowedBot).toBe(false)
  })

  it('détecte ClaudeBot comme bot connu', () => {
    setUA('Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)')
    const result = detectBot([])
    expect(result.signals.userAgentMatch).toBeTruthy()
    expect(result.isBot).toBe(true)
  })

  it('détecte GPTBot', () => {
    setUA('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.0; +https://openai.com/gptbot')
    const result = detectBot([])
    expect(result.signals.userAgentMatch).toBeTruthy()
  })

  it("détecte navigator.webdriver comme signal headless", () => {
    Object.defineProperty(navigator, 'webdriver', {
      value: true,
      configurable: true,
    })
    const result = detectBot([])
    expect(result.signals.hasWebdriver).toBe(true)
    expect(result.isHeadless).toBe(true)
    Object.defineProperty(navigator, 'webdriver', {
      value: false,
      configurable: true,
    })
  })

  it('retourne un score entre 0 et 1', () => {
    setUA('Mozilla/5.0')
    const result = detectBot([])
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })
})
