# KaraKeep Analysevergleich Codex vs Claude v0.1

## Ziel

Diese Datei vergleicht:

- `docs/docs/linksteward/analysis/karakeep-codex_analysis-v0.1.md`
- `docs/docs/linksteward/analysis/karakeep-claude_analysis-v0.1.md`

Ziel ist eine belastbare Entscheidungsvorlage für LinkSteward v0.1-alpha, insbesondere für:

- Floccus-/Linkwarden-Kompatibilität
- Extension Tables vs direkte Schema-Erweiterung
- Wiederverwendung von KaraKeep-Modulen
- Risiken eines langfristigen Forks
- Inhalte für eine finale `karakeep-analysis-v0.1.md`

## Kurzfazit

Codex und Claude kommen im Kern zum gleichen Ergebnis: KaraKeep ist eine geeignete technische Basis für LinkSteward. Beide sehen starke Wiederverwendungspunkte in Auth/API Keys, Bookmarks, Listen, Tags, Crawler/Archivierung, Import/Export, Worker-Infrastruktur, Docker und Ollama/OpenAI.

Der zentrale Unterschied liegt in der Datenmodell-Strategie:

- Codex empfiehlt für v0.1-alpha konsequent Extension Tables.
- Claude empfiehlt einen Hybridansatz: Extension Tables plus direkte Spalte `bookmarks.deletedAt`.

Für LinkSteward v0.1-alpha ist die robustere Entscheidung: Extension Tables zuerst. Eine direkte `bookmarks.deletedAt`-Spalte sollte erst nach einem konkreten Query-/Performance-Review entschieden werden, weil sie alle bestehenden KaraKeep-Queries und Upstream-Merges berührt.

## 1. Übereinstimmungen

### KaraKeep als Basis

Beide Analysen stimmen überein:

- KaraKeep ist als Fork-Basis geeignet.
- Das Monorepo ist sauber genug strukturiert, um LinkSteward additiv zu erweitern.
- Der bestehende technische Kern ist deutlich weiter als ein MVP-Start bei null.

Gemeinsam genannte Hauptmodule:

```text
apps/web
apps/workers
apps/browser-extension
apps/mobile
apps/cli
apps/mcp
packages/api
packages/trpc
packages/db
packages/shared
packages/shared-server
packages/open-api
packages/plugins
```

### Datenbankmodell

Beide beschreiben das gleiche Grundmodell:

```text
user / account / session / apiKey
bookmarks
bookmarkLinks
bookmarkTexts
bookmarkAssets
bookmarkTags
tagsOnBookmarks
bookmarkLists
bookmarksInLists
assets
highlights
rssFeeds
webhooks
backups
importSessions
importStagingBookmarks
ruleEngineRules
ruleEngineActions
```

Beide sehen:

- SQLite + Drizzle als Ist-Zustand.
- `bookmarks` als zentrale Item-Basis.
- `bookmarkLinks` als URL-/Crawl-Metadaten-Basis.
- `bookmarkLists` als Mapping-Kandidat für LinkSteward Collections.
- `bookmarkTags`/`tagsOnBookmarks` als ausreichend für v0.1-alpha.
- fehlendes Soft Delete als wichtige Lücke.

### API und Auth

Beide Analysen stimmen überein:

- KaraKeep hat Hono REST API plus tRPC Business Logic.
- Die REST API ist weitgehend ein dünner Adapter auf tRPC.
- Bearer API Keys sind vorhanden und für Floccus nutzbar.
- Scopes existieren bereits granular genug für Bookmarks, Lists, Tags und Users.

Gemeinsam relevante APIs:

```text
GET/POST/PATCH/DELETE /api/v1/bookmarks
GET/POST/PATCH/DELETE /api/v1/lists
GET/POST/PATCH/DELETE /api/v1/tags
GET /api/v1/users/me
```

### Worker, Crawling und Archivierung

Beide erkennen den Crawler als großen Wiederverwendungspunkt:

- Playwright/Chromium
- browserless Fallback
- Screenshot
- PDF optional
- Full Page Archive via Monolith
- HTML Content inline oder als Asset
- Video via yt-dlp optional
- Proxy/Cookie/Adblocker-Konfiguration
- SSRF-/IP-Validierung als wichtiger Sicherheitsbereich

Beide sehen auch die Worker-Infrastruktur als wiederverwendbar:

```text
crawler
lowPriorityCrawler
inference
search
feed
assetPreprocessing
webhook
ruleEngine
backup
import
```

