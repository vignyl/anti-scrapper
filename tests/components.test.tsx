import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, fireEvent } from '@testing-library/react'

beforeEach(() => {
  Object.defineProperty(navigator, 'webdriver', {
    value: false,
    configurable: true,
  })
  Object.defineProperty(navigator, 'userAgent', {
    value:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    configurable: true,
  })
})
import {
  AntiScrapperProvider,
  ProtectedRegion,
  HoneypotLink,
  HoneyText,
  Watermark,
  hasWatermark,
  stripWatermark,
  findWatermarkMatch,
} from '../src'

describe('AntiScrapperProvider', () => {
  it("throw si useAntiScrapper est utilisé hors du Provider", () => {
    expect(() =>
      render(<ProtectedRegion>Test</ProtectedRegion>)
    ).toThrow(/AntiScrapperProvider/)
  })
})

describe('ProtectedRegion', () => {
  it('rend sans crasher avec un Provider', () => {
    const { container } = render(
      <AntiScrapperProvider level="low" seed="test-seed">
        <ProtectedRegion>Contenu sensible</ProtectedRegion>
      </AntiScrapperProvider>
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('debug mode affiche le contenu en clair', () => {
    const { getByText } = render(
      <AntiScrapperProvider debug>
        <ProtectedRegion>Texte visible</ProtectedRegion>
      </AntiScrapperProvider>
    )
    expect(getByText('Texte visible')).toBeTruthy()
  })

  it("rend dans l'élément demandé via la prop `as`", () => {
    const { container } = render(
      <AntiScrapperProvider debug>
        <ProtectedRegion as="article">Article content</ProtectedRegion>
      </AntiScrapperProvider>
    )
    expect(container.querySelector('article')).toBeTruthy()
  })

  it('embed le watermark dans le contenu après hydratation', async () => {
    const { container } = render(
      <AntiScrapperProvider level="low" seed="seed">
        <ProtectedRegion watermark="session-xyz">
          This is a long enough piece of text with several word boundaries for watermark
        </ProtectedRegion>
      </AntiScrapperProvider>
    )
    await waitFor(() => {
      expect(hasWatermark(container.textContent || '')).toBe(true)
    })
  })
})

describe('HoneypotLink', () => {
  it('rend un lien aria-hidden, tabindex -1, rel nofollow noindex', () => {
    const { container } = render(
      <AntiScrapperProvider>
        <HoneypotLink />
      </AntiScrapperProvider>
    )
    const link = container.querySelector('a')
    expect(link?.getAttribute('aria-hidden')).toBe('true')
    expect(link?.getAttribute('tabindex')).toBe('-1')
    expect(link?.getAttribute('rel')).toContain('nofollow')
    expect(link?.getAttribute('rel')).toContain('noindex')
  })

  it('fire onTrigger et onHoneypotTriggered au click', () => {
    const onTrigger = vi.fn()
    const onHoneypotTriggered = vi.fn()
    const { container } = render(
      <AntiScrapperProvider onHoneypotTriggered={onHoneypotTriggered}>
        <HoneypotLink onTrigger={onTrigger} />
      </AntiScrapperProvider>
    )
    const link = container.querySelector('a')!
    fireEvent.click(link)
    expect(onTrigger).toHaveBeenCalledOnce()
    expect(onHoneypotTriggered).toHaveBeenCalledOnce()
    const event = onHoneypotTriggered.mock.calls[0][0]
    expect(event.source).toBe('link')
    expect(event.href).toBe('/__honeypot__')
    expect(typeof event.timestamp).toBe('number')
  })
})

describe('HoneyText', () => {
  it('rend en aria-hidden', () => {
    const { container } = render(
      <AntiScrapperProvider>
        <HoneyText>contenu pollué</HoneyText>
      </AntiScrapperProvider>
    )
    const span = container.querySelector('span[aria-hidden="true"]')
    expect(span).toBeTruthy()
    expect(span?.textContent).toBe('contenu pollué')
  })
})

describe('Watermark', () => {
  it('embed le watermark dans le texte rendu', () => {
    const { container } = render(
      <Watermark id="session-1">
        Bonjour le monde foo bar baz qux quux corge grault garply
      </Watermark>
    )
    expect(hasWatermark(container.textContent || '')).toBe(true)
  })

  it('le texte sans les marques reste lisible', () => {
    const original = 'Bonjour le monde foo bar baz qux quux corge'
    const { container } = render(<Watermark id="session-1">{original}</Watermark>)
    expect(stripWatermark(container.textContent || '')).toBe(original)
  })

  it('findWatermarkMatch retrouve la session source', () => {
    const original =
      'A sufficiently long passage of text used to verify the watermarking pipeline'
    const { container } = render(<Watermark id="session-leak">{original}</Watermark>)
    const captured = container.textContent || ''
    expect(
      findWatermarkMatch(captured, ['session-a', 'session-leak', 'session-b'])
    ).toBe('session-leak')
  })
})
