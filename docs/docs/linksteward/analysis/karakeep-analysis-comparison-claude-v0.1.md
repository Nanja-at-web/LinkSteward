# KaraKeep Analysevergleich: Codex vs. Claude – v0.1

> Erstellt: 2026-05-14  
> Basis: Direkter Vergleich von `karakeep-codex_analysis-v0.1.md` und `karakeep-claude_analysis-v0.1.md`  
> Zweck: Entscheidungsvorlage für LinkSteward v0.1-alpha

---

## Ziel dieses Dokuments

Beide Analysen wurden unabhängig voneinander erstellt. Dieses Dokument:

- benennt Übereinstimmungen, auf die Verlass ist
- benennt Widersprüche, die eine explizite Entscheidung erfordern
- zeigt Blindstellen jeder Analyse auf
- destilliert belastbare Empfehlungen
- legt offene Fragen fest
- trifft eine begründete Entscheidung für LinkSteward v0.1-alpha

---

## 1. Übereinstimmungen

### KaraKeep als Basis

Beide Analysen kommen unabhängig voneinander zum gleichen Hauptergebnis:

> KaraKeep ist als Fork-Basis für LinkSteward geeignet.

Gemeinsam identifizierte Stärken:

- Monorepo ist sauber strukturiert (Turborepo + pnpm Workspaces)
- SQLite + Drizzle ORM als aktueller Datenbankzustand
- Hono REST API als dünner Adapter über tRPC Business Logic
- Bearer API Keys bereits vorhanden und für Floccus direkt nutzbar
- Scopes granular genug für Bookmarks, Lists, Tags, Users

### Kerntabellen und Datenmodell

Beide Analysen beschreiben identisch:

```text
bookmarks           – Hauptentität (type: link | text | asset)
bookmarkLinks       – URL + Crawl-Metadaten
bookmarkTexts       – Text-Bookmarks
bookmarkAssets      – Asset-Bookmarks
bookmarkTags        – Tag-Definitionen
tagsOnBookmarks     – M:N Verknüpfung (attachedBy: ai | human)
bookmarkLists       – Listen / Collections (type: manual | smart, parentId)
bookmarksInLists    – M:N Verknüpfung
assets              – Asset-Metadaten
importSessions      – Import-Status (staging → completed)
importStagingBookmarks – Staging-Einträge
ruleEngineRules     – Regelengine
ruleEngineActions   – Aktionen
rssFeedsTable       – RSS-Feeds
webhooksTable       – Webhooks
backupsTable        – Backup-Metadaten
```

Gemeinsam identifizierte Lücken:

```text
Soft Delete / deletedAt – nicht in KaraKeep-Kern vorhanden
External Mappings       – kein Tracking externer IDs (Floccus, Linkwarden)
URL-Normalisierung      – kein urlHash, normalizedUrl in Schema
Link-Health-Historie    – keine Broken-Link-Tabellen
Duplicate-Gruppen       – keine Duplikat-Modellierung
AI-Suggestion-Workflow  – kein Accept/Reject/Status
```

### API-Architektur

Beide sehen identische Schichtung:

```text
/api/trpc/*          – interne tRPC API (Web, Mobile, Extension, CLI)
/api/v1/*            – Hono REST API (OpenAPI-dokumentiert)
REST = dünner Adapter → tRPC createCaller(ctx)
```

Beide stimmen überein:

- KaraKeep-Kompatibilität (bestehende Endpunkte) ist weitgehend vorhanden
- Linkwarden-Kompatibilität fehlt vollständig und muss als Adapter gebaut werden
- Native LinkSteward API sollte unter eigenem Pfad entstehen, nicht KaraKeep-Routen überladen

### Worker-Infrastruktur

Beide erkennen denselben Worker-Satz als wiederverwendbar:

```text
crawler              – Playwright/Chromium Crawling
lowPriorityCrawler   – Crawler mit niedriger Priorität
inference            – AI-Tagging + Summarization
search               – Meilisearch-Indizierung
feed                 – RSS-Feed-Verarbeitung
assetPreprocessing   – Asset-Vorverarbeitung
webhook              – Webhook-Auslieferung
ruleEngine           – Regelauswertung
backup               – Automatische Backups
import               – Import-Session-Verarbeitung
```

Beide erkennen:

- Crawler (Playwright + Chromium + Monolith + yt-dlp) ist ein starker Wiederverwendungspunkt
- Für v0.1-alpha ist kein neuer Worker zwingend notwendig

### Import/Export

Beide stimmen überein:

- Netscape HTML Import ist bereits vorhanden und für v0.1-alpha gut nutzbar
- 11 Importformate (html, pocket, matter, omnivore, karakeep, linkwarden, tab-session-manager, mymind, readwise-reader, instapaper, onetab)
- KaraKeep-JSON-Export ist vorhanden
- Netscape HTML Export existiert, aber Ordnerhierarchie-Mapping ist ein LinkSteward-Erweiterungspunkt
- Asset-Bookmarks sind kein erster MVP-Import-Pfad

### AI/Ollama

Beide sehen:

- OpenAI-kompatibler Client und Ollama sind integriert
- AI ist deaktivierbar (kein API-Key gesetzt → kein InferenceClient)
- Auto-Tagging und Summarization können wiederverwendet werden
- AI-Suggestions mit Accept/Reject brauchen eigene Persistenz (nicht sofort KaraKeep-Tags schreiben)

### Docker-Setup

Beide sehen das AIO-Docker-Setup als direkten Wiederverwendungspunkt für v0.1-alpha:

```text
web          – KaraKeep AIO Image (Web + Workers + SQLite, Port 3000)
chrome       – Playwright-Remote-Browser (Port 9222)
meilisearch  – Volltext-Suche (Port 7700)
```

Beide erkennen: Branding (Image-Name, Env-Beispiele) muss später getrennt werden, ist aber kein v0.1-alpha-Blocker.

### v0.1-alpha Priorität

Beide priorisieren exakt denselben ersten Alpha-Slice:

```text
Linkwarden-kompatible API (collections + links + tags)
→ Floccus im Linkwarden-Modus
→ erster Browser-Bookmark-Sync in beide Richtungen
```

Beide sehen das als kleinsten, aber aussagekräftigsten Alpha-Beweis.

### Wiederverwendbare Module (beide Listen)

```text
Auth / API Keys
Bookmarks / BookmarkLinks CRUD
BookmarkLists als Collections
Tags / tagsOnBookmarks
Assets und Asset-Storage
Crawler Worker
OpenAI / Ollama Inference
Import Sessions + HTML Parser
Queue / Worker Plugins
Docker Compose / AIO Dockerfile
Meilisearch Search
REST / tRPC Infrastruktur
```

---

## 2. Widersprüche

### W1: Extension Tables vs. direktes `bookmarks.deletedAt`

Das ist der wichtigste inhaltliche Widerspruch zwischen beiden Analysen.

**Codex:**

> Extension Tables bevorzugen. Keine direkte Kernschema-Erweiterung für v0.1-alpha. Soft Delete über `linksteward_item_extensions.deletedAt` lösen.

**Claude:**

> Hybridansatz: `bookmarks.deletedAt` direkt hinzufügen (weil es fundamentales Query-Verhalten beeinflusst). Alle anderen LinkSteward-Daten in Extension Tables.

**Analyse:**

Claudes Argument ist technisch nachvollziehbar: Soft Delete beeinflusst alle Bookmark-Queries. Ohne `WHERE deletedAt IS NULL` werden gelöschte Items weiterhin in KaraKeep-UI, CLI, Extension und API angezeigt.

Codex' Gegenargument ist ebenso stichhaltig: Eine direkte Spalte in `bookmarks` berührt die meistgenutzte Tabelle, alle Upstream-Merges und alle bestehenden KaraKeep-Clients.

**Entscheidung für v0.1-alpha:**

Extension Tables zuerst (Option Codex). Begründung: Für den ersten Floccus-Alpha-Sync braucht nur die Linkwarden-Compat-API korrektes Filterverhalten. KaraKeep-UI muss gelöschte Items für Alpha nicht ausblenden. Eine direkte Spalte kann nach dem ersten Sync-Zyklus per separatem ADR nachgezogen werden.

---

### W2: Queue-System-Identifikation

**Codex:**

Identifiziert das Queue-System korrekt als Plugin-System mit:
- `packages/plugins/queue-liteque` – SQLite-basierte Queue (`DATA_DIR/queue.db`)
- `packages/plugins/queue-restate` – Restate-basierte Queue für stärkere Deployments

**Claude:**

Beschreibt das Queue-System als „vermutlich Bull-basiert" – das ist **faktisch falsch**.

**Entscheidung:**

Codex hat recht. Das Queue-System ist `queue-liteque` (SQLite-intern), kein Bull. Diese Korrektur ist wichtig für spätere Worker-Erweiterungen: LinkSteward-eigene Queues müssen als Plugins nach demselben Plugin-Muster implementiert werden.

---

### W3: SQLite vs. PostgreSQL – Wer adressiert den Widerspruch?

**Claude:**

Identifiziert explizit den Widerspruch zwischen KaraKeep-Codebase (SQLite) und LinkSteward-Architekturdokumentation (PostgreSQL als Ziel). Benennt das als kritische Entscheidung vor der ersten Migration.

**Codex:**

Beschreibt SQLite als Ist-Zustand. Erwähnt Indizes und Vacuum als SQLite-Langzeitthemen. Macht den Dokumentationswiderspruch nicht explizit.

**Analyse:**

Claude adressiert hier ein echtes Architekturproblem: Wenn LinkSteward-ADRs und Architekturdokumente PostgreSQL nennen, aber die Codebase SQLite ist, braucht das eine explizite Entscheidung und Dokumentationskorrektur – unabhängig davon, was für v0.1-alpha gewählt wird.

**Entscheidung:**

Für v0.1-alpha: SQLite beibehalten. Architekturdokument korrigieren oder als bewusst abweichenden Zielzustand markieren (ADR). PostgreSQL-Umbau ist für v0.1-alpha kein Scope.

---

### W4: Floccus KaraKeep-Modus – Direkt nutzbar?

