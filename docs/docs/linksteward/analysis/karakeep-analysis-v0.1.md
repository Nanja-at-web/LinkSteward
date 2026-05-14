# KaraKeep Analyse v0.1 – LinkSteward Entscheidungsgrundlage

> Erstellt: 2026-05-14  
> Basis: Konsolidierung aus zwei unabhängigen Primäranalysen (Codex + Claude)  
> und zwei unabhängigen Vergleichsauswertungen  
> Zweck: Verbindliche Entscheidungsgrundlage für LinkSteward v0.1-alpha

---

## 1. Kurzfazit

KaraKeep ist als technische Basis für LinkSteward geeignet. Der vorhandene technische Kern – Auth, Bookmarks, Listen, Tags, Crawler, Archivierung, Import, Worker-Infrastruktur, AI/Ollama, Docker – ist weit genug, um nicht bei null zu beginnen.

Die größten LinkSteward-Lücken sind nicht das Speichern von Links, sondern:

- **Linkwarden-kompatible API** für Floccus fehlt als eigene Adapter-Schicht
- **Soft Delete/Papierkorb** ist im KaraKeep-Kern nicht vorhanden
- **External Mappings** für Floccus/Linkwarden-IDs fehlen
- **URL-Normalisierung**, **Duplicate-Gruppen** und **Link-Health-Historie** fehlen

Für v0.1-alpha ist die Priorität klar:

```text
Linkwarden-kompatible API
→ Floccus im Linkwarden-Modus
→ erster Browser-Bookmark-Sync bidirektional
→ keine irreversiblen Löschungen
```

Alles andere – Crawler-Erweiterungen, AI-Suggestions, Duplicate-Erkennung, PostgreSQL – ist Post-Alpha.

**Wichtige Korrektur gegenüber früheren Notizen:** Das Queue-System ist **nicht Bull-basiert**. Es ist `queue-liteque` (SQLite-Plugin) und `queue-restate` (alternative Deployment-Option). Neue LinkSteward-Worker-Queues müssen als Plugins nach diesem Muster implementiert werden.

---

## 2. Belastbare Entscheidungen für LinkSteward v0.1-alpha

Diese Entscheidungen sind durch vier unabhängige Analyse-Ebenen (2 Primäranalysen, 2 Vergleiche) konvergiert bestätigt:

```text
Beschlossen für v0.1-alpha:
├─ KaraKeep bleibt technische Basis
├─ SQLite bleibt bestehen (kein PostgreSQL-Umbau)
│  └─ Architekturdokumentation wird korrigiert
├─ @karakeep/* Namespace bleibt bestehen (keine Großumbenennung)
├─ Auth / API Keys werden wiederverwendet
├─ Bookmarks / Lists / Tags werden wiederverwendet
├─ Linkwarden-kompatible API ist der erste Implementierungsblock
│  ├─ GET/POST/PATCH/DELETE /api/v1/collections
│  ├─ GET/POST/PATCH/DELETE /api/v1/links
│  └─ GET/POST /api/v1/tags (minimal)
├─ Floccus Linkwarden-Modus ist der primäre Alpha-Test
├─ Soft Delete additiv über linksteward_item_extensions.deletedAt
├─ External Mappings additiv über linksteward_external_mappings
├─ Nicht-URL-Items aktiv in Compat-API filtern
├─ AI-Tags im Alpha ausblenden oder read-only behandeln
├─ Queue-System ist queue-liteque/restate (nicht Bull)
└─ Keine direkte bookmarks.deletedAt-Spalte im ersten Alpha-Slice
```

Alpha gilt als erfolgreich, wenn:

```text
1. Floccus verbindet sich per Bearer-API-Key ohne Fehler
2. Browser-Ordner erscheinen als LinkSteward Collections
3. Browser-Bookmarks erscheinen als LinkSteward Links
4. Änderungen (Titel, URL, Collection) synchronisieren bidirektional
5. Unerlaubte URL-Schemata und Nicht-URL-Items erscheinen nicht in Floccus
6. Löschungen verursachen keinen unwiederbringlichen Datenverlust
```

---

## 3. Repository- und Stack-Zusammenfassung

KaraKeep ist ein **pnpm/Turborepo-Monorepo**:

```text
apps/
├─ web/          Next.js 15 – Haupt-Webapplikation (React, TypeScript, Tailwind, shadcn/ui)
│                API-Mount: apps/web/app/api/[[...route]]/route.ts
├─ workers/      Node.js – Hintergrundverarbeitung
├─ browser-extension/
├─ cli/
├─ mcp/          Model Context Protocol Server
├─ mobile/       Expo/React Native
└─ landing/

packages/
├─ api/          Hono REST API (dünner Adapter auf tRPC)
├─ trpc/         Business Logic, tRPC Router (18 Sub-Router)
├─ db/           Drizzle ORM Schema + Migrationen (SQLite)
├─ shared/       Typen, Config, Inference, Import/Export, Asset-Storage
├─ shared-server/ Queue-System, EventLogger, Tracing
├─ shared-react/ React-Komponenten und Hooks
├─ sdk/          TypeScript-SDK
└─ open-api/     OpenAPI-Spezifikation

packages/plugins/
├─ queue-liteque     – SQLite-basierte Queue (DATA_DIR/queue.db)
├─ queue-restate     – Restate-basierte Queue (stärkere Deployments)
├─ search-meilisearch
├─ ratelimit-memory
└─ ratelimit-redis

tooling/
├─ typescript/   Konfigurationen
├─ tailwind/
└─ oxlint/
```

**Technologie-Stack:**

```text
Build:       Turborepo + pnpm Workspaces
Backend:     Hono (HTTP), tRPC (Business Logic), Drizzle ORM
Frontend:    Next.js 15, React, Tailwind CSS, shadcn/ui
Datenbank:   SQLite via better-sqlite3 (WAL-Modus aktiviert)
Suche:       Meilisearch
Queues:      queue-liteque (SQLite-Plugin) oder queue-restate
Container:   s6-overlay als Prozessmanager im Docker AIO-Image
Runtime:     graphicsmagick, ghostscript, ffmpeg, yt-dlp, monolith
```

**API-Schichtung:**