### Import/Export

Beide stimmen überein:

- Browser HTML Import ist bereits gut vorbereitet.
- Import-Sessions und Import-Staging sind vorhanden.
- KaraKeep-JSON Export existiert.
- Netscape HTML Export ist vorhanden, aber für LinkSteward wahrscheinlich um Ordnerhierarchie zu erweitern.
- Asset-Bookmarks sind im Import nicht der erste MVP-Pfad.

### AI/Ollama

Beide sehen:

- OpenAI-kompatible API und Ollama sind bereits integriert.
- AI ist optional/deaktivierbar.
- Auto-Tagging und Summaries können wiederverwendet werden.
- LinkSteward-spezifische AI-Suggestions sollten separat modelliert werden, wenn Accept/Reject/History wichtig wird.

### v0.1-alpha Schwerpunkt

Beide priorisieren denselben kritischen MVP-Pfad:

```text
Linkwarden-kompatible API
→ Floccus im Linkwarden-Modus
→ erster Browser-Bookmark-Sync
```

Das passt zur vorhandenen LinkSteward-Roadmap.

## 2. Widersprüche

### Extension Tables vs Hybrid mit `bookmarks.deletedAt`

Der wichtigste Widerspruch:

```text
Codex:
Extension Tables bevorzugen. Keine direkte Kernschema-Erweiterung für v0.1-alpha.

Claude:
Hybridansatz. `bookmarks.deletedAt` direkt hinzufügen, alle anderen Zusatzdaten in Extension Tables.
```

Bewertung:

- Claude hat recht, dass Soft Delete ein zentrales Query-Verhalten betrifft.
- Codex hat recht, dass eine direkte Spalte in `bookmarks` alle bestehenden Queries, Tests und Upstream-Merges berührt.
- Für v0.1-alpha ist die vorsichtigere Entscheidung: Soft Delete zunächst in `linksteward_item_extensions.deletedAt` abbilden und Kompatibilitäts-APIs konsequent darüber filtern.
- Eine direkte Spalte kann später nachgezogen werden, wenn sich der Join als zu teuer oder zu fehleranfällig erweist.

### SQLite vs PostgreSQL

Claude nennt den Widerspruch explizit:

- LinkSteward-Architekturdokument nennt PostgreSQL.
- KaraKeep nutzt SQLite via `better-sqlite3`.

Codex erwähnt SQLite als Ist-Zustand und Langzeithistorien als Index-/Vacuum-Thema, macht daraus aber keine v0.1-alpha Blocker-Entscheidung.

Bewertung:

- Claude benennt hier ein echtes Architekturthema.
- Für v0.1-alpha sollte trotzdem SQLite beibehalten werden, weil ein früher PostgreSQL-Umbau den Fork-Start massiv vergrößert.
- Die finale Analyse sollte den Dokumentationswiderspruch klar markieren und als ADR/Issue auslagern.

### Direkt nutzbarer KaraKeep-Floccus-Modus

Claude formuliert stärker, Floccus könne KaraKeep im nativen KaraKeep-Modus ansprechen und nennt vorhandene KaraKeep-Endpunkte als direkt nutzbar.

Codex ist vorsichtiger:

- KaraKeep-Kompatibilität ist weitgehend vorhanden.
- Floccus-relevante Endpunkte existieren.
- Der größte MVP-Risikoblock bleibt Linkwarden-Kompatibilität.

Bewertung:

- Ohne konkrete Floccus-Verifikation sollte die finale Datei vorsichtig formulieren: KaraKeep-Endpunkte sind Kandidaten für einen KaraKeep-Modus, aber Linkwarden-Modus bleibt v0.1-alpha-Priorität.

### Konkreter Implementierungsumfang

Claude schätzt:

```text
400-600 Zeilen TypeScript
1 Datenbankmigration
```

Codex gibt keine Aufwandsschätzung.

Bewertung:

- Die Schätzung ist nützlich, aber nicht belastbar genug für finale Planung.
- In die finale Analyse sollte sie höchstens als grobe Hypothese, nicht als Zusage.

## 3. Punkte nur in Codex

Codex betont stärker:

- Native LinkSteward API unter `/api/linksteward/v1/*`, ohne KaraKeep-Routen zu überladen.
- `packages/api` als Hauptort für Kompatibilitäts-APIs.
- `packages/trpc` als Hauptort für interne LinkSteward-Services.
- `packages/shared/types/*` als riskanter Änderungsbereich wegen vieler Clients.
- LinkSteward-spezifische Tabellen wie:

```text
linksteward_item_extensions
linksteward_external_mappings
linksteward_sync_events
linksteward_link_health_checks
linksteward_duplicate_groups
linksteward_duplicate_candidates
linksteward_ai_suggestions
linksteward_archive_jobs
linksteward_archive_events
```

- Sync darf nicht auf Crawling/Archivierung warten.
- Auto-Tagging darf Floccus-Sync nicht destabilisieren.
- Nicht-URL-Items müssen in Kompatibilitäts-APIs ausgeblendet werden.
- AGPL/Fork-Kommunikation als Langzeitrisiko.
- Finale Priorität: Floccus erster Sync im Linkwarden-Modus als kleinster aussagekräftiger Alpha-Beweis.

## 4. Punkte nur in Claude

Claude liefert zusätzliche Details:

- Landing App, SDK, shared-react und tooling werden in der Struktur erwähnt.
- Konkreter Stack: Next.js 15, React, Tailwind, shadcn/ui, better-sqlite3, s6-overlay.
- PostgreSQL-vs-SQLite-Widerspruch zur LinkSteward-Architektur.
- Details zu NextAuth, OAuth, Passwort-Hashing, `ak1` Legacy API Keys.
- SSRF-Schutz über `network.ts` mit DNS-Resolver und Allowlist-Hinweis.
- Composite Indexes und Generated Columns im Schema.
- Liste der Crawl-Produkte inklusive Defaults:

```text
CRAWLER_STORE_SCREENSHOT=true
CRAWLER_DOWNLOAD_BANNER_IMAGE=true
CRAWLER_FULL_PAGE_SCREENSHOT=false
CRAWLER_STORE_PDF=false
CRAWLER_FULL_PAGE_ARCHIVE=false
CRAWLER_VIDEO_DOWNLOAD=false
```

- Asset Storage lokal und S3-kompatibel.
- OCR-Konfiguration.
- Prometheus-Metriken des Import-Workers.
- AIO-Container-Architektur als Skalierungsrisiko.
- Package-Namespace `@karakeep/*` als Fork-Risiko.
- Stripe-/Subscription-Tabellen als Self-hosting-Ballast.
- Meilisearch als potenziell optionale vs pflichtige Komponente für v0.1-alpha.
- Konkrete vorgeschlagene Implementierungsdateien und Reihenfolge.

## 5. Besonders wichtige Risiken

Priorisiert:

### 1. Soft Delete und Sync-Löschungen

Floccus-Sync kann Löschungen auslösen. Harte Deletes wären für LinkSteward riskant, weil ADR-015 Soft Delete/Papierkorb fordert und Fehl-Syncs sonst Datenverlust verursachen können.

Entscheidung: Soft Delete muss vor produktivem Floccus-Sync geklärt sein.

### 2. Linkwarden-Kompatibilität muss exakt getestet werden

Floccus-Kompatibilität ist nicht durch ähnliche Endpunkte bewiesen. Feldnamen, Statuscodes, Pagination, Delete-Semantik und Ordner-/Link-Mapping müssen gegen Floccus getestet werden.

Entscheidung: Früh Firefox + Chromium + Floccus Linkwarden-Modus testen.

### 3. SQLite vs PostgreSQL

Die LinkSteward-Architektur nennt PostgreSQL, KaraKeep nutzt SQLite. Ein früher PostgreSQL-Umbau wäre groß. Ein späterer Wechsel wäre ebenfalls teuer.

Entscheidung: Für v0.1-alpha SQLite beibehalten, aber Architektur-Doku/ADR korrigieren oder als bewusst abweichenden Zielzustand markieren.

### 4. Upstream-Merge-Konflikte

Kritische Dateien:

```text
packages/db/schema.ts
packages/api/index.ts
packages/trpc/routers/_app.ts
packages/shared/types/*
```

Entscheidung: Erweiterungen so additiv und getrennt wie möglich halten.

### 5. Nicht-URL-Items in Kompatibilitäts-APIs

KaraKeep kann Text- und Asset-Bookmarks speichern. Floccus/Linkwarden-Compat sollte nur kompatible URL-Links ausgeben.

Entscheidung: Filterregel zentral in Compatibility Mapper.

### 6. Async Worker vs Sync-API-Erwartung

Crawling, Tagging und Archivierung laufen asynchron. Floccus erwartet, dass CRUD-Operationen sofort konsistent genug sind.

