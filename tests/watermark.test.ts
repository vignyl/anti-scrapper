import { describe, it, expect } from 'vitest'
import {
  embedWatermark,
  extractWatermarkBits,
  findWatermarkMatch,
  stripWatermark,
  hasWatermark,
} from '../src/watermark'

describe('embedWatermark', () => {
  it("insère des caractères invisibles dans le texte", () => {
    const text = 'Hello world foo bar baz'
    const watermarked = embedWatermark(text, 'session-1')
    expect(watermarked.length).toBeGreaterThan(text.length)
    expect(hasWatermark(watermarked)).toBe(true)
  })

  it('strip rend le texte original sans les caractères invisibles', () => {
    const text = 'Hello world foo bar'
    const watermarked = embedWatermark(text, 'session-1')
    expect(stripWatermark(watermarked)).toBe(text)
  })

  it("ne modifie pas un texte sans espace (pas de boundary)", () => {
    expect(embedWatermark('Singleword', 'id')).toBe('Singleword')
  })

  it("ne modifie pas un texte vide", () => {
    expect(embedWatermark('', 'id')).toBe('')
  })

  it("ne modifie pas si l'id est vide", () => {
    expect(embedWatermark('Hello world', '')).toBe('Hello world')
  })

  it("deux ids différents produisent des watermarks différents", () => {
    const text = 'A quick brown fox jumps over the lazy dog and runs fast away'
    const a = embedWatermark(text, 'session-A')
    const b = embedWatermark(text, 'session-B')
    expect(a).not.toBe(b)
  })
})

describe('extractWatermarkBits', () => {
  it("retourne un tableau vide pour un texte sans watermark", () => {
    expect(extractWatermarkBits('Plain text')).toEqual([])
  })

  it("extrait les bits du watermark", () => {
    const text = 'A quick brown fox jumps over the lazy dog and runs fast away'
    const watermarked = embedWatermark(text, 'session-X')
    const bits = extractWatermarkBits(watermarked)
    expect(bits.length).toBeGreaterThan(0)
    expect(bits.every((b) => b === 0 || b === 1)).toBe(true)
  })
})

describe('findWatermarkMatch', () => {
  it("retrouve l'id correct parmi plusieurs candidats", () => {
    const ids = ['session-A', 'session-B', 'session-C', 'session-D']
    const text =
      'This is a sufficiently long piece of text with enough word boundaries to encode many bits of watermark information cleanly'
    const watermarked = embedWatermark(text, 'session-C')
    expect(findWatermarkMatch(watermarked, ids)).toBe('session-C')
  })

  it('retourne null pour un texte sans watermark', () => {
    expect(findWatermarkMatch('plain text', ['id1', 'id2'])).toBeNull()
  })

  it("retourne null si l'id n'est pas dans la liste de candidats", () => {
    const text =
      'Another long sentence to test watermarking with sufficient encoding room here'
    const watermarked = embedWatermark(text, 'session-X')
    expect(findWatermarkMatch(watermarked, ['other-1', 'other-2'])).toBeNull()
  })

  it("survit au strip+re-embed d'un id différent (faux positif évité)", () => {
    const text =
      'Yet another sufficiently long text for testing watermark integrity end to end'
    const a = embedWatermark(text, 'session-A')
    expect(findWatermarkMatch(a, ['session-A'])).toBe('session-A')
    const b = embedWatermark(stripWatermark(a), 'session-B')
    expect(findWatermarkMatch(b, ['session-A'])).toBeNull()
    expect(findWatermarkMatch(b, ['session-B'])).toBe('session-B')
  })
})

describe('hasWatermark', () => {
  it("détecte la présence d'un watermark", () => {
    const text = 'A quick brown fox runs fast'
    expect(hasWatermark(text)).toBe(false)
    expect(hasWatermark(embedWatermark(text, 'id'))).toBe(true)
  })
})
