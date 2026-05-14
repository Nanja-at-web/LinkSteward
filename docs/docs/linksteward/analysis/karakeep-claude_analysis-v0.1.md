# KaraKeep – Claude Code Analyse v0.1

> Erstellt: 2026-05-14  
> Basis: Direktes Lesen des Quellcodes im Repository `/home/dev/projects/linksteward`  
> Unabhängig von anderen Analysen erstellt.

---

## 1. Repository-Struktur

KaraKeep ist ein **Turborepo-Monorepo** mit zwei Hauptbereichen:

```text
apps/
├─ web/          Next.js 15 – Haupt-Webapplikation (React, TypeScript, Tailwind, shadcn/ui)
├─ workers/      Node.js – Hintergrundverarbeitung (Crawler, AI, Search, RSS, Backup …)
├─ browser-extension/   Browser-Erweiterung
├─ cli/          Kommandozeilen-Interface
├─ mcp/          Model Context Protocol Server
├─ mobile/       Expo Mobile App
└─ landing/      Landing Page

packages/
├─ api/          Hono REST API (Routing-Layer)
├─ trpc/         tRPC Router + Business Logic + Modelle
├─ db/           Drizzle ORM Schema + Migrationen (SQLite)
├─ shared/       Typen, Config, Inference, Import/Export, Asset-DB
├─ shared-server/ Queue-System, EventLogger, Tracing, Plugins
├─ shared-react/ Gemeinsame React-Komponenten und Hooks
├─ sdk/          TypeScript SDK für externe Clients
└─ open-api/     OpenAPI-Spezifikation

tooling/
├─ typescript/   TypeScript-Konfigurationen
├─ tailwind/     Tailwind-Konfigurationen
├─ oxlint/       Linting
└─ prettier/     Formatierung
```

**Technologie-Stack:**
- Build-System: Turborepo + pnpm Workspaces
- Backend: Hono (HTTP), tRPC (Business Logic), Drizzle ORM
- Frontend: Next.js 15, React, Tailwind CSS, shadcn/ui
- Datenbank: SQLite via `better-sqlite3`
- Suche: Meilisearch
- Queue: Bull-ähnliches Queue-System (via shared-server)
- Prozessmanager: s6-overlay (im Docker-Container)

**Wichtige Beobachtung:** Die Architektur-Dokumentation von LinkSteward (architecture-v0.1.md) nennt PostgreSQL als Zieldatenbank, aber KaraKeep verwendet **SQLite** (`better-sqlite3`). Das ist ein kritischer Widerspruch, der vor der Implementierung aufgelöst werden muss.

---

## 2. Datenbankmodell

KaraKeep verwendet **SQLite** mit Drizzle ORM. Das Schema ist in einer einzigen Datei definiert:
`packages/db/schema.ts`

### Kernentitäten

```text
Authentifizierung
├─ user              – Nutzer (id, name, email, password, salt, role, settings)
├─ account           – OAuth-Provider-Accounts (via @auth/core)
├─ session           – Aktive Sessions
├─ verificationToken – E-Mail-Verifikation
├─ passwordResetToken – Passwort-Reset-Tokens
└─ apiKey            – API-Schlüssel (keyId, keyHash, scopes, userId)

Bookmarks
├─ bookmarks         – Haupttabelle (id, type: link|text|asset, title, archived, favourited, userId)
├─ bookmarkLinks     – Links (url, crawledAt, crawlStatus, htmlContent, favicon, imageUrl …)
├─ bookmarkTexts     – Texte (text, sourceUrl)
└─ bookmarkAssets    – Assets (assetId, assetType: image|pdf, content, metadata)

Organisation
├─ bookmarkTags      – Tag-Definitionen (name, normalizedName via GENERATED COLUMN, userId)
├─ tagsOnBookmarks   – M:N Verknüpfung (attachedBy: ai|human)
├─ bookmarkLists     – Listen (name, icon, type: manual|smart, query, parentId, rssToken, public)
├─ bookmarksInLists  – M:N Verknüpfung
├─ listCollaborators – Listen-Mitglieder (role: viewer|editor)
└─ listInvitations   – Ausstehende Einladungen

Assets & Medien
└─ assets            – Asset-Metadaten (assetType: linkBannerImage|linkScreenshot|linkPdf|
                        assetScreenshot|linkFullPageArchive|linkPrecrawledArchive|
                        linkVideo|linkHtmlContent|bookmarkAsset|userUploaded|avatar|backup|unknown)

Erweiterte Features
├─ highlights        – Textmarkierungen (startOffset, endOffset, color: red|green|blue|yellow, note)
├─ userReadingProgress – Lesefortschritt (readingProgressOffset, readingProgressPercent)
├─ customPrompts     – Eigene AI-Prompts (appliesTo: all_tagging|text|images|summary)
├─ rssFeedsTable     – RSS-Feeds (url, enabled, importTags, lastFetchedStatus)
├─ rssFeedImportsTable – Importierte RSS-Einträge (entryId, rssFeedId, bookmarkId)
└─ webhooksTable     – Webhooks (url, events: created|edited|crawled|ai tagged|deleted, token)

Backup & Import
├─ backupsTable      – Backup-Metadaten (assetId, size, bookmarkCount, status)
├─ importSessions    – Import-Sitzungen (status: staging|pending|running|paused|completed|failed)
├─ importSessionBookmarks – Verknüpfung Session → Bookmark
└─ importStagingBookmarks – Staging-Einträge (type, url, title, tags, listIds, status, result)

Regel-Engine
├─ ruleEngineRulesTable   – Regeln (event, condition, tagId)
└─ ruleEngineActionsTable – Aktionen (action, listId, tagId)

System
├─ invites           – Einladungen (email, token, usedAt)
├─ subscriptions     – Stripe-Abonnements (stripeCustomerId, status, tier: free|paid)
└─ config            – Key-Value-Konfiguration
```