Entscheidung: Sync-API darf nur Bookmark/List/Tag-Kernzustand voraussetzen, nicht Crawl-Ergebnis.

### 7. Package-Namespace und Branding

Eine frühe Umbenennung von `@karakeep/*` auf `@linksteward/*` würde großen Churn erzeugen.

Entscheidung: Für v0.1-alpha Namespace beibehalten.

## 6. Belastbare Empfehlungen

Belastbar aus beiden Analysen:

```text
KaraKeep als Basis verwenden.
Auth/API Keys wiederverwenden.
Bookmarks als Items wiederverwenden.
bookmarkLists als Collections wiederverwenden.
Tags wiederverwenden.
Crawler/Archivierung wiederverwenden.
Import-Sessions und HTML Parser wiederverwenden.
Ollama/OpenAI-Inferenz wiederverwenden.
Docker Compose/AIO für v0.1-alpha wiederverwenden.
Linkwarden-kompatible API als v0.1-alpha-Priorität bauen.
Nicht-URL-Items aus Kompatibilitäts-APIs ausblenden.
Floccus früh mit echten Clients testen.
```

Belastbar mit Einschränkung:

```text
Extension Tables bevorzugen.
```

Einschränkung: Soft Delete könnte später eine direkte Kernspalte rechtfertigen, aber für den ersten Alpha-Pfad ist ein additiver Start risikoärmer.

Nicht vollständig belastbar:

```text
400-600 Zeilen Aufwand
`bookmarks.deletedAt` sofort direkt hinzufügen
Meilisearch für v0.1-alpha optional machen
KaraKeep-Floccus-Modus als direkt bestätigt behandeln
```

Diese Punkte brauchen zusätzliche Verifikation.

## 7. Offene Fragen

### Datenbank

- Bleibt LinkSteward v0.1-alpha bewusst bei SQLite?
- Wird PostgreSQL als späteres Ziel gestrichen, verschoben oder per ADR begründet?
- Welche Indizes brauchen Extension Tables für Sync, Soft Delete und URL-Normalisierung?

### Soft Delete

- Reicht `linksteward_item_extensions.deletedAt` für v0.1-alpha?
- Müssen KaraKeep UI und REST-Routen gelöschte Items sofort ausblenden, oder nur Compatibility APIs?
- Wie werden Restore und endgültiges Löschen modelliert?

### Floccus/Linkwarden

- Welche Linkwarden-API-Version und Felder erwartet die aktuelle Floccus-Version?
- Wie behandelt Floccus Server-IDs, Löschungen und Konflikte?
- Sind Tags im ersten Sync nötig oder reicht Collections/Links?
- Wie verhält sich Floccus bei `javascript:` URLs wirklich?

### Mapping

- Braucht LinkSteward externe IDs für Floccus, oder reichen KaraKeep IDs als stabile Server-IDs?
- Soll `external_mappings` schon in v0.1-alpha persistiert werden oder erst nach erstem Protokolltest?
- Wie werden verschachtelte Collections aus KaraKeep `parentId` in Linkwarden-Responses gemappt?

### Fork-Strategie

- Wird aktiv gegen Upstream gemerged oder auf einem KaraKeep-Commit eingefroren?
- Wann wird Branding/Namespace angefasst?
- Wie bleiben LinkSteward-spezifische API-Typen getrennt von KaraKeep-Typen?

## 8. Entscheidung für LinkSteward v0.1-alpha

Empfohlene Entscheidung:

```text
Für v0.1-alpha:
├─ SQLite beibehalten
├─ @karakeep/* Namespace beibehalten
├─ KaraKeep Auth/API Keys wiederverwenden
├─ KaraKeep Bookmarks/Lists/Tags wiederverwenden
├─ Linkwarden-kompatible API minimal implementieren
├─ Floccus Linkwarden-Modus als primären Alpha-Test nutzen
├─ Soft Delete additiv über Extension Table modellieren
├─ kein PostgreSQL-Umbau
├─ keine Branding-/Namespace-Großumbenennung
└─ keine direkte Kernschema-Erweiterung ohne separaten Review
```

Der Alpha-Erfolg ist erreicht, wenn:

```text
1. Floccus kann sich per Bearer/API-Key verbinden.
2. Browser-Ordner erscheinen als LinkSteward Collections.
3. Browser-Bookmarks erscheinen als LinkSteward Links.
4. Änderungen an Titel/URL/Collection synchronisieren in beide Richtungen.
5. Ungeeignete URL-Schemata und Nicht-URL-Items werden nicht ausgegeben.
6. Löschungen verursachen keinen irreversiblen Datenverlust.
```

