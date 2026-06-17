# Changelog

Toutes les modifications notables sont documentées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), le versioning suit [SemVer](https://semver.org/lang/fr/).

## [0.1.0] — 2026-06-16

### Première release

- `AntiScrapperProvider` : contexte global avec configuration (niveau, bots autorisés, mode accessibilité, debug, seed, densité honey-text) et **callbacks** (`onBotDetected`, `onHoneypotTriggered`, `onAccessibilityDetected`)
- Détection bot **centralisée dans le Provider** : tourne une fois par session, les composants enfants consomment le résultat via context, pas de double-firing
- `ProtectedRegion` : composant principal, obfusque le texte avec polymorphisme. Supporte la prop `watermark` pour tracer les fuites
- `Watermark` : composant standalone pour insérer un watermark stéganographique sans obfusquer
- `HoneypotLink` : lien piège invisible. Déclenche le callback `onHoneypotTriggered` au click
- `HoneyText` : texte de pollution invisible avec `aria-hidden`
- `useBotDetection` : hook de détection bot et headless (lit le résultat du Provider)
- 4 stratégies d'obfuscation : `split-words`, `split-chars`, `css-reverse`, `shuffle-order`
- 5 niveaux : `off`, `low`, `medium`, `high`, `paranoid`
- **Watermarking stéganographique** via caractères Unicode invisibles (`U+200B`, `U+200C`) insérés aux frontières de mots. Utilitaires exposés : `embedWatermark`, `extractWatermarkBits`, `findWatermarkMatch`, `stripWatermark`, `hasWatermark`
- Allowlist bots légitimes (Google, Bing, ClaudeBot, GPTBot, etc.) pour préserver le SEO
- Mode `accessibilitySafe` actif par défaut (respect de `prefers-reduced-motion` et `forced-colors`)
- SSR-safe (Next.js, Remix, etc.) avec placeholder avant hydratation et `<noscript>` fallback
- Build dual ESM + CJS, types TypeScript, source maps
- Tests vitest : utils, encoding, components, detection, watermark
