# KaraKeep Analyse v0.1

## Ziel

Diese Analyse bewertet das lokale KaraKeep-Fork-Repository als technische Basis für LinkSteward. Sie nutzt `docs/index.md`, `docs/docs/linksteward/`, die vorhandenen ADRs sowie den lokalen Code in `apps/*`, `packages/*` und `docker/*`.

## Kurzfazit

KaraKeep ist als Basis für LinkSteward gut geeignet. Viele LinkSteward-Ziele existieren bereits als belastbare Grundmodule: Bookmarks, Listen, Tags, API Keys, Bearer Auth, REST/OpenAPI, tRPC, Worker-Queues, Crawling, Screenshots, HTML-Content, Vollseitenarchive, Import-Staging, RSS, Webhooks, Backups, Regelengine und OpenAI/Ollama-Inferenz.

Die größten LinkSteward-Lücken liegen nicht im Speichern von Links, sondern in der Kompatibilitätsschicht und in langfristigen Zusatzdaten:

- Linkwarden-kompatible API für Floccus fehlt als Adapter-Schicht.
- Soft Delete/Papierkorb ist im KaraKeep-Kern nicht sichtbar vorhanden.
- Link-Health-Historie, URL-Normalisierung, Duplicate-Gruppen, Sync-Mappings und AI-Suggestions brauchen eigene Persistenz.
- Direkte Änderungen an KaraKeep-Kerntabellen würden Upstream-Merges schnell teurer machen.

## 1. Repository-Struktur

Das Repository ist ein pnpm/turbo Monorepo.

```text
apps/web
├─ Next.js Web-App
├─ Hono API Mount unter /api
├─ NextAuth-Session-Integration
└─ Dashboard, Settings, Import, AI, API Keys, Feeds, Assets

apps/workers
├─ Queue Runner
├─ Crawler, Inference, Search, Feed, Import, Backup
├─ Asset Preprocessing, Webhooks, Rule Engine
└─ Health/Metrics HTTP-Server

apps/browser-extension
├─ KaraKeep Browser Extension
├─ API-Key Exchange
└─ SingleFile/pre-crawled archive flow

apps/mobile
└─ Expo/React Native Client

apps/cli
└─ CLI für Auth, Bookmarks, Lists, Tags, Admin, Dump, Migration

apps/mcp
└─ MCP-Server für Bookmarks/Lists/Tags
```

```text
packages/db
├─ Drizzle SQLite Schema
└─ Migrationen

packages/trpc
├─ interne App-API
├─ Auth/API-Key-Logik
├─ Router für Bookmarks, Lists, Tags, ImportSessions usw.
└─ Model-/Service-Schicht

packages/api
├─ Hono REST API
├─ /api/v1/*
└─ Adapter auf tRPC Caller

packages/open-api
└─ OpenAPI-Spezifikation

packages/shared
├─ Typen, Zod-Schemas, Config
├─ Search, Import/Export, Inference, Queueing
└─ Asset Storage Utilities

packages/shared-server
├─ Queue-Definitionen
├─ Event Logging, Tracing, Plugins
└─ Quota Service

packages/plugins
├─ queue-liteque
├─ queue-restate
├─ search-meilisearch
├─ ratelimit-memory
└─ ratelimit-redis
```

Bewertung:

- `packages/api` ist der natürliche Ort für Linkwarden-/LinkSteward-Kompatibilitäts-APIs.
- `packages/trpc` ist der natürliche Ort für interne LinkSteward-Services.
- `packages/db` sollte für LinkSteward additiv erweitert werden.
- `packages/shared/types/*` ist breit genutzt; Änderungen dort können Web, Mobile, Extension, CLI und REST betreffen.

## 2. Datenbankmodell

KaraKeep nutzt Drizzle mit SQLite. Das Schema liegt in `packages/db/schema.ts`.

Kernobjekte:

