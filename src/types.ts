export type ProtectionLevel = 'off' | 'low' | 'medium' | 'high' | 'paranoid'

export type ObfuscationStrategy =
  | 'split-words'
  | 'split-chars'
  | 'css-reverse'
  | 'shuffle-order'

export interface AntiScrapperConfig {
  level: ProtectionLevel
  allowedBots: string[]
  accessibilitySafe: boolean
  debug: boolean
  seed?: string
  honeyTextDensity: number
  classPrefix: string
}

export interface BotSignals {
  hasWebdriver: boolean
  hasPlugins: boolean
  hasLanguages: boolean
  permissionsAnomaly: boolean
  chromeRuntime: boolean
  userAgentMatch: string | null
  prefersReducedMotion: boolean
  forcedColors: boolean
}

export interface BotDetectionResult {
  isBot: boolean
  isHeadless: boolean
  isAllowedBot: boolean
  isAccessibility: boolean
  score: number
  signals: BotSignals
}

export interface HoneypotEvent {
  source: 'link' | 'text'
  href?: string
  timestamp: number
}

export interface AntiScrapperCallbacks {
  onBotDetected?: (detection: BotDetectionResult) => void
  onHoneypotTriggered?: (event: HoneypotEvent) => void
  onAccessibilityDetected?: (signals: BotSignals) => void
}