### Datenbankdesign-Beobachtungen

- **Generierte Spalten:** `bookmarkTags.normalizedName` nutzt SQLite `GENERATED ALWAYS AS` für case-insensitive normalisierte Tag-Namen.
- **Weiche Foreign Keys:** `bookmarksInLists.listMembershipId` referenziert `listCollaborators.id` mit `ON DELETE CASCADE` – ein Bookmark verschwindet aus einer geteilten Liste wenn die Mitgliedschaft endet.
- **Composite Indexes:** Optimiert für Pagination-Queries mit `(userId, createdAt, id)`.
- **Stripe-Tabelle** ist Teil des Schemas, aber für Self-Hosting irrelevant. Sie blockiert keine Features, muss aber bei Schema-Verständnis berücksichtigt werden.
- **Keine Soft-Delete-Spalte** in `bookmarks` vorhanden – dies ist eine zentrale Lücke für die LinkSteward-Anforderung (ADR-015).

---

## 3. API-Endpunkte

KaraKeep stellt zwei API-Schichten bereit:

### REST API (Hono, packages/api/)

```text
Basis-URL: /

System
├─ GET  /health          – Health-Check
├─ GET  /version         – Server-Version
├─ GET  /metrics         – Prometheus-Metriken (optional Auth)
└─ POST /trpc            – tRPC-Endpunkt (für Web-App)

v1 (alle erfordern Auth)
├─ GET/POST/GET/:id/PATCH/:id/DELETE/:id  /v1/bookmarks
├─ GET /v1/bookmarks/search
├─ GET /v1/bookmarks/check-url
├─ POST /v1/bookmarks/singlefile           – SingleFile-Extension Upload
├─ GET/POST/:id/assets /v1/bookmarks/:id/assets
├─ POST/DELETE /v1/bookmarks/:id/tags
├─ POST /v1/bookmarks/:id/summarize
├─ GET  /v1/bookmarks/:id/highlights
│
├─ GET/POST /v1/lists
├─ GET/PATCH/DELETE /v1/lists/:listId
├─ GET /v1/lists/:listId/bookmarks
├─ PUT/DELETE /v1/lists/:listId/bookmarks/:bookmarkId
│
├─ GET/POST /v1/tags
├─ GET/PATCH/DELETE /v1/tags/:tagId
├─ GET /v1/tags/:tagId/bookmarks
│
├─ GET/PATCH /v1/users/me
├─ GET/POST/DELETE /v1/users/me/api-keys
│
├─ GET/POST /v1/assets
├─ GET/DELETE /v1/assets/:assetId
│
├─ GET/POST/GET/:id/DELETE/:id /v1/feeds
│
├─ GET/POST /v1/highlights
├─ GET/PATCH/DELETE /v1/highlights/:highlightId
│
├─ GET/POST /v1/backups
├─ GET/DELETE /v1/backups/:backupId
│
└─ GET /v1/admin/*

Öffentliche Endpunkte
├─ GET /public/lists/:token   – Öffentliche Listen via RSS-Token
└─ GET /assets/:assetId       – Asset-Download (teilweise öffentlich)

Webhooks
└─ POST /webhooks/:webhookId  – Eingehende Webhook-Events
```

### tRPC Router (packages/trpc/routers/)

Der tRPC-Router deckt alle Business-Operationen ab, die über die Web-App genutzt werden. Er ist in 18 Sub-Router unterteilt:

```text
bookmarks, apiKeys, users, lists, tags, prompts,
admin, feeds, backups, highlights, importSessions,
webhooks, assets, rules, invites, publicBookmarks,
subscriptions, config
```