```text
/api/trpc/*    → interne tRPC API (Web, Mobile, Extension, CLI)
/api/v1/*      → Hono REST API (OpenAPI-dokumentiert, Adapter auf tRPC)
/api/assets/*  → Asset-Download
/api/webhooks/ → eingehende Webhooks
/api/public/*  → öffentliche Listen (RSS-Token)
/api/metrics   → Prometheus-Metriken
```

---

## 4. Datenbank-Ist-Zustand

KaraKeep nutzt **SQLite** mit Drizzle ORM. Schema: `packages/db/schema.ts`.

### Authentifizierung und Auth

```text
user                  – id, name, email, password, salt, role (admin|user),
                        AI-Settings, Backup-Settings, Reader-Settings
account               – OAuth-Provider-Accounts (via @auth/core / NextAuth.js)
session               – aktive Sessions (sessionToken CUID2)
verificationToken     – E-Mail-Verifikation
passwordResetToken    – Passwort-Reset
apiKey                – keyId, keyHash (SHA-256), scopes JSON, lastUsedAt
```

**API-Key-Format:** `ak2_<keyId(10 Bytes hex)>_<secret(16 Bytes hex)>`  
**Legacy-Format** `ak1_*` wird noch unterstützt.  
**Auth:** NextAuth.js, bcrypt (10 Runden) + eigener Salt, OIDC-kompatibel.

**Scopes:**

```text
fullaccess
<resource>:read | readwrite
admin:<resource>:read | readwrite

Ressourcen: assets, backups, bookmarks, feeds, highlights, lists,
            prompts, rules, tags, users, webhooks, importSessions,
            subscriptions
```

### Bookmarks

```text
bookmarks             – id, userId, type (link|text|asset), title, note, summary,
                        archived, favourited, taggingStatus, summarizationStatus, source
bookmarkLinks         – url, crawledAt, crawlStatus, crawlStatusCode,
                        htmlContent, contentAssetId, favicon, imageUrl
bookmarkTexts         – text, sourceUrl
bookmarkAssets        – assetId, assetType (image|pdf), content, metadata
```

### Organisation

```text
bookmarkTags          – name, normalizedName (GENERATED ALWAYS AS, case-insensitive), userId
tagsOnBookmarks       – bookmarkId, tagId, attachedAt, attachedBy (ai|human)
bookmarkLists         – name, icon, type (manual|smart), query, parentId, rssToken, public
bookmarksInLists      – bookmarkId, listId, listMembershipId
listCollaborators     – listId, userId, role (viewer|editor)
listInvitations       – ausstehende Einladungen
```

### Assets und Archivierung

```text
assets                – assetType, size, contentType, fileName, bookmarkId, userId

AssetTypes:
├─ linkBannerImage        linkScreenshot        linkPdf
├─ assetScreenshot        linkFullPageArchive   linkPrecrawledArchive
├─ linkVideo              linkHtmlContent       bookmarkAsset
├─ userUploaded           avatar                backup
└─ unknown
```

### Erweiterte Features

```text
highlights            – startOffset, endOffset, color (red|green|blue|yellow), note
userReadingProgress   – readingProgressOffset, readingProgressPercent
customPrompts         – appliesTo (all_tagging|text|images|summary)
rssFeedsTable         – url, enabled, importTags, lastFetchedStatus
rssFeedImportsTable   – entryId, rssFeedId, bookmarkId
webhooksTable         – url, events (created|edited|crawled|ai tagged|deleted), token
```

### Backup und Import

```text
backupsTable          – assetId, size, bookmarkCount, status
importSessions        – status (staging|pending|running|paused|completed|failed)
importSessionBookmarks
importStagingBookmarks – type, url, title, tags, listIds, status, result
```

### Regel-Engine und System

```text
ruleEngineRulesTable   – event, condition, tagId
ruleEngineActionsTable – action, listId, tagId
invites               – email, token, usedAt
subscriptions         – stripeCustomerId, status, tier (free|paid)  ← Self-Hosting-Ballast
config                – Key-Value-Konfiguration
```

### Design-Details

- **Generated Column:** `bookmarkTags.normalizedName` – SQLite `GENERATED ALWAYS AS`
- **Composite Indexes:** `(userId, createdAt, id)` für Pagination-Queries
- **WAL-Modus** aktiviert für bessere Concurrent-Read-Performance
- **Stripe-Tabelle:** für Self-Hosting irrelevant, muss aber mitgepflegt werden

### Fehlende LinkSteward-Felder (nicht in KaraKeep-Kern)

```text
deletedAt / Soft Delete     – kein Papierkorb vorhanden
normalizedUrl, urlHash      – keine URL-Normalisierung
externalMappings            – kein Tracking von Floccus/Linkwarden-IDs
linkHealthStatus            – keine Broken-Link-Historie
duplicateStatus             – keine Duplikat-Gruppen
revision / syncClock        – keine Sync-Versionierung
aiSuggestions               – kein Accept/Reject-Workflow
```

---

## 5. SQLite vs. PostgreSQL – Entscheidung

**Ist-Zustand:** KaraKeep nutzt SQLite (`better-sqlite3`, WAL-Modus).

**Widerspruch:** Die LinkSteward-Architekturdokumentation (`architecture-v0.1.md`) nennt PostgreSQL als Ziel. Das ist ein Dokumentationsfehler, kein Implementierungsbefund.

**Entscheidung für v0.1-alpha:**

```text
SQLite bleibt bestehen.
Kein PostgreSQL-Umbau vor oder während v0.1-alpha.
```

**Begründung:**

- Ein PostgreSQL-Umbau bei Fork-Start würde den Alpha-Scope massiv vergrößern
- Drizzle ORM unterstützt beide; der Wechsel ist später möglich
- SQLite ist für Self-Hosting im Heimnetz gut geeignet
- WAL-Modus deckt parallele Reads ausreichend ab

**Folgeaktion:**

```text
Architekturdokumentation korrigieren:
→ Entweder PostgreSQL als explizites späteres Ziel per ADR markieren
→ Oder PostgreSQL als Anforderung streichen
→ ADR wird als Issue 001 erstellt
```

---

## 6. Queue-System-Korrektur: queue-liteque/restate, nicht Bull

**Korrektur:** Eine frühere Analyse hat das Queue-System als „vermutlich Bull-basiert" beschrieben. Das ist **faktisch falsch**.

