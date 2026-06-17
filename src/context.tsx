import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { detectBot } from './detection'
import type {
  AntiScrapperCallbacks,
  AntiScrapperConfig,
  BotDetectionResult,
  HoneypotEvent,
  ProtectionLevel,
} from './types'

const DEFAULT_CONFIG: AntiScrapperConfig = {
  level: 'medium',
  allowedBots: ['Googlebot', 'Bingbot', 'DuckDuckBot', 'ClaudeBot'],
  accessibilitySafe: true,
  debug: false,
  honeyTextDensity: 0.15,
  classPrefix: 'as',
}

interface ContextValue extends AntiScrapperConfig {
  hydrated: boolean
  detection: BotDetectionResult | null
  fireHoneypot: (event: HoneypotEvent) => void
}

const AntiScrapperContext = createContext<ContextValue | null>(null)

export interface AntiScrapperProviderProps extends AntiScrapperCallbacks {
  children: ReactNode
  level?: ProtectionLevel
  allowedBots?: string[]
  accessibilitySafe?: boolean
  debug?: boolean
  seed?: string
  honeyTextDensity?: number
  classPrefix?: string
}

export function AntiScrapperProvider({
  children,
  level,
  allowedBots,
  accessibilitySafe,
  debug,
  seed,
  honeyTextDensity,
  classPrefix,
  onBotDetected,
  onHoneypotTriggered,
  onAccessibilityDetected,
}: AntiScrapperProviderProps) {
  const [hydrated, setHydrated] = useState(false)
  const [detection, setDetection] = useState<BotDetectionResult | null>(null)

  const callbacksRef = useRef<AntiScrapperCallbacks>({})
  callbacksRef.current = {
    onBotDetected,
    onHoneypotTriggered,
    onAccessibilityDetected,
  }

  const effectiveAllowedBots = allowedBots ?? DEFAULT_CONFIG.allowedBots

  useEffect(() => {
    setHydrated(true)
    const result = detectBot(effectiveAllowedBots)
    setDetection(result)

    if (result.isBot && !result.isAllowedBot) {
      callbacksRef.current.onBotDetected?.(result)
    }
    if (result.isAccessibility) {
      callbacksRef.current.onAccessibilityDetected?.(result.signals)
    }
  }, [effectiveAllowedBots.join('|')])

  const fireHoneypot = (event: HoneypotEvent) => {
    callbacksRef.current.onHoneypotTriggered?.(event)
  }

  const value = useMemo<ContextValue>(
    () => ({
      level: level ?? DEFAULT_CONFIG.level,
      allowedBots: effectiveAllowedBots,
      accessibilitySafe: accessibilitySafe ?? DEFAULT_CONFIG.accessibilitySafe,
      debug: debug ?? DEFAULT_CONFIG.debug,
      seed,
      honeyTextDensity: honeyTextDensity ?? DEFAULT_CONFIG.honeyTextDensity,
      classPrefix: classPrefix ?? DEFAULT_CONFIG.classPrefix,
      hydrated,
      detection,
      fireHoneypot,
    }),
    [
      level,
      effectiveAllowedBots,
      accessibilitySafe,
      debug,
      seed,
      honeyTextDensity,
      classPrefix,
      hydrated,
      detection,
    ]
  )

  return (
    <AntiScrapperContext.Provider value={value}>
      {children}
    </AntiScrapperContext.Provider>
  )
}

export function useAntiScrapper(): ContextValue {
  const context = useContext(AntiScrapperContext)
  if (!context) {
    throw new Error(
      "useAntiScrapper doit être utilisé à l'intérieur d'un <AntiScrapperProvider>"
    )
  }
  return context
}