**Claude:**

Formuliert stärker: KaraKeep-Endpunkte sind im nativen KaraKeep-Modus direkt nutzbar für Floccus.

**Codex:**

Vorsichtiger: KaraKeep-Kompatibilität ist weitgehend vorhanden, aber der größte Risikoblock bleibt Linkwarden-Kompatibilität.

**Entscheidung:**

Ohne expliziten Floccus-Test sollte die finale Dokumentation vorsichtig formulieren: KaraKeep-Endpunkte sind Kandidaten für einen nativen KaraKeep-Modus, aber für v0.1-alpha ist Linkwarden-Modus die belastbarere und besser verifikate Priorität.

---

### W5: Aufwandsschätzung

**Claude:** 400–600 Zeilen TypeScript, 1 Datenbankmigraton.

**Codex:** Keine Aufwandsschätzung.

**Entscheidung:**

Claudes Schätzung ist eine nützliche Hypothese, aber nicht belastbar genug für die Planung. In die finale Analyse höchstens als grobe Orientierung aufnehmen, nicht als Zusage.

---

## 3. Punkte nur in Codex

Diese Punkte fehlen in der Claude-Analyse vollständig oder sind deutlich schwächer ausgearbeitet:

### Plugin-System und packages/plugins/

Codex dokumentiert `packages/plugins/` explizit:

```text
queue-liteque       – SQLite-basierte Queue
queue-restate       – Restate-basierte Queue
search-meilisearch  – Meilisearch-Integration
ratelimit-memory    – Rate-Limiting (in-memory)
ratelimit-redis     – Rate-Limiting (Redis)
```

Das ist wichtig für die Frage, wie LinkSteward-eigene Queues implementiert werden sollen.

### API-Mount-Pfad

Codex nennt explizit: `apps/web/app/api/[[...route]]/route.ts` als Next.js-Catch-All-Route, die den Hono-App-Mount hostet. Das ist relevant für das Verständnis, wie neue Routen eingehängt werden.

### `apiKeys.exchange`

Codex erwähnt `apiKeys.exchange` als tRPC-Prozedur. Relevant für die Browser-Extension-Authentifizierung; für Floccus nicht direkt benötigt, aber es zeigt, dass das API-Key-System bereits erweitert wurde.

### AGPL/Fork-Kommunikation als Langzeitrisiko

Codex thematisiert explizit, dass ein öffentlicher Fork unter AGPL-3.0 eine klare Kommunikations- und Compliance-Strategie braucht. Das ist ein Produkt-/Legal-Risiko, kein rein technisches.

### Auto-Tagging darf Floccus-Sync nicht destabilisieren

Codex formuliert explizit: Tags entstehen asynchron über den Inference-Worker. Floccus könnte beim nächsten Sync-Zyklus Tags sehen, die beim letzten Sync noch nicht da waren. Das kann zu unerwarteten Tag-Zuordnungen führen.

Konsequenz: Linkwarden-Compat-API sollte für v0.1-alpha AI-generierte Tags entweder ausblenden oder als „reine Lese-Tags" nicht in den Sync-Rückfluss einbeziehen.

### Nicht-URL-Items explizit ausblenden

Codex betont stärker, dass KaraKeep Text-Bookmarks und Asset-Bookmarks enthält. Diese müssen in Kompatibilitäts-APIs aktiv herausgefiltert werden (nicht nur per Konvention, sondern per Filterregel im Compatibility Mapper).

### `packages/shared/types/*` als Risikoarea

Codex warnt, dass `packages/shared/types/*` von Web, Mobile, Extension, CLI und REST genutzt wird. Kleine Shape-Änderungen können alle Clients brechen. LinkSteward-spezifische Typen sollten daher in einer getrennten Datei leben.

### Revision/Sync-Clock als fehlende Felder

Codex nennt `revision` und Sync-Clock explizit als fehlende Felder für robuste Zwei-Wege-Synchronisation.

### Linkwarden-kompatible API als erster Slice ohne Mapping-Überladenheit

Codex formuliert die Strategie klarer: Die Linkwarden-Compat-API entsteht in `packages/api` als Adapter, ohne die KaraKeep-Routen zu modifizieren. Getrennte Route-Dateien für Compat und Native.

---

## 4. Punkte nur in Claude

Diese Punkte fehlen in der Codex-Analyse vollständig oder sind deutlich schwächer ausgearbeitet:

### SQLite vs. PostgreSQL – Dokumentationswiderspruch

Das ist Claudes wichtigster exklusiver Beitrag: Der explizite Hinweis, dass `docs/docs/linksteward/architecture/architecture-v0.1.md` PostgreSQL nennt, während die Codebase SQLite (`better-sqlite3`) nutzt. Codex behandelt SQLite als selbstverständlichen Ist-Zustand ohne diesen Widerspruch zu benennen.

### FeedRefreshingWorker und BackupSchedulingWorker als Timer-Loops

Claude identifiziert diese beiden Worker korrekt: Sie laufen nicht als Queue-Consumer, sondern als eigenständige Timer-Loops. Das ist relevant für die Frage, wie ähnliche LinkSteward-Scheduled-Jobs (z. B. Link-Health-Checks) implementiert werden sollen.