```text
user
├─ Auth-/Profilfelder
├─ Rolle admin/user
├─ Quotas
├─ Browser-Crawling-Setting
├─ Reader Settings
├─ AI Settings
└─ Backup Settings

apiKey
├─ name
├─ keyId
├─ keyHash
├─ scopes JSON
├─ lastUsedAt
└─ userId

bookmarks
├─ id, userId
├─ title, note, summary
├─ archived, favourited
├─ taggingStatus, summarizationStatus
├─ type: link | text | asset
└─ source: api | web | extension | cli | mobile | singlefile | rss | import

bookmarkLinks
├─ id = bookmark id
├─ url
├─ crawled metadata
├─ htmlContent oder contentAssetId
├─ crawledAt
├─ crawlStatus
└─ crawlStatusCode

bookmarkTexts
└─ text/sourceUrl

bookmarkAssets
└─ assetType, assetId, content, metadata, sourceUrl
```

Organisation:

```text
bookmarkTags
├─ userId, name
└─ normalizedName generated

tagsOnBookmarks
├─ bookmarkId
├─ tagId
├─ attachedAt
└─ attachedBy: ai | human

bookmarkLists
├─ userId, name, description, icon
├─ type: manual | smart
├─ query
├─ parentId
├─ rssToken
└─ public

bookmarksInLists
├─ bookmarkId
├─ listId
└─ listMembershipId
```

Assets und Archivierung:

```text
assets
├─ id
├─ assetType
├─ size, contentType, fileName
├─ bookmarkId
└─ userId

AssetTypes
├─ linkBannerImage
├─ linkScreenshot
├─ linkPdf
├─ assetScreenshot
├─ linkFullPageArchive
├─ linkPrecrawledArchive
├─ linkVideo
├─ linkHtmlContent
├─ bookmarkAsset
├─ userUploaded
├─ avatar
├─ backup
└─ unknown
```

Weitere vorhandene Tabellen:

```text
customPrompts
rssFeeds
rssFeedImports
webhooks
backups
ruleEngineRules
ruleEngineActions
invites
subscriptions
importSessions
importSessionBookmarks
importStagingBookmarks
userReadingProgress
highlights
```

Fehlende LinkSteward-Langzeitdaten:

```text
normalized_url
canonical_url
final_url
root_domain
url_hash
content_hash
archive_status als LinkSteward-Status
link_health_status + Historie
duplicate_status + Gruppen
deleted_at / trash_entries
revision / sync clock
external_mappings für Floccus/Linkwarden/Browser-IDs
AI suggestions mit accept/reject Status
```

Diese Felder sollten zunächst nicht direkt in `bookmarks` oder `bookmarkLinks` eingefügt werden.

## 3. API-Endpunkte

KaraKeep hat zwei API-Schichten:

```text
/api/trpc/*
└─ interne tRPC API für Web/Mobile/Extension/CLI

/api/v1/*
└─ Hono REST API, OpenAPI-dokumentiert
```

API-Mount:

```text
apps/web/app/api/[[...route]]/route.ts
└─ Hono basePath("/api").route("/", allApp)

packages/api/index.ts
├─ /health
├─ /version
├─ /trpc
├─ /v1
├─ /assets
├─ /public
├─ /metrics
└─ /webhooks
```

OpenAPI-dokumentierte `/api/v1` Routen:

```text
Bookmarks
├─ GET    /bookmarks
├─ POST   /bookmarks
├─ GET    /bookmarks/search
├─ GET    /bookmarks/check-url
├─ GET    /bookmarks/{bookmarkId}
├─ PATCH  /bookmarks/{bookmarkId}
├─ DELETE /bookmarks/{bookmarkId}
├─ POST   /bookmarks/{bookmarkId}/summarize
├─ GET    /bookmarks/{bookmarkId}/tags
├─ POST   /bookmarks/{bookmarkId}/tags
├─ DELETE /bookmarks/{bookmarkId}/tags/{tagId}
├─ GET    /bookmarks/{bookmarkId}/lists
├─ GET    /bookmarks/{bookmarkId}/highlights
├─ GET    /bookmarks/{bookmarkId}/assets
├─ POST   /bookmarks/{bookmarkId}/assets
├─ PUT    /bookmarks/{bookmarkId}/assets/{assetId}
└─ DELETE /bookmarks/{bookmarkId}/assets/{assetId}

Lists
├─ GET    /lists
├─ POST   /lists
├─ GET    /lists/{listId}
├─ PATCH  /lists/{listId}
├─ DELETE /lists/{listId}
├─ GET    /lists/{listId}/bookmarks
├─ PUT    /lists/{listId}/bookmarks/{bookmarkId}
└─ DELETE /lists/{listId}/bookmarks/{bookmarkId}

Tags
├─ GET    /tags
├─ POST   /tags
├─ GET    /tags/{tagId}
├─ PATCH  /tags/{tagId}
├─ DELETE /tags/{tagId}
└─ GET    /tags/{tagId}/bookmarks

Users
├─ GET /users/me
└─ GET /users/me/stats

Weitere
├─ /highlights
├─ /assets
├─ /admin/jobs/trigger/*
├─ /backups
└─ /feeds
```

tRPC Router:

```text
bookmarks, apiKeys, users, lists, tags, prompts, admin, feeds,
backups, highlights, importSessions, webhooks, assets, rules,
invites, publicBookmarks, subscriptions, config
```

Bewertung:

- KaraKeep-Kompatibilität ist weitgehend vorhanden.
- Linkwarden-Kompatibilität braucht eine neue Adapter-API.
- Native LinkSteward API sollte unter `/api/linksteward/v1/*` entstehen und nicht die KaraKeep-Routen überladen.

## 4. Auth/API-Key-System

API-Key-Format:

```text
ak2_<keyId>_<secret>
```

Validierung:

- `Authorization: Bearer <apiKey>` wird in `apps/web/server/api/client.ts` erkannt.
- Bei Erfolg enthält der Context `auth.type = "apiKey"`.
- Bei Fehlschlag fällt der Request auf Cookie-Session-Auth zurück.

Scopes:

```text
fullaccess

Resource scopes:
assets, backups, bookmarks, feeds, highlights, lists, prompts,
rules, tags, users, webhooks, importSessions, subscriptions

Access:
read
readwrite

Admin scopes:
admin:bookmarks:read/write
admin:jobs:read/write
admin:system:read/write
admin:users:read/write
```

API-Key-Router:

```text
apiKeys.create
apiKeys.regenerate
apiKeys.revoke
apiKeys.list
apiKeys.exchange
apiKeys.validate
```

Bewertung:

- Für Floccus reicht der bestehende Bearer-API-Key-Flow.
- `apiKeys.exchange` kann für Clients nützlich bleiben, ist aber für Floccus nicht zwingend.
- Für v0.1-alpha genügen die vorhandenen `bookmarks`, `lists`, `tags`, `users` Scopes.
- LinkSteward-native Scopes sollten später vorsichtig ergänzt werden.

## 5. Worker/Jobs

Queue-Provider:

```text
packages/plugins/queue-liteque
└─ SQLite-basierte Queue in DATA_DIR/queue.db

packages/plugins/queue-restate
└─ Restate-basierte Queue für stärkere Deployments
```

Queues:

```text
LinkCrawlerQueue
LowPriorityCrawlerQueue
OpenAIQueue
SearchIndexingQueue
AdminMaintenanceQueue
VideoWorkerQueue
FeedQueue
AssetPreprocessingQueue
WebhookQueue
RuleEngineQueue
BackupQueue
```

Worker:

```text
crawler
lowPriorityCrawler
inference
search
adminMaintenance
video
feed
assetPreprocessing
webhook
ruleEngine
backup
import
```

Import ist ein Polling Worker mit Staging-Tabellen, Batch-Verarbeitung, Backpressure und Fairness.

Bewertung:

- Worker-Infrastruktur direkt wiederverwenden.
- LinkSteward sollte eigene Queues additiv ergänzen, z. B. `LinkStewardLinkHealthQueue`, `LinkStewardDuplicateScanQueue`, `LinkStewardSyncQueue`.
- Für v0.1-alpha ist kein neuer Worker zwingend nötig, wenn zuerst Linkwarden-Floccus-Kompatibilität gebaut wird.