**Tatsächliches Queue-System:**

```text
packages/plugins/queue-liteque
└─ SQLite-basierte Queue
   ├─ Queue-Datenbank: DATA_DIR/queue.db
   ├─ Implementiert als Plugin nach packages/shared-server Plugin-Muster
   └─ Standard für AIO/Self-Hosting-Deployments

packages/plugins/queue-restate
└─ Restate-basierte Queue
   ├─ Alternative für stärkere Deployments
   └─ Gleiche Plugin-Schnittstelle
```

**Queues (alle vorhandenen):**

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

**Timer-Loops (keine Queue-Consumer):**

```text
FeedRefreshingWorker   – läuft als eigenständiger Timer-Loop
BackupSchedulingWorker – läuft als eigenständiger Timer-Loop
```

**Konsequenz für LinkSteward:**

Neue LinkSteward-Worker-Queues (`LinkStewardLinkHealthQueue`, `LinkStewardDuplicateScanQueue`) müssen als Plugins nach dem `queue-liteque`-Muster implementiert werden – nicht als Bull-Jobs. Für v0.1-alpha ist kein neuer Worker notwendig.

---

## 7. Wiederverwendbare KaraKeep-Module

### Vollständig wiederverwenden

```text
packages/db/              – Schema und Drizzle-Setup (additiv erweitern)
packages/api/             – Hono-Routing-Infrastruktur
packages/trpc/routers/    – bookmarks, lists, tags (CRUD)
packages/shared/          – Config, Inference, Import/Export-Parser, Asset-Storage
packages/shared-server/   – Queue-System (Plugins), EventLogger, Tracing
apps/workers/crawlerWorker.ts  – Playwright/Chromium Crawling
apps/workers/inferenceWorker.ts – AI-Tagging + Summarization
apps/workers/importWorker.ts   – Import-Pipeline (zweiphasig)
Docker Compose / AIO Dockerfile
```

### Worker-Infrastruktur wiederverwenden

```text
crawler            – Playwright/Chromium, Stealth, Adblocker, Monolith, yt-dlp
lowPriorityCrawler – wie crawler mit niedriger Priorität
inference          – OpenAI/Ollama Auto-Tagging + Summarization
search             – Meilisearch-Indizierung
feed               – RSS-Feed-Verarbeitung
assetPreprocessing – OCR, Asset-Vorverarbeitung
webhook            – Webhook-Auslieferung
ruleEngine         – Regelauswertung nach Bookmark-Events
backup             – Automatische Backups
import             – Polling-basierte Import-Session-Verarbeitung
```

### Mit Adapter wiederverwenden

```text
packages/api/routes/bookmarks.ts  – Basis für KaraKeep-Compat-Anpassungen
packages/api/routes/lists.ts      – Basis für Collection-Adapter
Rule Engine                       – für LinkSteward-Rules nutzbar
KaraKeep-Exporter                 – Basis für HTML-Export mit Ordnerhierarchie
```

### Neu bauen

```text
Linkwarden Compatibility API    – /api/v1/collections, /api/v1/links
Native LinkSteward API          – /api/linksteward/v1/*
Soft Delete / Papierkorb        – additiv über Extension Tables
External Mappings               – linksteward_external_mappings
Duplicate Groups                – linksteward_duplicate_groups (Post-Alpha)
Link Health History             – linksteward_link_health_checks (Post-Alpha)
AI Suggestions Workflow         – linksteward_ai_suggestions (Post-Alpha)
HTML Export mit Ordnerhierarchie – Erweiterung des bestehenden Exporters
```

### Vorhandene Crawling-Konfiguration

```text
CRAWLER_STORE_SCREENSHOT=true        (Standard)
CRAWLER_DOWNLOAD_BANNER_IMAGE=true   (Standard)
CRAWLER_FULL_PAGE_SCREENSHOT=false   (optional)
CRAWLER_STORE_PDF=false              (optional)
CRAWLER_FULL_PAGE_ARCHIVE=false      (optional, via monolith)
CRAWLER_VIDEO_DOWNLOAD=false         (optional, via yt-dlp)

Asset Storage:
├─ Lokal: DATA_DIR/assets/
└─ S3-kompatibel: ASSET_STORE_S3_* Umgebungsvariablen

OCR: OCR_LANGS, OCR_CONFIDENCE_THRESHOLD, OCR_USE_LLM
```

### Docker-Setup

```text
web         – KaraKeep AIO Image (Port 3000)
             Web + API + Workers + SQLite-DB in einem Container
             s6-overlay als Prozessmanager
chrome      – gcr.io/zenika-hub/alpine-chrome:124 (Port 9222)
meilisearch – getmeili/meilisearch:v1.41.0

Volumes: data:/data (DB + Assets), meilisearch:/meili_data
```

**AIO-Architektur:** Single-Container-Design vereinfacht Self-Hosting erheblich, begrenzt aber Skalierung. Für v0.1-alpha kein Problem; Service-Separation wäre später aufwändig.

---

## 8. Linkwarden-/Floccus-Kompatibilität

### Was Floccus braucht (Linkwarden-Modus)

```text
Bearer-Auth (Bearer <apiKey>)
GET/POST/PATCH/DELETE /api/v1/collections    – Ordner-Mapping
GET/POST/PATCH/DELETE /api/v1/links          – Bookmark-Mapping
GET/POST              /api/v1/tags           – Tags (Umfang unbekannt)
Stabile Server-IDs
Konsistente Delete-Semantik
Pagination
Korrekte Feldnamen (Linkwarden-kompatibel)
```

### Was noch implementiert werden muss

Diese Endpunkte existieren in KaraKeep **nicht**. Sie müssen als neue Adapter-Routen gebaut werden:

```text
/api/v1/collections    → Adapter auf bookmarkLists
/api/v1/links          → Adapter auf bookmarks (type=link) + bookmarkLinks
```

### Was bereits vorhanden ist

```text
Bearer API-Key-Auth        – vorhanden, für Floccus nutzbar
GET /api/v1/users/me       – vorhanden
GET/POST/PATCH/DELETE /api/v1/tags – vorhanden (ob Linkwarden-kompatibel: prüfen)
```

