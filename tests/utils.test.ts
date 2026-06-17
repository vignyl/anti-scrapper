import { describe, it, expect } from 'vitest'
import { createRng, hashSeed, randomClassName, isSSR } from '../src/utils'

describe('createRng', () => {
  it('produit la même séquence pour la même seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    for (let i = 0; i < 10; i++) {
      expect(a()).toBe(b())
    }
  })

  it('produit des séquences différentes pour des seeds différentes', () => {
    const a = createRng(1)
    const b = createRng(2)
    expect(a()).not.toBe(b())
  })

  it('produit des valeurs entre 0 et 1', () => {
    const rng = createRng(123)
    for (let i = 0; i < 100; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('hashSeed', () => {
  it('est déterministe', () => {
    expect(hashSeed('hello')).toBe(hashSeed('hello'))
  })

  it('produit des hash différents pour des entrées différentes', () => {
    expect(hashSeed('hello')).not.toBe(hashSeed('world'))
  })

  it('produit un nombre 32-bit non signé', () => {
    const h = hashSeed('long string with various characters àéù 123')
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xffffffff)
  })
})

describe('randomClassName', () => {
  it('respecte le préfixe fourni', () => {
    const rng = createRng(1)
    expect(randomClassName(rng, 'as')).toMatch(/^as-[a-z0-9]{6}$/)
    expect(randomClassName(rng, 'foo')).toMatch(/^foo-[a-z0-9]{6}$/)
  })

  it('change à chaque appel', () => {
    const rng = createRng(1)
    const a = randomClassName(rng, 'x')
    const b = randomClassName(rng, 'x')
    expect(a).not.toBe(b)
  })
})

describe('isSSR', () => {
  it("retourne false dans un environnement qui a window et document", () => {
    expect(isSSR()).toBe(false)
  })
})