### S3-kompatible Asset-Storage

Claude dokumentiert explizit, dass KaraKeep S3-kompatible Asset-Storage via `ASSET_STORE_S3_*` Umgebungsvariablen unterstützt. Codex erwähnt nur lokale Asset-Storage.

### OCR-Feature

Claude nennt OCR als konfigurierbares Feature (`OCR_LANGS`, `OCR_CONFIDENCE_THRESHOLD`, `OCR_USE_LLM`). Codex erwähnt es nicht. Für LinkSteward ist OCR für Archivierungs-Features relevant.

### Package-Namespace `@karakeep/*` als Fork-Risiko (Quantifiziert)

Claude quantifiziert das Risiko: über 500 Import-Pfade im gesamten Repo. Das macht die Empfehlung, den Namespace vorerst beizubehalten, konkreter begründbar.

### AIO-Container-Architektur als Skalierungsgrenze

Claude benennt explizit, dass das AIO-Single-Container-Design (Web + Workers + SQLite in einem Container) Skalierung schwierig macht und eine spätere Service-Separation aufwändig wäre. Für v0.1-alpha kein Problem, aber eine architekturelle Schuld.

### Stripe/Subscriptions als Self-Hosting-Ballast

Claude nennt die `subscriptions`-Tabelle mit Stripe-Feldern als für Self-Hosting irrelevant. Der tRPC-Router `subscriptions` und die Migrationen müssen mitgepflegt werden, auch wenn das Feature nie genutzt wird.

### Meilisearch optional für v0.1-alpha?

Claude stellt explizit die Frage, ob Meilisearch für v0.1-alpha eine Pflichtkomponente ist oder ob SQLite FTS5 als MVP-Alternative ausreichen würde. Codex behandelt Meilisearch als gegeben.

### NextAuth.js Details und Legacy-Schlüsselformat

Claude dokumentiert NextAuth.js-Architektur (bcrypt 10 Runden + eigener Salt, OIDC-kompatibel), OAuth-Accounts-Tabelle und das Legacy-Format `ak1_*` (wird noch unterstützt neben `ak2_*`). Für Floccus nicht relevant, aber für Security-Analyse der Auth-Architektur wichtig.

### Upstream-Strategie als offene Frage

Claude formuliert explizit die Entscheidung zwischen aktivem Merge-Follow und stabilem Fork als architekturische Frage, die den Dateiaufbau beeinflusst. Codex adressiert das nur in einem Risiko-Hinweis.

### Concrete Floccus Protocol Question

Claude stellt explizit die Frage: Wie erkennt Floccus beim nächsten Sync bereits existierende Einträge? Via URL oder via Server-ID? Das ist ein wichtiges Protokoll-Detail für die Implementierung von `linksteward_external_mappings`.

### Ergänzende Schema-Details

Claude dokumentiert zusätzlich:
- `bookmarkTags.normalizedName` als SQLite `GENERATED ALWAYS AS` Column
- Composite Indexes für Pagination-Queries `(userId, createdAt, id)`
- WAL-Modus aktiviert in SQLite
- `listCollaborators` und `listInvitations` Tabellen (geteilte Listen-Feature)
- `highlights` und `userReadingProgress` Tabellen
- 7 Tag-Stile (`lowercase-hyphens`, `titlecase-spaces`, `camelCase` etc.)
- Stripe-Felder in `subscriptions`

---

## 5. Besonders wichtige Risiken

Priorisiert nach Auswirkung auf v0.1-alpha:

### Risiko 1: Soft Delete muss vor produktivem Floccus-Sync geklärt sein (KRITISCH)

Floccus kann Löschungen auslösen. Harte KaraKeep-Deletes würden ADR-015 (Soft Delete/Papierkorb) verletzen und könnten bei Fehl-Syncs zu unwiederbringlichem Datenverlust führen.

Entscheidung kann nicht auf Post-Alpha verschoben werden.

### Risiko 2: Linkwarden-API-Kompatibilität muss exakt getestet werden (KRITISCH)

Ähnliche Endpunkte bedeuten nicht identische Semantik. Feldnamen, Statuscodes, Pagination-Parameter, Ordner/Link-Mapping, Delete-Semantik und Tag-Handling müssen gegen reales Floccus-Verhalten getestet werden.

Früher Test mit Firefox + Chromium + Floccus ist kein Nice-to-have, sondern technische Voraussetzung.

### Risiko 3: Queue-System ist kein Bull (WICHTIG FÜR IMPLEMENTIERUNG)

Die Claude-Analyse nennt das Queue-System „vermutlich Bull-basiert" – das ist falsch. Es ist `queue-liteque` (SQLite-intern) plus `queue-restate` als Alternative. Neue LinkSteward-Queues müssen als Plugins nach demselben Muster implementiert werden, nicht als Bull-Jobs.

### Risiko 4: SQLite vs. PostgreSQL – Dokumentation muss korrigiert werden (ARCHITEKTUR)