### Mapping KaraKeep → Linkwarden

```text
bookmarkLists         → collections
bookmarks (type=link) → links
bookmarksInLists      → link-zu-collection Zuordnung
bookmarkTags          → tags
bookmarkLists.parentId → collection parent (verschachtelte Collections)
```

### URL-Filterung (Pflicht)

In der Linkwarden-Compat-API dürfen **nur** folgende URL-Schemata ausgegeben werden:

```text
Erlaubt:    http, https, ftp, javascript
Ausblenden: data:, chrome:, file:, about:, moz-extension:,
            chrome-extension:, edge: und alle anderen
```

Nicht-URL-Items (`type=text`, `type=asset`) müssen aktiv ausgefiltert werden.

### AI-Tags im Linkwarden-Sync

AI-generierte Tags entstehen asynchron nach dem Crawl. Wenn Floccus beim nächsten Sync neue Tags sieht, die der Nutzer nicht gesetzt hat, kann das zu unerwarteten Browser-Bookmark-Änderungen führen.

**Alpha-Entscheidung:** AI-Tags in der Linkwarden-Compat-API für Alpha **ausblenden** oder als **read-only** markieren. Keine AI-Tags in den Sync-Rückfluss zu Floccus.

### Sync-Semantik

```text
Compat-API darf NICHT auf Crawl/AI-Ergebnis warten.
CRUD-Operationen müssen sofort konsistent sein (Bookmark/List/Tag-Kernzustand).
Archivierung, Tagging und OCR laufen weiterhin asynchron.
```

---

## 9. Extension-Tables-Strategie

### Entscheidung

```text
Option A: Nur Extension Tables – GEWÄHLT FÜR v0.1-alpha
Option B: Direkte Schema-Erweiterung – NICHT FÜR v0.1-alpha
Option C: Hybrid (bookmarks.deletedAt direkt + Extension Tables) – POST-ALPHA
```

### Option A – Minimalschema für v0.1-alpha

```text
Bestehend (unverändert):
├─ bookmarks
├─ bookmarkLinks
└─ alle anderen KaraKeep-Kerntabellen

Neu für v0.1-alpha (additiv):

linksteward_item_extensions
├─ bookmarkId      (FK → bookmarks.id, ON DELETE CASCADE)
├─ deletedAt       (nullable – Soft Delete)
├─ normalizedUrl   (nullable)
├─ canonicalUrl    (nullable)
├─ rootDomain      (nullable)
├─ urlHash         (nullable)
├─ revision        (default 0 – Sync-Versionierung)
└─ metadataJson    (nullable)

linksteward_external_mappings
├─ id
├─ provider        (floccus | linkwarden | browser_html)
├─ externalId
├─ bookmarkId      (FK, nullable)
├─ listId          (FK, nullable)
├─ userId          (FK)
└─ metadataJson    (nullable)
```

### Andockpunkte im Code

```text
packages/db/          → additive Drizzle-Tabellen + Migration
packages/api/routes/linksteward/
├─ collections.ts     → /api/v1/collections (Linkwarden-Compat)
├─ links.ts           → /api/v1/links (Linkwarden-Compat)
└─ native.ts          → /api/linksteward/v1/* (Native, Post-Alpha)
packages/trpc/routers/linksteward.ts → interne Service-Logik
packages/shared/types/linksteward.ts → LinkSteward-Typen (getrennt von KaraKeep-Typen)
```

### Warum Extension Tables für Alpha

- `bookmarks` und `bookmarkLinks` bleiben unverändert → geringes Upstream-Merge-Risiko
- KaraKeep-UI, Mobile, Extension, CLI verhalten sich unverändert
- Migrationen sind additiv und besser rückbaubar
- LinkSteward-Semantik klar von KaraKeep-Kern abgegrenzt
- Passt zu ADR-002 (Erweiterungsschicht)

### Nachteile (akzeptiert für Alpha)

- Zusätzliche Joins für Soft-Delete-Filter in Compat-API
- KaraKeep-UI zeigt gelöschte Items weiterhin an (für Alpha explizit akzeptiert)
- Mehr Adapterlogik im Compatibility Mapper

### Review-Gate nach erstem Floccus-Sync

```text
Nach erstem erfolgreichen Sync evaluieren:
├─ Sind Joins für Soft-Delete-Filter zu komplex?
├─ Werden zu viele KaraKeep-Kernqueries manuell angepasst?
├─ Gibt es Performance-Probleme durch Extension-Table-Joins?
└─ Rechtfertigt das eine direkte bookmarks.deletedAt-Spalte?
```

### Weitere Extension Tables (Post-Alpha)

```text
linksteward_sync_events          – Sync-Protokoll
linksteward_link_health_checks   – Broken-Link-Prüfergebnisse
linksteward_duplicate_groups     – Duplikat-Gruppen
linksteward_duplicate_candidates – Einzelne Kandidaten
linksteward_ai_suggestions       – AI-Vorschläge mit Accept/Reject
linksteward_archive_jobs         – Archivierungsaufträge
linksteward_archive_events       – Archivierungsereignisse
```

---

## 10. Soft-Delete-Strategie für Alpha

### Anforderung

ADR-015 fordert Soft Delete/Papierkorb. Floccus kann Löschungen auslösen. Harte Deletes würden bei Fehl-Syncs zu unwiederbringlichem Datenverlust führen.

### Alpha-Strategie

```text
Soft Delete über linksteward_item_extensions.deletedAt

Beim Löschen via Compat-API:
├─ bookmarks.id bleibt bestehen (kein KaraKeep-Delete)
├─ linksteward_item_extensions.deletedAt = jetzt
└─ Response: HTTP 204 (für Floccus)

Filterung:
├─ Linkwarden-Compat-API: WHERE deletedAt IS NULL (via JOIN)
├─ KaraKeep-UI/API: KEINE Filterung (gelöschte Items weiterhin sichtbar)
└─ Für Alpha explizit akzeptiert
```

### Nicht im Alpha-Scope

```text
Restore-Workflow
Hard Delete (Papierkorb leeren)
Soft-Delete-Filterung in KaraKeep-UI
Soft-Delete-Filterung in KaraKeep-REST-API
```

Diese werden als Issue 003 (Soft Delete Semantik) für Post-Alpha spezifiziert.

