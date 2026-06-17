import { describe, it, expect } from 'vitest'
import { encode, decode } from '../src/encoding'

describe('encoding', () => {
  it('encode puis décode reproduit le texte original', () => {
    const text = 'Bonjour le monde'
    const key = 12345
    expect(decode(encode(text, key), key)).toBe(text)
  })

  it('gère les caractères Unicode (accents, émojis)', () => {
    const text = 'Hé ! Çà va ? 🚀 你好'
    const key = 0xdeadbeef
    expect(decode(encode(text, key), key)).toBe(text)
  })

  it('encode produit un résultat différent du texte original', () => {
    expect(encode('Bonjour', 12345)).not.toBe('Bonjour')
  })

  it('décoder avec la mauvaise clé donne un résultat différent', () => {
    const text = 'Confidential payload'
    const wrong = decode(encode(text, 12345), 99999)
    expect(wrong).not.toBe(text)
  })

  it('produit du base64 valide', () => {
    const result = encode('Bonjour', 42)
    expect(result).toMatch(/^[A-Za-z0-9+/=]+$/)
  })

  it('gère les chaînes vides', () => {
    expect(decode(encode('', 42), 42)).toBe('')
  })
})