Der Widerspruch zwischen LinkSteward-Architekturdokumentation (PostgreSQL) und Codebase (SQLite) muss aufgelöst werden. Nicht weil ein sofortiger Umbau nötig ist, sondern weil unklare Architektur-Dokumente Folgeentscheidungen falsch dirigieren.

### Risiko 5: Upstream-Merge-Konflikte in kritischen Dateien (MITTEL)

```text
packages/db/schema.ts           – meistgenutzte Datei, jede KaraKeep-Änderung kollidiert
packages/api/index.ts           – Routenregistrierung, bei neuen Features geändert
packages/trpc/routers/_app.ts   – Sub-Router-Registrierung
packages/shared/types/*         – breit genutzt, kleine Änderungen brechen viele Clients
```

Additive Extension Tables reduzieren das Merge-Risiko, eliminieren es aber nicht.

### Risiko 6: Auto-Tagging darf Floccus-Sync nicht destabilisieren (MITTEL)

AI-Tags entstehen asynchron nach dem Crawl. Wenn Floccus beim nächsten Sync neue Tags sieht, die der Nutzer nicht gesetzt hat, kann das zu unerwünschten Browser-Bookmark-Änderungen führen. Für v0.1-alpha: AI-Tags in der Linkwarden-Compat-API entweder ausblenden oder als unveränderlich markieren.

### Risiko 7: Package-Namespace `@karakeep/*` (NIEDRIG FÜR ALPHA)

Über 500 Import-Pfade verwenden `@karakeep/` als Namespace. Eine Umbenennung auf `@linksteward/` ist ein großer Churn, aber für v0.1-alpha kein Blocker. Entscheidung: Namespace beibehalten, Umbenennung als separater Sprint einplanen.

---

## 6. Belastbare Empfehlungen

Empfehlungen, die aus beiden Analysen sicher ableitbar sind:

```text
Belastbar (beide Analysen stimmen zu):
────────────────────────────────────────
KaraKeep als technische Fork-Basis verwenden
Auth / API Keys wiederverwenden
Bookmarks/Links als Kernentitäten wiederverwenden
bookmarkLists als Collections wiederverwenden
Tags/tagsOnBookmarks wiederverwenden
Crawler/Archivierung wiederverwenden
Import-Sessions + HTML Parser wiederverwenden
Ollama/OpenAI-Inferenz wiederverwenden
Docker Compose / AIO für v0.1-alpha wiederverwenden
Linkwarden-kompatible API als v0.1-alpha-Priorität bauen
Nicht-URL-Items aus Kompatibilitäts-APIs ausblenden
Floccus früh mit echten Clients testen (Firefox + Chromium)
Extension Tables als erste Erweiterungsstrategie
```

Belastbar mit Vorbehalt:

```text
Vorbehalt (Verifikation nötig):
────────────────────────────────
Extension Tables für Soft Delete (für Alpha klar, Post-Alpha offen)
Meilisearch im Docker Compose beibehalten (Alternativen nicht untersucht)
SQLite für v0.1-alpha beibehalten (PostgreSQL-Frage offen lassen)
```

Nicht belastbar ohne zusätzliche Verifikation:

```text
Nicht belastbar:
────────────────
bookmarks.deletedAt sofort direkt hinzufügen
400-600 Zeilen Aufwand
Floccus KaraKeep-Modus direkt nutzbar ohne Test
Queue-System ist Bull-basiert (faktisch falsch)
Meilisearch für v0.1-alpha optional (Suchpfade ungeprüft)
```

---

## 7. Offene Fragen

### Datenbank

- Bleibt LinkSteward v0.1-alpha bewusst bei SQLite?
- Wird PostgreSQL als späteres Ziel gestrichen, verschoben oder per ADR als bewusste Abweichung dokumentiert?
- Welche Indizes brauchen Extension Tables für Sync, Soft Delete und URL-Normalisierung?
- WAL-Modus ist aktiviert – reicht das für parallele Linkwarden-Compat-API + Worker-Writes?

### Soft Delete

- Reicht `linksteward_item_extensions.deletedAt` für v0.1-alpha-Filterung in der Compat-API?
- Muss KaraKeep-UI gelöschte Items ausblenden, oder nur die Compat-API?
- Wie werden Restore und endgültiges Löschen (Papierkorb leeren) modelliert?

### Floccus/Linkwarden

- Welche Linkwarden-API-Version und welche Felder erwartet die aktuelle Floccus-Version?
- Wie erkennt Floccus beim nächsten Sync bereits existierende Bookmarks – via URL-Matching oder via Server-ID?
- Welche Delete-Semantik erwartet Floccus: HTTP 204 reicht? Oder gibt es ein Tombstone-Konzept?
- Sind Tags im ersten Sync nötig, oder reicht Collections + Links für einen ersten Sync-Beweis?
- Wie verhält sich Floccus bei `javascript:` und `data:` URLs konkret?

### Mapping

- Reichen KaraKeep-IDs als stabile Server-IDs für Floccus, oder müssen externe IDs getrackt werden?
- Soll `linksteward_external_mappings` bereits für v0.1-alpha befüllt werden, oder erst nach dem ersten Protokoll-Test?
- Wie werden verschachtelte Collections (KaraKeep `bookmarkLists.parentId`) in Linkwarden-Responses gemappt?

