export function encode(text: string, key: number): string {
  const keyBytes = keyToBytes(key)
  const encoded = new TextEncoder().encode(text)
  const out = new Uint8Array(encoded.length)
  for (let i = 0; i < encoded.length; i++) {
    out[i] = encoded[i] ^ keyBytes[i % 4]
  }
  return bytesToBase64(out)
}

export function decode(encoded: string, key: number): string {
  const keyBytes = keyToBytes(key)
  const bytes = base64ToBytes(encoded)
  const out = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    out[i] = bytes[i] ^ keyBytes[i % 4]
  }
  return new TextDecoder().decode(out)
}

function keyToBytes(key: number): Uint8Array {
  const b = new Uint8Array(4)
  b[0] = (key >>> 24) & 0xff
  b[1] = (key >>> 16) & 0xff
  b[2] = (key >>> 8) & 0xff
  b[3] = key & 0xff
  return b
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  if (typeof btoa !== 'undefined') return btoa(bin)
  // Node fallback (build / SSR)
  return Buffer.from(bin, 'binary').toString('base64')
}

function base64ToBytes(encoded: string): Uint8Array {
  const bin =
    typeof atob !== 'undefined'
      ? atob(encoded)
      : Buffer.from(encoded, 'base64').toString('binary')
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