## Priorisierte Empfehlung

1. Linkwarden-Floccus-Kompatibilität als ersten Alpha-Slice bauen.
2. KaraKeep-Kernmodule für Auth, Bookmarks, Lists, Tags und API-Key-Scopes wiederverwenden.
3. Extension Tables für LinkSteward-Zusatzdaten einführen, mindestens `linksteward_item_extensions` und wahrscheinlich `linksteward_external_mappings`.
4. Soft Delete für v0.1-alpha additiv lösen; direkte `bookmarks.deletedAt`-Spalte erst nach Query-/Upstream-Risiko-Review.
5. SQLite für v0.1-alpha akzeptieren und PostgreSQL-Frage als ADR/Issue klären.
6. Crawler/Ollama/Import nicht als ersten Implementierungsblock anfassen; diese Module sind schon ausreichend vorhanden oder später additiv erweiterbar.
7. Früh echte Floccus-Tests mit Firefox und Chromium durchführen.

## Konkrete nächste Issues

```text
Issue 1: ADR SQLite vs PostgreSQL für v0.1-alpha
Ziel: Entscheiden, dass v0.1-alpha auf KaraKeep SQLite bleibt oder bewusst PostgreSQL-Umbau plant.

Issue 2: Linkwarden-Floccus API Contract verifizieren
Ziel: Floccus Linkwarden-Modus gegen echte API-Erwartungen prüfen: Endpunkte, Felder, Statuscodes, Pagination, Delete.

Issue 3: LinkSteward Extension Tables Basis entwerfen
Ziel: Minimalmodell für `linksteward_item_extensions` und `linksteward_external_mappings` definieren.

Issue 4: Soft Delete Semantik für Sync festlegen
Ziel: Delete, Restore, Hard Delete, Filterung und Konfliktfälle definieren.

Issue 5: Compatibility Mapper spezifizieren
Ziel: Mapping `bookmarkLists` → Collections, `bookmarks/bookmarkLinks` → Links, Tags und URL-Filter festlegen.

Issue 6: Minimal Linkwarden Collections API implementieren
Ziel: GET/POST/PATCH/DELETE Collections als Adapter auf `bookmarkLists`.

Issue 7: Minimal Linkwarden Links API implementieren
Ziel: GET/POST/PATCH/DELETE Links als Adapter auf `bookmarks`/`bookmarkLinks`.

Issue 8: Minimal Tags API für Floccus prüfen/implementieren
Ziel: Nur die für Floccus nötigen Tag-Operationen unterstützen.

Issue 9: Floccus E2E-Testmatrix vorbereiten
Ziel: Firefox + Chromium, initialer Sync, Create, Update, Move, Delete, Konflikt, Duplikat.

Issue 10: Finale KaraKeep-Analyse konsolidieren
Ziel: Codex- und Claude-Erkenntnisse in `karakeep-analysis-v0.1.md` zusammenführen.
```

## Entscheidungsvorlage: Extension Tables vs direkte Schema-Erweiterung

### Option A: Nur Extension Tables

Beispiel:

```text
bookmarks bleibt unverändert
bookmarkLinks bleibt unverändert

linksteward_item_extensions
├─ bookmarkId
├─ deletedAt
├─ normalizedUrl
├─ canonicalUrl
├─ rootDomain
├─ urlHash
├─ revision
└─ metadataJson
```

Vorteile:

- geringeres Upstream-Merge-Risiko
- KaraKeep-Kern bleibt möglichst unangetastet
- LinkSteward-Semantik bleibt klar separiert
- gute Passung zur bestehenden ADR "Erweiterungsschicht"

Nachteile:

- zusätzliche Joins
- Risiko, dass bestehende KaraKeep-UI/Routen gelöschte Items weiter anzeigen, solange sie nicht angepasst werden
- mehr Adapterlogik nötig

Empfehlung für v0.1-alpha: bevorzugen.

### Option B: Direkte Schema-Erweiterung

Beispiel:

```text
bookmarks.deletedAt
bookmarkLinks.normalizedUrl
bookmarkLinks.urlHash
```

Vorteile:

- einfachere Filter in Kernqueries
- Soft Delete wird zentraler Bestandteil des Datenmodells
- weniger Join-Aufwand