### Queue-System

- Wie werden neue LinkSteward-Queues als Plugins implementiert (nach `queue-liteque`-Muster)?
- Gibt es eine minimale Beispiel-Plugin-Implementierung, die als Vorlage dienen kann?

### Fork-Strategie

- Wird aktiv gegen KaraKeep-Upstream gemerged, oder auf einem Commit eingefroren?
- Wann wird der `@karakeep/*`-Namespace auf `@linksteward/*` umgestellt?
- Wie bleiben LinkSteward-spezifische API-Typen von KaraKeep-Typen getrennt?

### Meilisearch

- Ist Meilisearch für v0.1-alpha eine harte Abhängigkeit, oder kann SQLite FTS5 als Fallback dienen?
- Wo sind alle Codepfade, die direkt auf Meilisearch zeigen?

---

## 8. Entscheidung für LinkSteward v0.1-alpha

Basierend auf beiden Analysen und der Auflösung der Widersprüche:

```text
Für LinkSteward v0.1-alpha:
├─ SQLite beibehalten (kein PostgreSQL-Umbau)
├─ @karakeep/* Namespace beibehalten (kein Umbenennung-Churn)
├─ KaraKeep Auth / API Keys wiederverwenden
├─ KaraKeep Bookmarks / Lists / Tags wiederverwenden
├─ Linkwarden-kompatible API minimal implementieren
│  ├─ GET/POST/PATCH/DELETE /api/v1/collections
│  ├─ GET/POST/PATCH/DELETE /api/v1/links
│  └─ GET/POST /api/v1/tags (minimal)
├─ Floccus Linkwarden-Modus als primären Alpha-Test nutzen
├─ Soft Delete additiv über Extension Table modellieren
│  └─ linksteward_item_extensions.deletedAt
├─ External Mappings additiv tabellieren
│  └─ linksteward_external_mappings
├─ Nicht-URL-Items in Compat-API aktiv filtern
├─ AI-Tags in Compat-API für Alpha ausblenden oder als read-only
├─ Queue-System: queue-liteque verwenden (kein Bull)
└─ kein direktes bookmarks.deletedAt für ersten Alpha-Slice
```

Alpha gilt als erfolgreich, wenn:

```text
1. Floccus verbindet sich per Bearer-API-Key ohne Fehler
2. Browser-Ordner erscheinen als LinkSteward Collections
3. Browser-Bookmarks erscheinen als LinkSteward Links
4. Änderungen (Titel, URL, Collection) synchronisieren in beide Richtungen
5. Unerlaubte URL-Schemata und Nicht-URL-Items erscheinen nicht in Floccus
6. Löschungen erzeugen keinen unwiederbringlichen Datenverlust
```

---

## Priorisierte Empfehlung

Priorisiert nach Abhängigkeit und Risiko:

**Priorität 1 – Vor jeder Implementierung:**
- ADR: SQLite vs. PostgreSQL für v0.1-alpha entscheiden und Architekturdokumentation korrigieren
- Floccus Linkwarden-Protokoll verifizieren (API-Felder, Endpunkte, Delete-Semantik)
- Soft Delete Strategie für v0.1-alpha festlegen (Extension Table, nicht direkte Spalte)

**Priorität 2 – Erster Implementierungsblock:**
- `linksteward_item_extensions` und `linksteward_external_mappings` als additive Drizzle-Tabellen definieren
- Linkwarden-Compat-Routen in `packages/api/routes/linksteward/` anlegen
- Compatibility Mapper: `bookmarkLists` → collections, `bookmarks (type=link)` → links
- URL-Filter für unerlaubte Schemata zentral implementieren

**Priorität 3 – Erster Sync-Test:**
- Docker Compose Dev-Setup starten
- Floccus mit Firefox + Chromium im Linkwarden-Modus verbinden
- Initialer Sync testen: Create, Update, Move, Delete

**Priorität 4 – Post-Alpha:**
- Floccus KaraKeep-Modus untersuchen
- Soft Delete Strategie nach Query-/Performance-Review überprüfen (ggf. direkte Spalte)
- Meilisearch Optionalität prüfen
- Package-Namespace-Umbenennung planen
- Native LinkSteward API unter `/api/linksteward/v1/*` aufbauen

---

## Konkrete nächste Issues