---

## 11. Risiken

### Kritisch (Scope-blockend)

**R1 – Soft Delete vor Floccus-Sync**  
Löschungen über Floccus führen ohne Soft Delete zu Datenverlust. Muss vor erstem produktivem Sync implementiert sein. Nicht auf Post-Alpha verschiebbar.

**R2 – Linkwarden-API-Semantik muss exakt getestet werden**  
Ähnliche Endpunkte bedeuten nicht kompatible Semantik. Feldnamen, Statuscodes, Pagination, Delete-Semantik, Tag-Handling und Mapping müssen gegen reales Floccus-Verhalten getestet werden. Ohne Test ist keine Kompatibilitätszusage möglich.

### Architektur (vor erster Migration)

**R3 – SQLite vs. PostgreSQL Dokumentationswiderspruch**  
Die LinkSteward-Architekturdokumentation nennt PostgreSQL, die Codebase nutzt SQLite. Unklare Architekturdokumente dirigieren Folgeentscheidungen falsch. Muss per ADR aufgelöst werden (nicht durch einen SQLite→PostgreSQL-Umbau, sondern durch Dokumentationskorrektur).

### Implementierungsrelevant

**R4 – Queue-System ist nicht Bull**  
Neue LinkSteward-Queues müssen als Plugins nach dem `queue-liteque`-Muster implementiert werden. Eine Implementierung mit Bull würde nicht in die bestehende Infrastruktur passen.

**R5 – Upstream-Merge-Konflikte**  
Kritische Dateien, die bei KaraKeep-Upstream-Updates häufig geändert werden:

```text
packages/db/schema.ts           – meistgenutzte Datei
packages/api/index.ts           – Routenregistrierung
packages/trpc/routers/_app.ts   – Sub-Router-Registrierung
packages/shared/types/*         – breit genutzt, kleine Änderungen brechen viele Clients
```

Extension Tables reduzieren das Merge-Risiko, eliminieren es aber nicht.

**R6 – Auto-Tagging destabilisiert Floccus-Sync**  
AI-Tags entstehen asynchron nach dem Crawl. Floccus sieht beim nächsten Sync neue Tags, die der Nutzer nicht gesetzt hat. Lösung: AI-Tags in Compat-API für Alpha ausblenden oder als read-only markieren.

### Mittel (kein Alpha-Blocker, aber planen)