Die REST API ist ein dünner Adapter über tRPC und ruft direkt `createCaller(ctx)` auf.

---

## 4. Auth/API-Key-System

### Architektur

KaraKeep verwendet eine **zweigeteilte Authentifizierung**:

**1. Session-Auth (NextAuth.js)**
- Unterstützt: Email/Passwort, OAuth (OIDC-kompatibel, konfigurierbar)
- Passwörter werden mit bcrypt (10 Runden) + eigenem Salt gespeichert
- Sessions in `session`-Tabelle, Tokens per `sessionToken` (CUID2)

**2. API-Key-Auth**
- Format: `ak2_<keyId(10 Bytes hex)>_<secret(16 Bytes hex)>`
- `keyId` wird im Klartext gespeichert (für Lookup)
- `secret` wird als SHA-256-Hash (`keyHash`) gespeichert
- Älteres Format: `ak1_*` (wird noch unterstützt)

### Scope-System

```text
Scope-Typen
├─ fullaccess                   – Vollzugriff (default bei Neuerstellung)
├─ <resource>:read              – Lesezugriff
├─ <resource>:readwrite         – Lese- und Schreibzugriff
└─ admin:<resource>:read|readwrite  – Admin-Scopes

Ressourcen (user-level):
assets, backups, bookmarks, feeds, highlights, lists,
prompts, rules, tags, users, webhooks, importSessions, subscriptions

Ressourcen (admin-level):
bookmarks, jobs, system, users
```

**Scope-Hierarchie:** `readwrite` impliziert `read`. `fullaccess` impliziert alles.

Die Scope-Prüfung erfolgt über `apiKeyScopeMiddleware` als Hono-Middleware. Normale Session-Auth überspringt Scope-Prüfungen (hat implizit Vollzugriff).

### SSRF-Schutz

URL-Validierung via `network.ts` mit DNS-Resolver. Blockiert private IP-Ranges. Für Homelab-Nutzer konfigurierbar (Allowlist in `.env`).

---

## 5. Worker/Jobs

### Queue-System

KaraKeep verwendet ein eigenes Queue-System (vermutlich Bull-basiert), das in `packages/shared-server/src/queues.ts` definiert ist. Das System unterstützt:
- Konkurrierende Worker (konfigurierbar via `WORKERS_ENABLED_WORKERS`, `WORKERS_DISABLED_WORKERS`)
- Retry-Logik
- Timeouts pro Job
- Prometheus-Metriken pro Worker

### Worker-Übersicht

```text
Worker                 Queue                    Funktion
─────────────────────────────────────────────────────────────────────
crawler                LinkCrawlerQueue         Vollständiges Crawling (Playwright)
lowPriorityCrawler     LowPriorityCrawlerQueue  Crawler mit niedriger Priorität
inference              OpenAIQueue              AI-Tagging + Zusammenfassung
search                 SearchIndexingQueue      Meilisearch-Indizierung
adminMaintenance       AdminMaintenanceQueue    Wartungsaufgaben (Asset-Tidy, HTML-Migration)
video                  VideoWorkerQueue         Video-Download via yt-dlp
feed                   FeedQueue                RSS-Feed-Verarbeitung
assetPreprocessing     AssetPreprocessingQueue  Asset-Vorverarbeitung (OCR etc.)
webhook                WebhookQueue             Webhook-Auslieferung
ruleEngine             RuleEngineQueue          Regelauswertung nach Bookmark-Events
backup                 BackupQueue              Automatische Backups
import                 (polling-basiert)        Import-Session-Verarbeitung
```

**FeedRefreshingWorker** und **BackupSchedulingWorker** laufen als eigenständige Timer-Loops (kein Queue-Job), nicht als Queue-Consumer.

### Konfiguration

Alle Worker sind über Umgebungsvariablen steuerbar:
- `WORKERS_ENABLED_WORKERS=crawler,inference` – Nur diese aktivieren
- `WORKERS_DISABLED_WORKERS=video` – Bestimmte deaktivieren
- `CRAWLER_NUM_WORKERS`, `INFERENCE_NUM_WORKERS` etc. – Parallelität

---

## 6. Archivierung/Crawling

### CrawlerWorker (apps/workers/workers/crawlerWorker.ts)

Der Crawler ist der komplexeste Worker und nutzt:

```text
Technologien
├─ Playwright (Chromium via BROWSER_WEB_URL oder BROWSER_WEBSOCKET_URL)
├─ Stealth Plugin (puppeteer-extra-plugin-stealth)
├─ PlaywrightBlocker (@ghostery/adblocker-playwright)
├─ Metascraper (Metadaten-Extraktion)
│  ├─ metascraper-amazon-improved (custom)
│  ├─ metascraper-reddit (custom)
│  └─ metascraper-safe-favicon (custom)
├─ Monolith (Rust-Binary, Single-File-HTML-Archiv)
├─ yt-dlp (Video-Download)
└─ ffmpeg (Video-Verarbeitung)
```

