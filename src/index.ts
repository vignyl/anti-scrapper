export { AntiScrapperProvider, useAntiScrapper } from './context'
export type { AntiScrapperProviderProps } from './context'

export { ProtectedRegion } from './ProtectedRegion'
export type { ProtectedRegionProps } from './ProtectedRegion'

export { HoneypotLink } from './HoneypotLink'
export type { HoneypotLinkProps } from './HoneypotLink'

export { HoneyText } from './HoneyText'
export type { HoneyTextProps } from './HoneyText'

export {
  Watermark,
  embedWatermark,
  extractWatermarkBits,
  findWatermarkMatch,
  stripWatermark,
  hasWatermark,
} from './watermark'
export type { WatermarkProps } from './watermark'

export { useBotDetection } from './useBotDetection'

export { detectBot } from './detection'
export { encode, decode } from './encoding'
export { createRng, hashSeed } from './utils'

export type {
  AntiScrapperConfig,
  AntiScrapperCallbacks,
  ProtectionLevel,
  ObfuscationStrategy,
  BotDetectionResult,
  BotSignals,
  HoneypotEvent,
} from './types'
