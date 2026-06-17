export function createRng(seed: number): () => number {
  let state = seed >>> 0
  if (state === 0) state = 1
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function randomClassName(rng: () => number, prefix: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = prefix + '-'
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(rng() * chars.length)]
  }
  return s
}

export function isSSR(): boolean {
  return typeof window === 'undefined' || typeof document === 'undefined'
}