## 6. Archivierung/Crawling

Der Crawler ist ein starker Wiederverwendungspunkt.

Funktionen:

```text
Fetch/browserless Crawl
Playwright/Chromium Crawl über BROWSER_WEB_URL oder BROWSER_WEBSOCKET_URL
Stealth Plugin
optional Adblocker
Cookies via BROWSER_COOKIE_PATH
Proxy/NO_PROXY Support
SSRF/IP-Validierung im Netzwerkmodul
Screenshots
PDF
Banner Image
HTML Content inline oder als Asset
Full Page Archive via monolith
Video Download via yt-dlp
```

Status und Assets:

```text
bookmarkLinks.crawlStatus: pending | success | failure
bookmarkLinks.crawlStatusCode
bookmarkLinks.crawledAt

Assets:
├─ linkScreenshot
├─ linkPdf
├─ linkFullPageArchive
├─ linkPrecrawledArchive
├─ linkHtmlContent
├─ linkVideo
└─ linkBannerImage
```

Wichtige Env Vars:

```text
BROWSER_WEB_URL
BROWSER_WEBSOCKET_URL
BROWSER_CONNECT_ONDEMAND
BROWSER_COOKIE_PATH
CRAWLER_STORE_SCREENSHOT
CRAWLER_STORE_PDF
CRAWLER_FULL_PAGE_ARCHIVE
CRAWLER_VIDEO_DOWNLOAD
CRAWLER_ENABLE_ADBLOCKER
CRAWLER_MONOLITH_TIMEOUT_SEC
HTML_CONTENT_SIZE_INLINE_THRESHOLD_BYTES
CRAWLER_HTTP_PROXY / HTTPS_PROXY / NO_PROXY
CRAWLER_ALLOWED_INTERNAL_HOSTNAMES
```

Bewertung:

- LinkSteward muss Archivierung nicht neu bauen.
- Für MVP-Default "Metadaten + Reader-Text + Screenshot" reicht KaraKeep weitgehend.
- Eigene `archive_jobs`/`archive_events` sind sinnvoll, sobald UI, Policies, Retry-Historie und manuelle Reparatur wichtig werden.

## 7. Import/Export

Vorhandene Importquellen:

```text
html
pocket
matter
omnivore
karakeep
linkwarden
tab-session-manager
mymind
readwise-reader
instapaper
onetab
```

HTML Import:

- Netscape Bookmark File Parser vorhanden.
- Ordnerpfade werden als `paths: string[][]` geparst.
- Tags aus `TAGS` und `ADD_DATE` werden übernommen.

Export:

- KaraKeep JSON Export enthält Bookmarks und Lists.
- Netscape HTML Export ist vorhanden, aber eher flach; vollständige Ordnerhierarchie aus dem Listenbaum muss für LinkSteward ergänzt werden.

Import-Sessions:

```text
importSessions
├─ name, userId, rootListId
├─ status: staging | pending | running | paused | completed | failed
└─ lastProcessedAt

importStagingBookmarks
├─ type, url, title, content, note
├─ tags JSON
├─ listIds JSON
├─ sourceAddedAt
├─ archived
├─ processing status/result
└─ resultBookmarkId
```

Bewertung:

- Browser HTML Import ist praktisch schon vorhanden.
- Für v0.1-alpha sollte diese Strecke wiederverwendet werden.
- Browser HTML Export mit Ordnerhierarchie ist ein LinkSteward-Erweiterungspunkt.
- Asset-Bookmarks werden im Import-Worker derzeit als nicht unterstützt behandelt.

## 8. AI/Ollama

Provider-Auswahl:

```text
OPENAI_API_KEY gesetzt
└─ OpenAIInferenceClient

sonst OLLAMA_BASE_URL gesetzt
└─ OllamaInferenceClient

sonst
└─ keine Inferenz
```

Funktionen:

```text
inferFromText
inferFromImage
generateEmbeddingFromText
```

AI-Felder:

