# Roadmap anti-scrapper

Cette page liste les chantiers planifiés au delà de la v0.1. Aucune date ferme, juste de la priorisation.

## v0.2 : couche serveur (tokenisation)

Le chiffrement actuel est cosmétique : la clé est dérivée du contenu et tourne côté client. Un scrapeur qui exécute le JS récupère le texte trivialement.

La v0.2 introduit un compagnon serveur :

- Endpoint `/api/anti-scrapper/token` qui délivre une clé éphémère liée à la session, après validation (rate limit, fingerprint, captcha optionnel)
- Le contenu chiffré côté serveur avec une clé serveur, non dérivable côté client
- Le composant `ProtectedRegion` fetch le token au mount, puis décode

Brique critique : **c'est ici qu'on passe d'un speed bump à une vraie barrière**.

## v0.3 : Proof-of-Work léger

Avant de révéler le contenu, le client doit résoudre un hashcash (cible 200ms sur CPU moderne, paramétrable).

- Invisible pour 1 humain
- Ruineux pour un scrapeur qui veut faire 100k pages
- Implémentation Web Worker pour ne pas bloquer le thread principal

## v0.4 : WASM decoder

La logique de décodage en WebAssembly compilé, pas en JS lisible :

- Reverse engineering nettement plus coûteux
- Pas impossible, juste plus long
- Build pipeline Rust ou AssemblyScript

## ~~v0.5 : Watermarking stéganographique~~ → shippé en v0.1.0

Premier passage shippé en 0.1.0 avec encodage zero-width sur 32 bits aux frontières de mots, composant `<Watermark>` standalone, et prop `watermark` sur `<ProtectedRegion>`.

À ajouter ultérieurement :
- Encodage 64 bits pour grandes audiences (collision-resistant)
- Permutations d'ordre de propriétés CSS équivalentes (canal supplémentaire)
- Unicode look-alikes (`U+0430` cyrillique vs `U+0061` latin)
- Mode redondant : encoder le hash plusieurs fois dans le texte pour survivre à la troncation

## v0.6 : Streaming temporel

Le contenu se révèle progressivement au scroll, pas tout en DOM d'un coup :

- IntersectionObserver pour déclencher
- Animation de fade-in côté visuel
- Casse les `fetch + parse` rapides qui veulent tout en un seul snapshot

## v0.7 : Fingerprinting headless avancé

Au delà de `navigator.webdriver` :

- Canvas fingerprint anomalies
- WebGL renderer mismatch (Chrome headless renvoie souvent SwiftShader)
- Audio context fingerprint
- Font enumeration
- WebRTC IP leak vs claimed timezone

Score composite plus précis. Pondération configurable.

## v0.8 : Behavioral

Suivi mouse / scroll / keyboard pour identifier les patterns humains :

- Mouvements naturels (bezier irréguliers) vs scripts (déplacements linéaires)
- Cadence de scroll, accélération
- Variabilité du temps entre touches
- Si score bas, dégrade vers le `fallback` au lieu de révéler le contenu

## v0.9 : Telemetry opt-in

Endpoint optionnel pour collecter les détections :

- Nombre de tentatives bloquées
- User-agents observés
- Géolocalisation IP grossière
- Dashboard de stats pour le dev

Argument marketing fort. Strict opt-in, no PII.

## v1.0 : stabilisation API

- Audit accessibilité (WCAG 2.2 AA)
- Audit perf (CLS, INP)
- Benchmark vs `puppeteer-extra-plugin-stealth`
- Doc complète, exemples Next.js / Remix / Vite
- Migration guide depuis 0.x si breaking changes

## Idées en exploration

- `@anti-scrapper/server` : middleware Express / Fastify / Next.js avec reverse DNS check + rate limit + token endpoint
- `@anti-scrapper/cli` : analyse une page rendue et donne un score de protection
- `@anti-scrapper/devtools` : extension navigateur pour visualiser les régions protégées et débugger l'obfuscation