**Crawl-Produkte (konfigurierbar):**

```text
CRAWLER_STORE_SCREENSHOT=true      – Screenshot (Standard)
CRAWLER_DOWNLOAD_BANNER_IMAGE=true – Banner-Bild (Standard)
CRAWLER_FULL_PAGE_SCREENSHOT=false – Vollseiten-Screenshot (optional)
CRAWLER_STORE_PDF=false            – PDF (optional)
CRAWLER_FULL_PAGE_ARCHIVE=false    – Single-HTML-Archiv via Monolith (optional)
CRAWLER_VIDEO_DOWNLOAD=false       – Video via yt-dlp (optional)
```

**Asset-Storage:**
- Lokal: `DATA_DIR/assets/`
- S3-kompatibel: via `ASSET_STORE_S3_*` Umgebungsvariablen

**Besonderheiten:**
- Domain-Rate-Limiting: `CRAWLER_DOMAIN_RATE_LIMIT_WINDOW_MS`, `CRAWLER_DOMAIN_RATE_LIMIT_MAX_REQUESTS`
- Proxy-Support: Per-Domain-Proxies konfigurierbar
- Browser-Cookie-Import: `BROWSER_COOKIE_PATH` für authentifizierte Seiten
- Adblocker: standardmäßig aktiviert

---

## 7. Import/Export

### Import-Formate

```text
html              – Netscape-Bookmark-Format (Firefox/Chrome HTML-Export)
pocket            – Pocket-Export
matter            – Matter-App-Export
omnivore          – Omnivore-Export
karakeep          – KaraKeep-eigenes JSON-Format
linkwarden        – Linkwarden-Export
tab-session-manager – Tab Session Manager Extension Export
mymind            – MyMind-Export
readwise-reader   – Readwise Reader Export
instapaper        – Instapaper-Export
onetab            – OneTab-Export
```

### Import-Prozess (zweiphasig)

```text
Phase 1 – Staging
├─ Datei hochladen und parsen
├─ importSession erstellen (status: staging)
├─ importStagingBookmarks befüllen (alle mit status: pending)
└─ importSession auf pending/running setzen

Phase 2 – Verarbeitung (ImportWorker, polling)
├─ Batch von pending staging bookmarks laden
├─ pro Bookmark: createBookmark via tRPC aufrufen
├─ Duplikat-Check (alreadyExists → result: skipped_duplicate)
├─ status → completed | failed, result: accepted|rejected
└─ importSession → completed
```

**Prometheus-Metriken** für den Import-Worker: processed_total, stale_reset_total, in_flight, active_sessions, pending_total, batch_duration_seconds.

### Export

Das Exportformat ist in `packages/shared/import-export/exporters.ts` definiert. Unterstützt wird KaraKeep-JSON (vermutlich auch Netscape-HTML via eigenem Exporter).

---

## 8. AI/Ollama

### InferenceClientFactory

Zwei Backends werden unterstützt, automatisch erkannt via Umgebungsvariablen:

```text
1. OpenAI API
   OPENAI_API_KEY + optional OPENAI_BASE_URL (für kompatible Endpoints)
   → Nutzt openai-Bibliothek + zodResponseFormat für Structured Output

2. Ollama
   OLLAMA_BASE_URL
   → Nutzt ollama-Bibliothek
```

### AI-Jobs

```text
Job-Typ: tag
├─ Trigger: nach erfolgreichem Crawl
├─ Funktionen: Auto-Tagging via LLM
├─ Konfiguriert via: INFERENCE_TEXT_MODEL, INFERENCE_IMAGE_MODEL
└─ Status-Feld: bookmarks.taggingStatus

Job-Typ: summarize
├─ Trigger: manuell oder nach Crawl
├─ Funktion: Zusammenfassung des Bookmark-Inhalts
└─ Status-Feld: bookmarks.summarizationStatus
```

**User-seitige Konfiguration:**
- `autoTaggingEnabled`, `autoSummarizationEnabled` (nullable = Server-Default nutzen)
- `tagStyle` (7 Stile: lowercase-hyphens, titlecase-spaces, camelCase etc.)
- `curatedTagIds` (Auswahl vorgeschlagener Tags als JSON-Array)
- `inferredTagLang` (Sprache für inferierte Tags)
- `customPrompts` (eigene Prompts pro Anwendungsfall)

**OCR:** Separates Feature, konfigurierbar via `OCR_LANGS`, `OCR_CONFIDENCE_THRESHOLD`, optional via LLM (`OCR_USE_LLM`).