```text
bookmarks.taggingStatus
bookmarks.summarizationStatus
bookmarks.summary
tagsOnBookmarks.attachedBy = ai | human
users.autoTaggingEnabled
users.autoSummarizationEnabled
users.tagStyle
users.curatedTagIds
users.inferredTagLang
customPrompts
```

Wichtige Env Vars:

```text
OPENAI_API_KEY
OPENAI_BASE_URL
OLLAMA_BASE_URL
OLLAMA_KEEP_ALIVE
INFERENCE_TEXT_MODEL
INFERENCE_IMAGE_MODEL
INFERENCE_CONTEXT_LENGTH
INFERENCE_MAX_OUTPUT_TOKENS
INFERENCE_OUTPUT_SCHEMA
INFERENCE_ENABLE_AUTO_TAGGING
INFERENCE_ENABLE_AUTO_SUMMARIZATION
```

Bewertung:

- Ollama ist bereits gut anschlussfähig.
- Auto-Tagging und Summary können wiederverwendet werden.
- LinkSteward-spezifische AI-Suggestions sollten später additiv modelliert werden, statt sofort als echte Tags geschrieben zu werden.

## 9. Docker-Setup

Standard Compose:

```text
web
├─ ghcr.io/karakeep-app/karakeep:${KARAKEEP_VERSION:-release}
├─ Port 3000
├─ Volume data:/data
├─ MEILI_ADDR=http://meilisearch:7700
├─ BROWSER_WEB_URL=http://chrome:9222
└─ DATA_DIR=/data

chrome
├─ gcr.io/zenika-hub/alpine-chrome:124
└─ remote debugging auf 9222

meilisearch
├─ getmeili/meilisearch:v1.41.0
└─ Volume meilisearch:/meili_data
```

Dockerfile:

- Multi-stage Build.
- Baut DB-Migrationen, Next.js Web-App, Worker, CLI und MCP.
- Runtime nutzt s6-overlay.
- AIO Image kann Web + Worker + DB-Migration zusammen starten.
- Separate `web`, `workers`, `cli`, `mcp` Targets existieren.
- Runtime bringt `graphicsmagick`, `ghostscript`, `ffmpeg`, `yt-dlp` und `monolith` mit.

Bewertung:

- Sehr gute Basis für Docker Compose als Primärziel.
- LinkSteward muss Image-Namen, Branding und Env-Beispiele später sauber trennen.
- Für v0.1-alpha kann das AIO-Setup fast unverändert genutzt werden.

## 10. Floccus-relevante KaraKeep-API-Endpunkte

Floccus braucht im Kern:

- Bearer Auth
- Ordner/Collections lesen, erstellen, ändern, löschen
- Bookmarks lesen, erstellen, ändern, löschen
- Bookmark-Ordner-Zuordnung lesen und setzen
- Tags minimal lesen/setzen
- stabile IDs und berechenbares Delete-/Konfliktverhalten

KaraKeep-relevante Endpunkte:

```text
User/Auth
├─ GET /api/v1/users/me
└─ Authorization: Bearer <apiKey>

Bookmarks
├─ GET    /api/v1/bookmarks
├─ POST   /api/v1/bookmarks
├─ GET    /api/v1/bookmarks/{bookmarkId}
├─ PATCH  /api/v1/bookmarks/{bookmarkId}
├─ DELETE /api/v1/bookmarks/{bookmarkId}
├─ GET    /api/v1/bookmarks/check-url
├─ GET    /api/v1/bookmarks/{bookmarkId}/lists
├─ GET    /api/v1/bookmarks/{bookmarkId}/tags
├─ POST   /api/v1/bookmarks/{bookmarkId}/tags
└─ DELETE /api/v1/bookmarks/{bookmarkId}/tags/{tagId}

Lists / Collections
├─ GET    /api/v1/lists
├─ POST   /api/v1/lists
├─ GET    /api/v1/lists/{listId}
├─ PATCH  /api/v1/lists/{listId}
├─ DELETE /api/v1/lists/{listId}
├─ GET    /api/v1/lists/{listId}/bookmarks
├─ PUT    /api/v1/lists/{listId}/bookmarks/{bookmarkId}
└─ DELETE /api/v1/lists/{listId}/bookmarks/{bookmarkId}

Tags
├─ GET    /api/v1/tags
├─ POST   /api/v1/tags
├─ GET    /api/v1/tags/{tagId}
├─ PATCH  /api/v1/tags/{tagId}
└─ DELETE /api/v1/tags/{tagId}
```