**R7 – Package-Namespace @karakeep/* (>500 Import-Pfade)**  
Umbenennung auf `@linksteward/*` ist ein großer Churn. Für v0.1-alpha kein Blocker. Als separaten Sprint einplanen.

**R8 – AIO-Container-Skalierungsgrenze**  
Das Single-Container-Design (Web + Workers + SQLite in einem Container) vereinfacht Self-Hosting, begrenzt aber spätere Skalierung. Für v0.1-alpha kein Problem.

**R9 – Stripe/Subscriptions als Self-Hosting-Ballast**  
`subscriptions`-Tabelle und `subscriptions`-tRPC-Router sind für Self-Hosting irrelevant, müssen aber mitgepflegt werden.

**R10 – SSRF-Risiko**  
URL-Validierung via `network.ts` mit DNS-Resolver und private IP-Blocking. Für Homelab konfigurierbar (Allowlist). Bei jedem neuen URL-Input-Pfad prüfen, ob SSRF-Schutz greift.

**R11 – AGPL-3.0 Fork-Kommunikation**  
Ein öffentlicher Fork unter AGPL-3.0 braucht eine klare Compliance- und Kommunikationsstrategie. Kein technisches Risiko, aber ein Produkt-/Legal-Risiko.

---

## 12. Offene Fragen

### Vor der ersten Codeänderung zu klären

```text
F1 – SQLite vs. PostgreSQL
     ADR verfassen: SQLite für v0.1-alpha. PostgreSQL als späteres Ziel oder gestrichen.
     Architekturdokumentation korrigieren.

F2 – Soft Delete Alpha-Semantik
     Scope: Nur Compat-API filtert, KaraKeep-UI bleibt unverändert.
     Restore, Hard Delete und Konfliktfälle für Post-Alpha definieren.

F3 – Floccus Linkwarden-API-Contract
     Welche Linkwarden-API-Version implementiert Floccus?
     Exakte Feldnamen, Statuscodes, Pagination-Parameter, Delete-Semantik?
     Wie erkennt Floccus bestehende Bookmarks – via URL oder via Server-ID?
     Sind Tags im ersten Sync zwingend nötig?
     Wie verhält sich Floccus bei javascript:, data: und anderen Sonder-URLs?
```

### Vor dem ersten produktiven Release

```text
F4 – External Mapping Timing
     Reichen KaraKeep-IDs als stabile Server-IDs für Floccus,
     oder müssen externe IDs persistiert werden?
     Wann wird linksteward_external_mappings befüllt?

F5 – Verschachtelte Collections
     Wie werden bookmarkLists.parentId in Linkwarden-Responses gemappt?

F6 – Tags im ersten Sync
     Reicht Collections + Links für den ersten Sync-Beweis,
     oder braucht Floccus Tags im ersten Zyklus?

F7 – Linkwarden Delete-Semantik
     Reicht HTTP 204 für Floccus, oder gibt es ein Tombstone-/Conflict-Konzept?
```

### Strategisch (iterativ entscheidbar)

```text
F8 – Fork-Strategie
     Aktiver Merge gegen KaraKeep-Upstream vs. stabiler Fork auf fixem Commit.
     Beeinflusst Branch-Struktur und Merge-Policy.

F9 – @karakeep/* Namespace
     Wann und in welchen Schritten auf @linksteward/* umstellen?

F10 – Meilisearch Pflicht oder optional
      Alle Meilisearch-Suchpfade im Code identifizieren.
      Schlägt der App-Start ohne Meilisearch fehl?
      SQLite FTS5 als Alternative für einfaches Self-Hosting untersuchen.

F11 – Queue-Plugin-Implementierung
      Wie werden neue LinkSteward-Queues als Plugins nach queue-liteque-Muster implementiert?
      Gibt es eine minimale Beispiel-Plugin-Implementierung als Vorlage?
```

---

## 13. Konkrete nächste Issues

Priorisiert nach Abhängigkeiten:

```text
Issue 001 – ADR: SQLite vs. PostgreSQL
Ziel: SQLite für v0.1-alpha bestätigen.
      Architekturdokumentation korrigieren.
      PostgreSQL als späteres Ziel per ADR markieren oder streichen.
Abhängigkeit: Vor Issue 004. Parallel zu Issues 002, 010.

Issue 002 – Floccus Linkwarden-API-Contract verifizieren
Ziel: Floccus-Quellcode oder manueller Testlauf.
      Endpunkte, Felder, Pagination, Delete-Semantik, Server-ID-Konzept,
      Tombstone, Verhalten bei unerlaubten URLs, Tags-Anforderung.
Abhängigkeit: Blockiert Issues 005, 006, 007, 008.

Issue 003 – Soft Delete Alpha-Semantik festlegen
Ziel: Delete/Restore/Hard-Delete-Definitionen.
      Alpha-Scope: Nur Compat-API filtert, KaraKeep-UI unverändert.
      Konfliktfälle und Restore für Post-Alpha definieren.
Abhängigkeit: Blockiert Issue 004.

Issue 004 – Extension Tables Basisschema + Migration
Ziel: linksteward_item_extensions und linksteward_external_mappings
      als Drizzle-Tabellen definieren und Migration erstellen.
Abhängigkeit: Issues 001 und 003.

Issue 005 – Compatibility Mapper spezifizieren
Ziel: Mapping-Regeln:
      bookmarkLists → collections
      bookmarks (type=link) + bookmarkLinks → links
      URL-Filter-Liste (welche Schemata ausblenden)
      AI-Tag-Handling für Alpha (ausblenden vs. read-only)
Abhängigkeit: Issue 002.

Issue 006 – Linkwarden Collections API implementieren
Ziel: GET/POST/PATCH/DELETE /api/v1/collections
      Adapter auf bookmarkLists.
Abhängigkeit: Issues 004 und 005.

Issue 007 – Linkwarden Links API implementieren
Ziel: GET/POST/PATCH/DELETE /api/v1/links
      Adapter auf bookmarks/bookmarkLinks.
Abhängigkeit: Issues 004 und 005.

Issue 008 – Linkwarden Tags API prüfen
Ziel: Reicht bestehendes GET /api/v1/tags für Floccus?
      Oder braucht Floccus eigene Linkwarden-kompatible Tags-Route?
Abhängigkeit: Issue 002.

Issue 009 – Floccus E2E-Testmatrix vorbereiten und durchführen
Ziel: Firefox + Chromium, Szenarien:
      Initialer Sync, Create, Update, Move, Delete,
      Konflikt, Duplikat, unerlaubte URLs, Soft Delete.
Abhängigkeit: Issues 006 und 007.

Issue 010 – Upstream-Fork-Strategie entscheiden
Ziel: Aktiver Merge vs. stabiler Fork.
      Branch-Struktur und Merge-Policy dokumentieren.
Abhängigkeit: Keine (parallel zu allen anderen).

Issue 011 – Queue-System-Dokumentation aktualisieren
Ziel: queue-liteque/restate als tatsächliches Queue-System dokumentieren.
      Bull-Referenz aus allen Dokumenten entfernen.
      queue-liteque Plugin-Muster für neue Queues dokumentieren.
Abhängigkeit: Keine (sofort).
```

---

## 14. Was nicht ungeprüft übernommen werden darf

Aus den Analysen identifizierte Punkte, die ohne zusätzliche Verifikation **nicht** in Implementierungspläne übernommen werden dürfen:

```text
NICHT ÜBERNEHMEN ohne Verifikation:

Queue-System ist Bull-basiert
→ FALSCH. Es ist queue-liteque (SQLite-Plugin). Korrigiert.

bookmarks.deletedAt sofort direkt hinzufügen
→ Für v0.1-alpha-Scope zu früh. Erst nach Review-Gate nach erstem Sync.

Aufwandsschätzung 400-600 Zeilen TypeScript
→ Nur Hypothese, keine Planungsgrundlage.

Floccus KaraKeep-Modus ist direkt nutzbar
→ Nicht ohne manuellen Test bestätigt. Linkwarden-Modus ist der belastbarere Alpha-Pfad.

Meilisearch für v0.1-alpha optional machen
→ Alle Meilisearch-Suchpfade müssen erst identifiziert werden.
  Schlägt der App-Start ohne Meilisearch fehl? Unbekannt.

Linkwarden-API-Kompatibilität ohne Test zusagen
→ Ähnliche Endpunkte ≠ kompatible Semantik. Erst testen.

Konkrete Dateiänderungsreihenfolge mit Migration beschließen
→ Erst wenn Issues 001-005 abgeschlossen sind.

PostgreSQL-Umbau parallel zum Fork-Start
→ Würde Alpha-Scope massiv vergrößern. Nicht vor Alpha.
```

---

## 15. Entscheidung: Was wird als erstes implementiert?

### Beschlossen

```text
├─ KaraKeep als technische Basis (unveränderlich für Alpha)
├─ SQLite beibehalten
├─ @karakeep/* Namespace beibehalten
├─ Extension Tables als Erweiterungsstrategie
├─ linksteward_item_extensions (mit deletedAt für Soft Delete)
├─ linksteward_external_mappings (für Floccus-ID-Tracking)
├─ Linkwarden-Compat-API als erster Implementierungsblock
├─ Floccus Linkwarden-Modus als erstes Testszenarien
└─ queue-liteque/restate (nicht Bull) als Queue-System
```

### Vor Codeänderung noch zu dokumentieren

```text
├─ ADR: SQLite vs. PostgreSQL (Issue 001)
│  → Architekturdokumentation korrigieren
├─ Soft Delete Alpha-Semantik (Issue 003)
│  → Scope, Restore, Hard Delete, Konfliktfälle definieren
├─ Floccus Linkwarden-API-Contract (Issue 002)
│  → Manuell verifizieren: Felder, Endpunkte, Server-ID-Konzept
└─ Upstream-Fork-Strategie (Issue 010)
   → Aktiver Merge vs. stabiler Fork entscheiden
```

### Erster Code-Branch

```text
Branch: feat/linkwarden-compat-api

Enthält:
├─ packages/db/: linksteward_item_extensions + linksteward_external_mappings (Drizzle)
├─ packages/db/migrations/: neue Migration
├─ packages/api/routes/linksteward/collections.ts (neu)
├─ packages/api/routes/linksteward/links.ts (neu)
├─ packages/api/index.ts: neue Routen registrieren
└─ packages/shared/types/linksteward.ts: Linkwarden-Response-Typen (neu)
```

### Erster technischer Implementierungsschritt

```text
Schritt 1: Extension Tables definieren
──────────────────────────────────────
1. packages/db/schema.ts ergänzen:
   → linksteward_item_extensions Tabelle (mit Index auf bookmarkId)
   → linksteward_external_mappings Tabelle (mit Index auf provider + externalId)

2. Migration erstellen:
   pnpm db:generate --name add_linksteward_base_tables

3. Compatibility Mapper implementieren:
   → packages/api/routes/linksteward/mapper.ts
   → Mapping: bookmarkLists → Linkwarden Collection Response
   → Mapping: bookmarks (type=link) → Linkwarden Link Response
   → URL-Filter: unerlaubte Schemata ausblenden
   → Soft-Delete-Filter: JOIN auf linksteward_item_extensions.deletedAt IS NULL

4. Collections API implementieren:
   → packages/api/routes/linksteward/collections.ts
   → GET /api/v1/collections
   → POST /api/v1/collections
   → PATCH /api/v1/collections/:id
   → DELETE /api/v1/collections/:id (Soft Delete)

5. Links API implementieren:
   → packages/api/routes/linksteward/links.ts
   → GET /api/v1/links
   → POST /api/v1/links
   → PATCH /api/v1/links/:id
   → DELETE /api/v1/links/:id (Soft Delete)

6. Route in packages/api/index.ts registrieren

7. Floccus mit Firefox + Chromium testen:
   → Initialer Sync
   → Create, Update, Move, Delete
   → Unerlaubte URLs
   → Soft Delete verifizieren
```

---

## Anhang: Übernahme aus Primäranalysen

### Aus Codex-Primäranalyse übernommen

- Extension Tables konsequent bevorzugen
- queue-liteque/restate als korrektes Queue-System
- Linkwarden-Floccus-Sync als kleinstes technisches Alpha-Feature
- Trennung Native LinkSteward API und Compat-APIs
- packages/api, packages/trpc, packages/db als Andockpunkte
- 9 Extension Tables vollständig (inkl. linksteward_sync_events, Post-Alpha)
- Risiko: Auto-Tagging destabilisiert Floccus-Sync
- Risiko: Nicht-URL-Items müssen aktiv gefiltert werden
- packages/shared/types/* als Risiko-Änderungsbereich
- AGPL/Fork-Kommunikation als Langzeitrisiko
- Revision/Sync-Clock als fehlende Felder

### Aus Claude-Primäranalyse übernommen

- PostgreSQL vs. SQLite Dokumentationswiderspruch als explizites Architekturrisiko
- Package-Namespace @karakeep/* als Fork-Risiko (>500 Stellen)
- AIO-Container als Skalierungsgrenze
- Stack-Details: Next.js 15, Hono, tRPC, Drizzle, better-sqlite3, Meilisearch, s6-overlay
- Auth-Details: NextAuth.js, bcrypt 10 Runden, OIDC, ak1-Legacy-Format
- SSRF-Schutz via network.ts
- Crawl-Defaults und S3 Asset Storage
- OCR als konfigurierbares Feature
- FeedRefreshingWorker und BackupSchedulingWorker als Timer-Loops
- Import-Worker-Prometheus-Metriken
- Stripe/Subscriptions als Self-Hosting-Ballast
- Meilisearch-Optionalität als offene Frage
- Upstream-Fork-Strategie als Entscheidungsfrage

### Korrigiert gegenüber Claude-Primäranalyse

```text
Queue-System: NICHT Bull-basiert.
Korrekt: queue-liteque (SQLite-Plugin) + queue-restate.
```

---

## Codex Review Addendum v0.1

### Quelle

- Bestehende finale Analyse: Claude-konsolidiert
- Ergänzungen in diesem Abschnitt: Codex-Review

### Zusätzliche Codex-Erkenntnisse

- [Codex bestätigt] Die bestehende finale Analyse übernimmt die wichtigsten Codex-Punkte bereits sehr weitgehend: Extension Tables zuerst, Linkwarden-Floccus-Sync als Alpha-Slice, SQLite für Alpha, `@karakeep/*` Namespace beibehalten, keine direkte `bookmarks.deletedAt`-Spalte im ersten Slice.

- [Codex-Ergänzung] Die native LinkSteward API unter `/api/linksteward/v1/*` sollte in v0.1-alpha ausdrücklich als **Post-Alpha bzw. zweiter API-Slice** behandelt werden. Die finale Analyse nennt sie bereits als neu zu bauendes Modul, aber für den ersten Alpha-Scope sollte die Reihenfolge noch härter sein: zuerst Linkwarden-Compat, danach native LinkSteward API.

- [Codex-Ergänzung] `linksteward_sync_events` sollte in der finalen Datenmodell-Diskussion sichtbar bleiben, auch wenn es Post-Alpha ist. Für den ersten Sync reichen vermutlich `item_extensions` und `external_mappings`, aber eine spätere robuste Zwei-Wege-Synchronisation braucht ein Ereignis-/Auditmodell für Konfliktanalyse.

- [Codex-Ergänzung] `packages/shared/types/*` ist ein besonders sensibler Änderungsbereich. Die finale Analyse nennt diesen Punkt bereits in Risiken und Übernahmeempfehlung; Codex würde zusätzlich empfehlen, LinkSteward-spezifische API-Typen konsequent getrennt zu halten, damit Web, Mobile, Extension, CLI und KaraKeep-kompatible REST-Shapes nicht unbeabsichtigt brechen.

- [Codex-Ergänzung] AI-Tags sollten für v0.1-alpha nicht nur "ausblenden oder read-only" sein, sondern als konkrete Alpha-Voreinstellung eher **ausblenden**. Read-only kann später geprüft werden. Der Grund: Floccus-Sync sollte in der ersten Testphase nur Nutzer- bzw. Browser-intendierte Änderungen zurückspiegeln.

- [Codex-Ergänzung] Die Aussage "KaraKeep-UI zeigt gelöschte Items weiterhin an (für Alpha akzeptiert)" sollte als reine Alpha-Einschränkung verstanden werden, nicht als akzeptables Produktverhalten. Für einen öffentlichen MVP braucht es entweder UI-Filterung, Papierkorb-UI oder eine klare Nutzerkommunikation.

### Abweichende Codex-Einschätzungen

- [Codex-Abweichung] Die finale Analyse enthält im Abschnitt "Erster Code-Branch" und "Erster technischer Implementierungsschritt" bereits sehr konkrete Datei- und Befehlsvorschläge. Codex würde diese nicht als beschlossene Umsetzung lesen, sondern als **Implementierungsskizze nach Abschluss der Issues 001-005**. Vorher sollten keine Migrationen oder Routen angelegt werden.

- [Codex-Abweichung] Die Formulierung "Drizzle ORM unterstützt beide; der Wechsel ist später möglich" ist technisch plausibel, aber sollte nicht zu optimistisch gelesen werden. Ein späterer SQLite-zu-PostgreSQL-Wechsel ist [Nicht sicher ableitbar] aus den erlaubten Dateien als einfach ableitbar; Datenmigration, SQL-Dialektunterschiede, Indizes und Runtime-Annahmen können trotzdem erheblich sein.

- [Codex-Abweichung] `linksteward_external_mappings` wird an mehreren Stellen als "für Floccus-ID-Tracking" beschrieben. Codex stimmt der Tabelle als Vorbereitung zu, aber ob sie bereits im ersten Sync aktiv befüllt werden muss, ist [Nicht sicher ableitbar], solange der Floccus-Linkwarden-API-Contract und das Server-ID-Konzept nicht geprüft sind.

### Codex-Korrekturhinweise

- [Codex bestätigt] Queue-System: Die finale Analyse korrigiert den früheren Bull-Hinweis korrekt. Für Implementierung und Dokumentation gilt: `queue-liteque`/`queue-restate`, nicht Bull.

- [Codex bestätigt] `bookmarks.deletedAt` nicht sofort direkt einbauen. Die bestehende Entscheidung "Extension Tables zuerst, direkte Spalte nur nach Review-Gate" bleibt aus Codex-Sicht korrekt.

- [Codex-Korrekturhinweis] Der in der finalen Analyse genannte Befehl `pnpm db:generate --name add_linksteward_base_tables` sollte nicht als sofort auszuführender Schritt verstanden werden. Erst Issue 001 bis 005 klären, dann Migration erzeugen.

- [Codex-Korrekturhinweis] Die erlaubten URL-Schemata, insbesondere `javascript:`, müssen vor Implementierung gegen Floccus geprüft werden. Die finale Analyse enthält diese offene Frage bereits; Codex würde sie als Blocker für den Compatibility Mapper behandeln.

- [Codex-Korrekturhinweis] Meilisearch-Optionalität ist weiterhin [Nicht sicher ableitbar]. Die finale Analyse markiert das korrekt als zu prüfenden Punkt. Keine Docker-/Deployment-Vereinfachung daraus ableiten, bevor Suchpfade geprüft sind.

- [Codex-Korrekturhinweis] Floccus KaraKeep-Modus bleibt [Nicht sicher ableitbar] ohne manuellen Test. Die finale Analyse priorisiert richtig den Linkwarden-Modus; KaraKeep-Modus sollte nicht als Alpha-Annahme eingeplant werden.

### Auswirkungen auf die v0.1-alpha-Entscheidung

- [Codex bestätigt] Codex bestätigt die bestehende v0.1-alpha-Entscheidung vollständig:

```text
KaraKeep bleibt Basis.
SQLite bleibt für Alpha.
@karakeep/* bleibt für Alpha.
Extension Tables zuerst.
Linkwarden-Compat zuerst.
Floccus real testen.
Keine direkte Kernschema-Erweiterung vor dem ersten erfolgreichen Sync.
```

- [Codex-Ergänzung] Die einzige praktische Anpassung ist eine stärkere Scope-Grenze: Die native LinkSteward API und detaillierte Post-Alpha-Module (`sync_events`, Duplicate Worker, Link Health Worker, AI Suggestions Workflow) sollten dokumentiert bleiben, aber nicht in den ersten Alpha-Branch rutschen.

- [Codex-Ergänzung] Vor der ersten Codeänderung sollten Issue 001 bis 005 als echte Gates gelten, nicht nur als begleitende Dokumentationsaufgaben.

### Finale Codex-Empfehlung

- [Codex bestätigt] Was unverändert bleibt:
  - KaraKeep als technische Basis.
  - SQLite für v0.1-alpha.
  - `@karakeep/*` Namespace für v0.1-alpha.
  - Linkwarden-Compat + Floccus Linkwarden-Modus als erster Alpha-Slice.
  - Extension Tables zuerst.
  - Kein `bookmarks.deletedAt` im ersten Alpha-Slice.
  - Queue-System: `queue-liteque`/`queue-restate`, nicht Bull.

- [Codex-Ergänzung] Was ergänzt werden sollte:
  - Native LinkSteward API ausdrücklich als Post-Alpha/zweiter API-Slice markieren.
  - `linksteward_sync_events` als Post-Alpha-Baustein für robuste Synchronisation sichtbar halten.
  - AI-Tags für Alpha bevorzugt aus der Linkwarden-Compat-API ausblenden.
  - Konkrete Implementierungsskizzen klar als nachgelagert zu Issues 001-005 kennzeichnen.

- [Codex-Korrekturhinweis] Was vor der ersten Codeänderung geprüft werden sollte:
  - Floccus Linkwarden API Contract inklusive Server-ID-Konzept.
  - Soft-Delete-Scope: nur Compat-API oder auch KaraKeep UI/API.
  - Ob `external_mappings` im ersten Sync aktiv gebraucht wird.
  - URL-Schema-Verhalten, insbesondere `javascript:`.
  - Meilisearch-Abhängigkeit.
  - SQLite/WAL-Verhalten bei parallelen API- und Worker-Writes.
  - Queue-Plugin-Muster für spätere LinkSteward-Worker.