**KI deaktivierbar:** Wenn weder `OPENAI_API_KEY` noch `OLLAMA_BASE_URL` gesetzt sind, ist kein InferenceClient verfügbar und AI-Jobs werden übersprungen (kein Fehler).

---

## 9. Docker-Setup

### docker-compose.yml (Produktionsbetrieb)

```text
Services
├─ web      – KaraKeep all-in-one Image (Port 3000)
│              Enthält: Next.js Web-App + API + Workers + SQLite-DB
│              Volume: data:/data (Datenbank + Assets)
├─ chrome   – gcr.io/zenika-hub/alpine-chrome:124
│              Playwright-Remote-Browser (Port 9222 intern)
│              Flags: --no-sandbox, --disable-gpu, --remote-debugging-*
└─ meilisearch – getmeili/meilisearch:v1.41.0
                 Volume: meilisearch:/meili_data
```

### Dockerfile (Multi-Stage)

```text
Stage 1: monolith_builder (Rust)
└─ Kompiliert monolith (Single-File-HTML-Archiver)

Stage 2: base (Node 24)
├─ pnpm install (frozen lockfile)
├─ Next.js build (compile mode)
├─ Workers build (tsdown)
└─ CLI + MCP build

Stage 3: aio_builder (Node 24 slim)
├─ s6-overlay (Prozessmanager, v3.2.1.0)
├─ Runtime-Deps: graphicsmagick, ghostscript, ffmpeg, libjemalloc2
├─ yt-dlp (statisches Binary)
├─ monolith (aus Stage 1)
└─ Node-Artefakte aus Stage 2
```

**s6-overlay** supervisiert im Container:
- Next.js Web-Server
- Workers-Prozess
- (SQLite ist embedded, kein eigener Service)

**Wichtig:** Das AIO-Image ist ein Single-Container-Ansatz – Web, API, Workers und DB laufen im selben Container. Das vereinfacht das Deployment erheblich.

---

## 10. Floccus-relevante KaraKeep-API-Endpunkte

Floccus kann KaraKeep im **nativen KaraKeep-Modus** ansprechen. Die relevanten Endpunkte:

### Bereits vorhanden (direkt nutzbar für Floccus KaraKeep-Modus)

```text
Bookmarks
GET    /v1/bookmarks               – Liste mit Pagination (favourited, archived Filter)
POST   /v1/bookmarks               – Erstellen (url, type, title, tags)
GET    /v1/bookmarks/:id           – Einzelner Bookmark
PATCH  /v1/bookmarks/:id           – Aktualisieren (title, url, tags, archived etc.)
DELETE /v1/bookmarks/:id           – Löschen

Listen (= Ordner in Floccus)
GET    /v1/lists                   – Alle Listen
POST   /v1/lists                   – Liste erstellen (name, icon, type: manual)
GET    /v1/lists/:listId            – Einzelne Liste
PATCH  /v1/lists/:listId            – Umbenennen
DELETE /v1/lists/:listId            – Löschen
GET    /v1/lists/:listId/bookmarks  – Bookmarks in Liste
PUT    /v1/lists/:listId/bookmarks/:bookmarkId  – Bookmark zu Liste hinzufügen
DELETE /v1/lists/:listId/bookmarks/:bookmarkId  – Bookmark aus Liste entfernen

Tags
GET    /v1/tags                    – Alle Tags
POST   /v1/tags                    – Tag erstellen
PATCH  /v1/tags/:tagId              – Umbenennen
DELETE /v1/tags/:tagId              – Löschen
POST   /v1/bookmarks/:id/tags       – Tags anhängen
DELETE /v1/bookmarks/:id/tags       – Tags entfernen
```

### Für Floccus Linkwarden-Modus (noch nicht vorhanden – muss implementiert werden)

```text
GET/POST          /api/v1/collections        – Linkwarden-Collections
GET/PATCH/DELETE  /api/v1/collections/:id
GET/POST          /api/v1/links              – Linkwarden-Links
GET/PATCH/DELETE  /api/v1/links/:id
GET/POST          /api/v1/tags
```

**Mapping KaraKeep → Linkwarden:**
- `bookmarkList` → `collection`
- `bookmark (type=link)` → `link`
- Felder: `name` → `name`, `url` → `url`, `title` → `name`

### Notwendige URL-Filterung für Floccus

Folgende URL-Schemata müssen in Kompatibilitäts-APIs **herausgefiltert** werden:
```text
data:, chrome:, file:, about:, moz-extension:, chrome-extension:, edge:
```
Nur `http`, `https`, `ftp`, `javascript` ausgeben.

---

## 11. Geeignete Erweiterungspunkte für LinkSteward