Einschränkungen:

- KaraKeep-API ist nicht automatisch Linkwarden-kompatibel.
- `bookmarks` enthalten auch Text/Asset-Typen; Floccus-Kompatibilitäts-APIs sollten nur URL-Bookmarks ausgeben.
- LinkSteward-Doku erlaubt in Kompatibilitäts-APIs nur `http(s)`, `ftp`, `javascript`.
- Sync-Löschungen sollten nicht sofort harte KaraKeep-Deletes sein.
- Eine `external_mappings` Tabelle für Floccus/Linkwarden IDs fehlt.

## 11. Erweiterungspunkte für LinkSteward

Empfohlene additive Tabellen:

```text
linksteward_item_extensions
├─ bookmarkId
├─ normalizedUrl
├─ canonicalUrl
├─ finalUrl
├─ rootDomain
├─ urlHash
├─ contentHash
├─ archiveStatus
├─ linkHealthStatus
├─ duplicateStatus
├─ revision
├─ deletedAt
└─ metadataJson

linksteward_external_mappings
├─ provider: floccus | linkwarden | browser_html | nextcloud | webdav
├─ externalId
├─ bookmarkId nullable
├─ listId nullable
├─ userId
├─ syncClientId nullable
└─ metadataJson

linksteward_sync_events
linksteward_link_health_checks
linksteward_duplicate_groups
linksteward_duplicate_candidates
linksteward_ai_suggestions
linksteward_archive_jobs
linksteward_archive_events
```

Code-Andockpunkte:

```text
packages/api
├─ Linkwarden Compatibility API
├─ Native /api/linksteward/v1 API
└─ Response Mapping / unsupported item filters

packages/trpc
├─ LinkSteward Services
├─ Sync/Soft Delete Logic
└─ Domain/Duplicate/Health Services

packages/db
└─ additive Drizzle Tabellen + Migrationen

packages/shared/types
└─ LinkSteward Zod Schemas, getrennt von KaraKeep Schemas

apps/workers
└─ spätere LinkHealth/Duplicate/Sync Worker
```

Wiederverwendbare Module:

```text
Auth/API Keys
Bookmarks/Links CRUD
Lists als Collections
Tags
Asset Storage
Crawler/Archivierung
Import Sessions
HTML Import Parser
HTML/KaraKeep Export Grundlagen
Ollama/OpenAI Inference
Queue/Worker-Infrastruktur
Search/Meilisearch
Rule Engine als spätere Grundlage
Docker Compose/AIO Image
```

## 12. Risiken für einen langfristigen Fork

Technische Risiken:

- Direkte Änderungen an `packages/db/schema.ts` Kernfeldern erzeugen Migrations- und Merge-Konflikte.
- tRPC-Modelle und Shared Types sind breit genutzt; kleine Shape-Änderungen können viele Clients brechen.
- REST API ist ein Adapter auf tRPC; Kompatibilitäts-APIs sollten interne Router nicht verbiegen.
- SQLite ist für Self-hosting gut, aber lange Sync-/Health-/Duplicate-Historien brauchen gute Indizes.
- Worker-Jobs sind asynchron; Floccus erwartet unmittelbare CRUD-Semantik.
- Crawler/Archivierung darf Sync nicht blockieren.
- API-Key-Scopes sind statisch typisiert; LinkSteward-Scopes brauchen vorsichtige Erweiterung.

Produkt-/Kompatibilitätsrisiken:

- Floccus erwartet exakte API-Semantik; "fast kompatibel" reicht oft nicht.
- Linkwarden- und KaraKeep-Kompatibilität parallel erhöhen Testaufwand.
- Browser-Bookmark-Sync braucht Soft Delete und Konfliktmodell.
- Nicht-URL-Items müssen in Kompatibilitäts-APIs ausgeblendet werden, ohne im LinkSteward-Kern verloren zu gehen.
- Auto-Tagging darf Floccus-Sync nicht destabilisieren, wenn Tags asynchron entstehen.

Fork-Risiken:

- Branding/Package-Namen sind tief im Repo verteilt.
- Upstream kann Schema, API-Shapes oder Worker-Verhalten ändern.
- Je früher LinkSteward Kernmodule umbenennt oder umformt, desto höher die Merge-Kosten.
- AGPL-3.0 passt laut LinkSteward-ADR, muss aber bei öffentlichem Betrieb und Fork-Kommunikation bewusst behandelt werden.

## Empfehlung

### Extension Tables oder direkte Schema-Erweiterung?

Empfehlung: Extension Tables.

Begründung:

- LinkSteward-Zusatzdaten sind größtenteils orthogonal zum KaraKeep-Kern.
- Upstream-Kompatibilität bleibt höher.
- Sync-, Duplicate-, LinkHealth- und AI-Suggestion-Semantik können entwickelt werden, ohne bestehende KaraKeep-Clients zu brechen.
- Migrationen bleiben additiv und besser rückbaubar.

Direkte Schema-Erweiterung ist nur sinnvoll für Felder, die dauerhaft in KaraKeep-Kernabfragen gebraucht werden und ohne Join kritisch wären. Für v0.1-alpha ist das nicht notwendig.

### Welche Module können wiederverwendet werden?

Direkt wiederverwenden:

```text
Auth/API Keys
Bookmarks/BookmarkLinks
BookmarkLists/bookmarksInLists
Tags/tagsOnBookmarks
Assets/Asset Storage
Crawler Worker
OpenAI/Ollama Inference
Import Sessions + HTML Parser
Queue/Worker Plugins
Docker Compose/AIO Dockerfile
Meilisearch Search
REST/tRPC Infrastruktur
```

Mit Adapter wiederverwenden:

```text
KaraKeep REST API
KaraKeep Exporter
Rule Engine
Crawler Status
AI Tagging
Backups
Webhooks
```

Additiv neu bauen:

```text
Linkwarden Compatibility API
Native LinkSteward API
Soft Delete/Papierkorb
External Mappings/Sync Events
Duplicate Groups
Link Health History
AI Suggestions Workflow
Browser HTML Export mit Ordnerhierarchie
```

### Kleinstes technisches Feature für v0.1-alpha

Das kleinste sinnvolle technische Feature ist:

```text
Floccus erster Sync im Linkwarden-Modus
```

Minimaler Scope:

```text
1. Bestehende KaraKeep App lokal per Docker/Dev starten
2. Bestehenden API-Key Flow nutzen
3. Linkwarden-kompatible Adapter-Routen bauen:
   ├─ GET/POST/PATCH/DELETE /api/v1/collections
   ├─ GET/POST/PATCH/DELETE /api/v1/links
   └─ GET/POST /api/v1/tags minimal
4. Intern mappen:
   ├─ collections -> bookmarkLists
   ├─ links -> bookmarks + bookmarkLinks
   ├─ collection membership -> bookmarksInLists
   └─ tags -> bookmarkTags + tagsOnBookmarks
5. Nur URL-Bookmarks mit erlaubten URL-Schemata ausgeben
6. Einfache External-Mapping/Soft-Delete Extension Tables vorbereiten
7. Test: Floccus erstellt Browser-Bookmark -> LinkSteward zeigt ihn an
8. Test: LinkSteward-Änderung -> Floccus synchronisiert zurück
```

Warum zuerst das?

- Der größte unbekannte MVP-Risikoblock ist Floccus-Kompatibilität.
- Ein erfolgreicher Linkwarden-Floccus-Sync validiert Datenmodell, Auth, Collections, Links, Tags und Sync-Semantik gleichzeitig.
- Archivierung, Ollama und Duplikate sind bereits teilweise vorhanden oder können später additiv vertieft werden.