```text
Issue 001 – ADR: SQLite vs. PostgreSQL für v0.1-alpha
Ziel: Entscheidung festhalten; Architekturdokumentation korrigieren oder als
      bewusste Abweichung markieren.
Abhängigkeit: Muss vor Issue 004 (Migration) abgeschlossen sein.

Issue 002 – Floccus Linkwarden-API-Contract verifizieren
Ziel: Floccus-Quellcode oder Testlauf prüfen: welche Endpunkte, Felder,
      Pagination, Delete-Semantik und Server-ID-Konzept erwartet Floccus?
Abhängigkeit: Blockiert Issues 006 und 007.

Issue 003 – Soft Delete Semantik für Sync festlegen
Ziel: Definition von: Soft Delete, Restore, Hard Delete, Filterung in
      Compat-API, Filterung in KaraKeep-Kernqueries (Alpha-Scope), Konfliktfälle.
Abhängigkeit: Blockiert Issue 004.

Issue 004 – Extension Tables Basisschema erstellen
Ziel: linksteward_item_extensions (bookmarkId, deletedAt, normalizedUrl,
      urlHash, revision) und linksteward_external_mappings (provider, externalId,
      bookmarkId, listId, userId) als Drizzle-Tabellen + Migration.
Abhängigkeit: Issues 001, 003.

Issue 005 – Compatibility Mapper spezifizieren
Ziel: Mapping-Regeln für bookmarkLists → collections, bookmarks → links,
      tags, URL-Filter-Liste (welche Schemata ausblenden), AI-Tag-Handling
      für Alpha definieren.
Abhängigkeit: Issue 002.

Issue 006 – Linkwarden Collections API implementieren
Ziel: GET/POST/PATCH/DELETE /api/v1/collections als Adapter auf bookmarkLists.
Abhängigkeit: Issues 004, 005.

Issue 007 – Linkwarden Links API implementieren
Ziel: GET/POST/PATCH/DELETE /api/v1/links als Adapter auf bookmarks/bookmarkLinks.
Abhängigkeit: Issues 004, 005.

Issue 008 – Linkwarden Tags API für Floccus prüfen
Ziel: Nur die für Floccus nötigen Tag-Operationen; prüfen ob bestehende
      GET /api/v1/tags ausreicht oder Linkwarden-kompatible Tags-Route nötig.
Abhängigkeit: Issue 002.

Issue 009 – Floccus E2E-Testmatrix vorbereiten
Ziel: Testmatrix für Firefox + Chromium, Szenarien: initialer Sync, Create,
      Update, Move, Delete, Konflikt, Duplikat, unerlaubte URLs.
Abhängigkeit: Issues 006, 007.

Issue 010 – Upstream-Strategie entscheiden und dokumentieren
Ziel: Aktiver Merge vs. stabiler Fork. Konsequenzen für Branch-Struktur
      und kritische Dateien (schema.ts, _app.ts) festhalten.
Abhängigkeit: Keine (kann parallel).

Issue 011 – Finale KaraKeep-Analyse konsolidieren
Ziel: Erkenntnisse aus Codex- und Claude-Analyse in karakeep-analysis-v0.1.md
      zusammenführen. Widersprüche auflösen (Queue-System, Soft Delete, PostgreSQL).
Abhängigkeit: Alle Issues bis 010.
```

---

## Entscheidungsvorlage: Extension Tables vs. direkte Schema-Erweiterung

### Option A: Nur Extension Tables (empfohlen für v0.1-alpha)

```text
bookmarks        – unverändert
bookmarkLinks    – unverändert

linksteward_item_extensions
├─ bookmarkId (FK)
├─ deletedAt
├─ normalizedUrl
├─ canonicalUrl
├─ rootDomain
├─ urlHash
├─ revision
└─ metadataJson

linksteward_external_mappings
├─ provider (floccus | linkwarden | browser_html)
├─ externalId
├─ bookmarkId (FK, nullable)
├─ listId (FK, nullable)
├─ userId (FK)
└─ metadataJson
```

**Vorteile:**
- Geringes Upstream-Merge-Risiko (bookmarks und bookmarkLinks bleiben unberührt)
- KaraKeep-Kern (UI, Mobile, Extension, CLI) verhält sich unverändert
- LinkSteward-Semantik klar separiert
- Migrationen additiv und besser rückbaubar
- Passt zu ADR-002 (Erweiterungsschicht)

**Nachteile:**
- Zusätzliche Joins für Soft-Delete-Filter in Compat-API
- KaraKeep-UI zeigt gelöschte Items weiterhin an (für Alpha akzeptabel)
- Mehr Adapterlogik nötig

**Empfehlung: Für v0.1-alpha wählen.**

---

### Option B: Direkte Schema-Erweiterung (nicht für v0.1-alpha)

```text
bookmarks.deletedAt     – Soft Delete
bookmarkLinks.normalizedUrl
bookmarkLinks.urlHash
```

**Vorteile:**
- Einfachere Filter in KaraKeep-Kernqueries
- Soft Delete wird zentraler Bestandteil des Datenmodells
- Weniger Join-Aufwand

**Nachteile:**
- Mehr Merge-Konflikte mit Upstream
- Alle bestehenden KaraKeep-Queries müssen um `WHERE deletedAt IS NULL` erweitert werden
- KaraKeep-UI, Mobile, Extension und CLI zeigen ohne Anpassung trotzdem gelöschte Items
- Höheres Risiko für Upstream-Kompatibilität
- Schwerer rückbaubar

**Empfehlung: Nicht für v0.1-alpha. Als Post-Alpha-Review-Gate offenhalten.**

---

### Option C: Hybrid (als zukünftige Option)

```text
bookmarks.deletedAt     – direkt (nach Query-Review)
alle anderen Felder     – Extension Tables
```

**Vorteil:** Soft Delete zentral.