### A. Neue Datenbank-Tabellen

Die sauberste Strategie ist **additive Extension Tables** mit Prefix `linksteward_`:

```text
linksteward_item_extensions        – Erweiterte Felder für Bookmarks (deleted_at, url_hash etc.)
linksteward_collections            – Linkwarden-kompatible Collections (= Mapping auf bookmarkLists)
linksteward_link_health_checks     – Broken-Link-Prüfergebnisse
linksteward_duplicate_groups       – Duplikat-Gruppen
linksteward_duplicate_candidates   – Einzelne Kandidaten in Gruppen
linksteward_merge_events           – Merge-Protokoll
linksteward_archive_events         – Archivierungsereignisse (erweitert bestehende)
linksteward_external_mappings      – ID-Mappings für externe Systeme (Floccus, Linkwarden, etc.)
linksteward_ai_suggestions         – AI-Vorschläge (vor Übernahme durch Nutzer)
linksteward_domains                – Domain-Klassifizierung und -Metadaten
```

### B. Neue API-Routen

```text
packages/api/routes/linksteward/
├─ collections.ts    – Linkwarden-kompatible API (/api/v1/*)
├─ links.ts          – Linkwarden-Links
├─ duplicates.ts     – Duplikat-API
├─ linkHealth.ts     – Broken-Link-API
└─ native.ts         – Native LinkSteward API (/api/linksteward/v1/*)
```

Einbindung in `packages/api/index.ts`:
```typescript
import linksteward from "./routes/linksteward/native";
import linkwardenCompat from "./routes/linksteward/collections";

app
  .route("/api/linksteward/v1", linksteward)
  .route("/api/v1", linkwardenCompat);  // Linkwarden-Compat
```

### C. Neue tRPC-Router

```text
packages/trpc/routers/
├─ duplicates.ts     – Duplikat-Erkennung und -Verwaltung
├─ linkHealth.ts     – Broken-Link-Checks
└─ linksteward.ts    – Natives LinkSteward-Feature-Bundle
```

### D. Neue Worker

```text
apps/workers/workers/
├─ linkHealthWorker.ts     – Broken-Link-Überprüfung (HEAD/GET + Redirect-Verfolgung)
└─ duplicateWorker.ts      – Duplikat-Erkennung (URL-Normalisierung, Hash-Vergleich)
```

Neue Queues in `packages/shared-server/src/queues.ts` hinzufügen.

### E. Schema-Erweiterungen (minimalinvasiv)

Für Soft Delete: Entweder eigene Erweiterungs-Tabelle `linksteward_item_extensions` mit `deleted_at` oder direktes Hinzufügen von `deletedAt` zu `bookmarks`. Die additive Tabelle ist sicherer für Upstream-Kompatibilität.

---

## 12. Risiken für einen langfristigen Fork

### Kritische Risiken

**1. SQLite vs. PostgreSQL**
- LinkSteward-Architekturdok nennt PostgreSQL, KaraKeep nutzt SQLite
- Drizzle ORM unterstützt beide, aber SQLite hat Einschränkungen bei Concurrent-Writes
- Ein späterer Wechsel zu PostgreSQL erfordert Migration aller Daten und Schema-Änderungen
- **Entscheidung muss vor v0.1-alpha getroffen werden**

**2. Upstream-Merge-Konflikte**
- `packages/db/schema.ts` ist die kritischste Datei – jede KaraKeep-Schemaänderung muss mit LinkSteward-Erweiterungen zusammengeführt werden
- `packages/api/index.ts` und `packages/trpc/routers/_app.ts` werden bei neuen Features geändert
- Additive Extension-Tables reduzieren aber nicht eliminieren das Merge-Risiko

**3. Package-Namespace `@karakeep/*`**
- Alle internen Pakete verwenden `@karakeep/` als Namespace
- Umbenennung auf `@linksteward/` würde alle Import-Pfade betreffen (>500 Stellen)
- Empfehlung: Namespace vorerst beibehalten, Umbenennung als separater Sprint einplanen

**4. Stripe-Abonnements im Schema**
- `subscriptions`-Tabelle ist für Self-Hosting irrelevant
- Kein direktes Problem, aber tRPC-Router `subscriptions` und Migrations müssen mitgepflegt werden

**5. AIO-Container-Architektur**
- Das Single-Container-Design ist für Self-Hosting gut, aber Skalierung schwierig
- Kein Problem für MVP, aber bei späterer Service-Separation aufwändig umzubauen

### Moderate Risiken

**6. SQLite Concurrent-Writes**
- WAL-Modus ist aktiviert, aber bei vielen gleichzeitigen Imports/Crawls kann es zu Locks kommen
- Besonders kritisch wenn Linkwarden-kompatible API und native API gleichzeitig schreiben

