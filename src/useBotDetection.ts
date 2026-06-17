import { useAntiScrapper } from './context'
import type { BotDetectionResult } from './types'

export function useBotDetection(): BotDetectionResult | null {
  const { detection } = useAntiScrapper()
  return detection
}
