import { createElement, useMemo, type ElementType } from 'react'
import { hashSeed } from './utils'

const ZW_0 = '​'
const ZW_1 = '‌'
const ZW_PATTERN = /[​‌]/g

export function embedWatermark(text: string, watermarkId: string): string {
  if (!text || !watermarkId) return text

  const hash = hashSeed(watermarkId)

  const positions: number[] = []
  for (let i = 0; i < text.length - 1; i++) {
    if (/\s/.test(text[i]) && /\S/.test(text[i + 1])) {
      positions.push(i + 1)
    }
  }

  if (positions.length === 0) return text

  const bitsToEncode = Math.min(32, positions.length)

  let result = ''
  let posIdx = 0
  let bitIdx = 0
  for (let i = 0; i < text.length; i++) {
    if (
      posIdx < positions.length &&
      i === positions[posIdx] &&
      bitIdx < bitsToEncode
    ) {
      const bit = (hash >>> (31 - bitIdx)) & 1
      result += bit === 0 ? ZW_0 : ZW_1
      bitIdx++
      posIdx++
    }
    result += text[i]
  }

  return result
}

export function extractWatermarkBits(text: string): number[] {
  const bits: number[] = []
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ZW_0) bits.push(0)
    else if (text[i] === ZW_1) bits.push(1)
  }
  return bits
}

export function findWatermarkMatch(
  suspectText: string,
  candidateIds: string[]
): string | null {
  const bits = extractWatermarkBits(suspectText)
  if (bits.length === 0) return null

  for (const id of candidateIds) {
    const hash = hashSeed(id)
    let matches = true
    for (let i = 0; i < bits.length; i++) {
      const expected = (hash >>> (31 - i)) & 1
      if (bits[i] !== expected) {
        matches = false
        break
      }
    }
    if (matches) return id
  }
  return null
}

export function stripWatermark(text: string): string {
  return text.replace(ZW_PATTERN, '')
}

export function hasWatermark(text: string): boolean {
  return ZW_PATTERN.test(text)
}

export interface WatermarkProps {
  children: string
  id: string
  as?: ElementType
  className?: string
}

export function Watermark({
  children,
  id,
  as: Tag = 'span',
  className,
}: WatermarkProps) {
  const watermarked = useMemo(
    () => embedWatermark(children, id),
    [children, id]
  )
  return createElement(Tag, { className }, watermarked)
}