**7. Meilisearch-Abhängigkeit**
- Pflichtkomponente für Volltext-Suche
- Separate Instanz notwendig, erhöht Deployment-Komplexität
- Alternative: SQLite FTS5 für MVP, Meilisearch für später

**8. Crawler-Komplexität**
- `crawlerWorker.ts` ist die größte und komplexeste Datei
- Playwright + Chromium als externe Abhängigkeit ist wartungsintensiv
- Chrome-Image muss mit Playwright-Version synchron gehalten werden

**9. Kein Soft-Delete in KaraKeep**
- LinkSteward braucht Soft Delete (ADR-015), KaraKeep hat es nicht
- Muss additiv implementiert werden, ohne KaraKeep-Kernlogik zu brechen
- Import-Worker prüft bereits `alreadyExists` – Duplikat-Logik ist vorhanden

**10. bookmarkList ≠ Linkwarden Collection**
- KaraKeep-Listen sind flache Strukturen mit optionalem `parentId` (Baum möglich)
- Linkwarden-Collections haben eigene Semantik (public, color, description)
- Mapping ist möglich, aber nicht 1:1 – Response-Felder müssen angepasst werden

---

## Empfehlungen

### Extension Tables oder direkte Schema-Erweiterung?

**Empfehlung: Hybridansatz**

```text
Direkte Erweiterung (nur wenige, sorgfältig gewählte Felder):
└─ bookmarks.deletedAt   – Soft Delete (zentral, wird von vielen Queries benötigt)

Extension Tables (für alle LinkSteward-spezifischen Daten):
├─ linksteward_link_health_checks
├─ linksteward_duplicate_groups
├─ linksteward_duplicate_candidates
├─ linksteward_external_mappings    – Für Floccus-Sync-IDs und Linkwarden-Mapping
└─ linksteward_archive_events
```

Begründung: Nur `deletedAt` direkt hinzufügen, weil es fundamentals Query-Verhalten beeinflusst. Alle anderen Features sauber in eigenen Tabellen halten, um Upstream-Merges zu erleichtern.

### Welche vorhandenen KaraKeep-Module können wiederverwendet werden?

```text
Vollständig wiederverwendbar
├─ packages/db/               – Schema + Drizzle-Setup (additiv erweitern)
├─ packages/shared/           – Config, AssetDB, Inference, Import/Export-Parser
├─ packages/shared-server/    – Queue-System, EventLogger, Tracing
├─ apps/workers/workers/crawlerWorker.ts  – Crawling-Infrastruktur
├─ apps/workers/workers/inference/       – AI-Tagging + Summarization
├─ apps/workers/workers/importWorker.ts  – Import-Pipeline (wiederverwendbar)
├─ packages/trpc/routers/bookmarks.ts    – Bookmark CRUD (kaum ändern)
├─ packages/trpc/routers/lists.ts        – Listen CRUD
└─ packages/trpc/routers/tags.ts         – Tags CRUD

Anpassbar wiederverwendbar
├─ packages/api/routes/bookmarks.ts      – Basis für KaraKeep-Compat-API (leicht anpassen)
├─ packages/api/routes/lists.ts          – Basis für Collection-Compat
└─ packages/trpc/lib/ruleEngine.ts       – Regelengine (für LinkSteward-Rules nutzbar)

Nicht direkt nutzbar (neu schreiben)
├─ Linkwarden-Compat-API-Routen          – /api/v1/collections, /api/v1/links
├─ Soft-Delete-Logik                     – muss zu allen Queries hinzugefügt werden
├─ Broken-Link-Worker                    – komplett neu
└─ Duplikat-Worker                       – komplett neu
```

### Welche Dateien/Module sollten zuerst angepasst werden?

**Reihenfolge für Sprint 1–3:**

```text
1. packages/db/schema.ts
   → linksteward_external_mappings Tabelle hinzufügen (für Floccus-Sync-IDs)
   → bookmarks.deletedAt Spalte hinzufügen
   → Migration erstellen: pnpm db:generate --name add_linksteward_base

2. packages/api/index.ts
   → Neue Route-Gruppen registrieren

3. packages/api/routes/linksteward/ (neu anlegen)
   → native.ts: /api/linksteward/v1/items, /api/linksteward/v1/collections
   → collections.ts: /api/v1/collections (Linkwarden-Compat)
   → links.ts: /api/v1/links (Linkwarden-Compat)

4. packages/trpc/routers/linksteward.ts (neu)
   → Items CRUD (Wrapper um bookmarks mit deletedAt-Filter)
   → Collections CRUD (Wrapper um bookmarkLists)

5. packages/trpc/routers/_app.ts
   → Neuen Router registrieren

6. packages/shared/types/linksteward.ts (neu)
   → Linkwarden-Response-Typen (ZLinkwardenCollection, ZLinkwardenLink etc.)
```