Nachteile:

- mehr Merge-Konflikte mit Upstream
- mehr bestehende Queries müssen angepasst werden
- höheres Risiko für KaraKeep-Web/Mobile/Extension-Verhalten
- schwerer rückbaubar

Empfehlung für v0.1-alpha: nicht als erster Schritt.

### Option C: Hybrid

Beispiel:

```text
bookmarks.deletedAt direkt
alle anderen LinkSteward-Daten in Extension Tables
```

Vorteile:

- Soft Delete zentral
- andere Features bleiben additiv

Nachteile:

- berührt trotzdem die wichtigste Kerntabelle
- zwingt früh zu breiter Query-Anpassung
- erhöht Alpha-Scope

Empfehlung: als spätere Option offenhalten, nicht für den ersten Alpha-Slice festlegen.

### Entscheidung

Für LinkSteward v0.1-alpha:

```text
Option A wählen: Extension Tables zuerst.
```

Review-Gate:

```text
Nach erstem Floccus-Sync prüfen:
├─ Sind Joins für Soft Delete/Mapping zu komplex?
├─ Werden zu viele KaraKeep-Kernqueries angepasst?
├─ Gibt es Performance-Probleme?
└─ Rechtfertigt das eine direkte `bookmarks.deletedAt`-Spalte?
```

## Übernahmeempfehlung für finale `karakeep-analysis-v0.1.md`

Aus Codex übernehmen:

- klare Empfehlung "Extension Tables zuerst"
- Linkwarden-Floccus-Sync als kleinstes technisches v0.1-alpha Feature
- Trennung von Native LinkSteward API und Kompatibilitäts-APIs
- `packages/api`/`packages/trpc`/`packages/db` als Andockpunkte
- Liste der LinkSteward-Extension Tables
- Risiko: Auto-Tagging und Crawler dürfen Sync nicht blockieren
- Filterung von Nicht-URL-Items und unerlaubten URL-Schemata
- `external_mappings`, `sync_events`, `ai_suggestions` als additive Module

Aus Claude übernehmen:

- PostgreSQL-vs-SQLite-Widerspruch als explizites Risiko
- Package-Namespace `@karakeep/*` als Fork-Risiko
- AIO-Container-Architektur und Skalierungsgrenze
- Stack-Details: Next.js 15, Hono, tRPC, Drizzle, better-sqlite3, Meilisearch, s6-overlay
- genauere Auth-Details inklusive `ak1` Legacy und bcrypt/OAuth
- SSRF-Schutz-Hinweis über Netzwerkvalidierung
- Crawl-Defaults und S3 Asset Storage
- OCR als vorhandenes/konfigurierbares Feature
- Import-Worker-Metriken und zweiphasigen Importprozess
- Stripe/Subscriptions als Self-hosting-Ballast, aber kein MVP-Blocker

Nicht ungeprüft übernehmen:

- direkte Empfehlung `bookmarks.deletedAt` sofort einzubauen
- Aufwandsschätzung "400-600 Zeilen"
- Aussage, dass Floccus KaraKeep-Modus bereits sicher direkt nutzbar ist
- konkrete Dateiänderungsreihenfolge mit Migration, solange keine Implementierung beschlossen ist
- Meilisearch optional zu machen, ohne Suchpfade zu prüfen

Empfohlene finale Struktur:

```text
1. Kurzfazit
2. Repository-Struktur
3. Ist-Datenmodell KaraKeep
4. Abgleich LinkSteward-Zieldatenmodell
5. API/Auth
6. Worker/Crawling/Archivierung
7. Import/Export
8. AI/Ollama/OCR
9. Docker/Deployment
10. Floccus/Linkwarden-Kompatibilität
11. Erweiterungsstrategie
12. Risiken
13. Entscheidungen für v0.1-alpha
14. Nächste Issues
```

## Schlussentscheidung

Für LinkSteward v0.1-alpha sollte entschieden werden:

```text
KaraKeep bleibt technische Basis.
SQLite bleibt für Alpha bestehen.
Extension Tables werden als erste Erweiterungsstrategie gewählt.
Linkwarden-kompatible API + Floccus erster Sync ist der erste Alpha-Slice.
Soft Delete wird für Alpha additiv modelliert und nach dem ersten Sync erneut bewertet.
```

Damit bleibt der Alpha-Scope klein genug, testet aber genau den riskantesten und wichtigsten Teil: echte Browser-Bookmark-Synchronisation über Floccus.