**Nachteil:** Berührt trotzdem die meistgenutzte Kerntabelle; für Alpha zu breiter Scope.

**Empfehlung: Erst nach erstem Floccus-Sync-Zyklus evaluieren.**

---

### Review-Gate nach erstem Sync-Zyklus

```text
Nach erstem erfolgreichen Floccus-Sync prüfen:
├─ Sind Joins für Soft-Delete-Filter in Compat-API zu komplex?
├─ Werden zu viele KaraKeep-Kernqueries manuell angepasst?
├─ Gibt es Performance-Probleme durch Extension-Table-Joins?
├─ Ist Upstream-Merge-Risiko durch direkte Spalte vertretbar?
└─ Rechtfertigt das eine direkte bookmarks.deletedAt-Spalte?
```

---

## Übernahmeempfehlung für finale `karakeep-analysis-v0.1.md`

### Aus Codex übernehmen

```text
Extension Tables konsequent bevorzugen (mit Begründung)
Linkwarden-Floccus-Sync als kleinstes technisches v0.1-alpha Feature
Trennung Native LinkSteward API (/api/linksteward/v1/*) und Compat-APIs
packages/api als Andockpunkt für Compat-APIs
packages/trpc als Andockpunkt für interne Services
packages/db als additiver Erweiterungspunkt
Liste der Extension Tables (item_extensions, external_mappings, sync_events, ...)
Risiko: Auto-Tagging darf Floccus-Sync nicht destabilisieren
Risiko: Nicht-URL-Items müssen aktiv gefiltert werden
packages/shared/types/* als Risiko-Änderungsbereich
packages/plugins/ Struktur (queue-liteque, queue-restate als korrekte Identifikation)
AGPL/Fork-Kommunikation als Langzeitrisiko
Revision/Sync-Clock als fehlende Felder für robuste Synchronisation
```

### Aus Claude übernehmen

```text
PostgreSQL vs. SQLite Dokumentationswiderspruch als explizites Architekturrisiko
Package-Namespace @karakeep/* als Fork-Risiko (>500 Stellen)
AIO-Container als Skalierungsgrenze
Stack-Details: Next.js 15, Hono, tRPC, Drizzle, better-sqlite3, Meilisearch, s6-overlay
Auth-Details: NextAuth.js, bcrypt, OIDC, ak1-Legacy-Format
SSRF-Schutz via network.ts (DNS-Resolver, private IP-Blocking, Allowlist)
Crawl-Defaults (Screenshot=true, Banner=true, PDF=false, FullPageArchive=false)
S3-kompatible Asset-Storage als vorhandene Option
OCR als konfigurierbares Feature
FeedRefreshingWorker und BackupSchedulingWorker als Timer-Loops (nicht Queue-Consumer)
Import-Worker-Metriken (Prometheus)
Stripe/Subscriptions als Self-Hosting-Ballast ohne MVP-Blocker
Meilisearch-Optionalität als offene Frage
Upstream-Merge-Strategie (aktiv vs. stabiler Fork) als Entscheidungsfrage
```

### Nicht ungeprüft übernehmen

```text
Queue-System ist Bull-basiert → faktisch falsch, korrigieren (es ist queue-liteque)
bookmarks.deletedAt sofort direkt hinzufügen → für Alpha-Scope zu früh
Aufwandsschätzung 400-600 Zeilen → nur als grobe Hypothese
Floccus KaraKeep-Modus direkt bestätigt → erst nach Test
Meilisearch optional machen → erst nach Prüfung aller Suchpfade
```

### Empfohlene Struktur der finalen `karakeep-analysis-v0.1.md`

```text
1. Kurzfazit
2. Repository-Struktur und Stack
3. Datenbankmodell (Ist-Zustand KaraKeep)
4. Abgleich mit LinkSteward-Zieldatenmodell
5. API-Architektur und Auth
6. Worker-System und Queues (inkl. korrekte Queue-Plugin-Identifikation)
7. Archivierung und Crawling
8. Import/Export
9. AI/Ollama/OCR
10. Docker/Deployment
11. Floccus/Linkwarden-Kompatibilität
12. Erweiterungsstrategie (Extension Tables – begründet)
13. Risiken (priorisiert)
14. Offene Entscheidungen für v0.1-alpha
15. Konkrete nächste Issues
```

---

## Schlussentscheidung

Für LinkSteward v0.1-alpha gilt:

```text
KaraKeep bleibt technische Basis.
SQLite bleibt für Alpha bestehen; Architekturdokumentation wird korrigiert.
Queue-System ist queue-liteque (SQLite-Plugin), nicht Bull.
Extension Tables sind die erste Erweiterungsstrategie.
Linkwarden-kompatible API + Floccus erster Sync ist der erste Alpha-Slice.
Soft Delete wird für Alpha additiv in Extension Table modelliert.
Nach erstem Sync-Zyklus wird Soft Delete Strategie erneut bewertet.
```

Der Alpha-Scope bleibt dadurch klein genug, testet aber genau den kritischsten Punkt:
**echte Browser-Bookmark-Synchronisation über Floccus im Linkwarden-Modus.**