### Was ist das kleinste technische Feature für v0.1-alpha?

**Minimaler Pfad zum ersten Floccus-Sync:**

```text
v0.1-alpha Mindestumfang
├─ bookmarks.deletedAt – Soft Delete (1 Migration, Filter in allen Queries)
├─ linksteward_external_mappings – Floccus-ID-Tracking (1 Tabelle)
├─ /api/v1/collections – GET + POST + PATCH + DELETE (Linkwarden-Compat)
├─ /api/v1/links       – GET + POST + PATCH + DELETE (Linkwarden-Compat)
├─ /api/v1/tags        – GET + POST (minimal)
├─ Bearer-Auth für /api/v1/* (bereits vorhandener API-Key-Mechanismus nutzen)
├─ URL-Filter für Kompatibilitäts-API (data:, chrome: etc. ausblenden)
└─ Docker Compose Dev Setup (bestehendes nutzen, .env.linksteward ergänzen)
```

**Geschätzter Umfang:** 400–600 Zeilen neuer TypeScript-Code, 1 Datenbankmigraton.

### Welche offenen Fragen müssen vor der Implementierung geklärt werden?

```text
1. SQLite oder PostgreSQL?
   ├─ KaraKeep: SQLite (better-sqlite3)
   ├─ LinkSteward-Architekturdok: PostgreSQL
   ├─ Konsequenz: SQLite ist einfacher, PostgreSQL skaliert besser
   └─ Entscheidung: vor erster Migration treffen

2. Package-Namespace @karakeep/* oder @linksteward/*?
   ├─ Sofortiger Wechsel: ~500+ Import-Pfade ändern, sehr aufwändig
   ├─ Späterer Wechsel: technische Schuld, aber weniger Risiko beim Start
   └─ Empfehlung: vorerst @karakeep/* beibehalten, Umbenennung in Sprint 11+

3. Soft Delete: additive Tabelle oder direkte Spalte?
   ├─ Direkte Spalte bookmarks.deletedAt: einfacher, aber beeinflusst alle KaraKeep-Queries
   ├─ Eigene Tabelle linksteward_trash: komplexer, aber kein Upstream-Einfluss
   └─ Empfehlung: direkte Spalte, Queries über Drizzle-Relations anpassen

4. Floccus Linkwarden-Modus: welche API-Version?
   ├─ Linkwarden v2 API ist dokumentiert und stabil
   ├─ Genauer Endpunkt-Satz muss aus Floccus-Quellcode/Doku verifiziert werden
   └─ Test mit Firefox + Floccus im Linkwarden-Modus früh durchführen

5. Upstream-Strategie: aktiver Merge oder stabiler Fork?
   ├─ Aktiver Merge: regelmäßige Upstream-Updates übernehmen, mehr Aufwand
   ├─ Stabiler Fork: auf bestimmtem Commit einfrieren, KaraKeep-Updates manuell selektieren
   └─ Entscheidung beeinflusst Datei-Struktur (separate Branches vs. single branch)

6. Meilisearch: Pflicht oder optional für v0.1-alpha?
   ├─ KaraKeep: Meilisearch ist für Suche notwendig
   ├─ Für v0.1-alpha ohne Volltextsuche: Meilisearch weglassen möglich?
   └─ Empfehlung: Meilisearch im Docker Compose beibehalten, Suche als Bonus

7. Wie wird linksteward_external_mappings für Floccus befüllt?
   ├─ Floccus sendet keine eigene ID → LinkSteward muss Mapping erzeugen
   ├─ Frage: Wie erkennt Floccus beim nächsten Sync bereits existierende Einträge?
   └─ Antwort liegt im Floccus-Protokoll: vermutlich via URL oder Server-ID
```

---

## Zusammenfassung

KaraKeep ist eine gut strukturierte, produktionsreife Codebasis. Der Turborepo-Monorepo-Aufbau, die klare Trennung zwischen API-Routing-Layer (Hono) und Business-Logik (tRPC), sowie das flexible Queue-System bieten ausgezeichnete Erweiterungspunkte für LinkSteward.

Die wichtigsten technischen Stärken für den Fork:
- Vollständige Import-Pipeline (10+ Formate) sofort nutzbar
- Crawler-Infrastruktur (Playwright + Monolith + yt-dlp) bereits produktionsreif
- AI/Ollama-Integration vorhanden und deaktivierbar
- API-Key-System mit Scopes direkt für Floccus nutzbar

Die kritischste Entscheidung vor der ersten Implementierung ist die **Datenbankwahl (SQLite vs. PostgreSQL)**. Alle anderen Fragen können iterativ gelöst werden.
