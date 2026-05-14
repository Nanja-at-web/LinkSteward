# KaraKeep Vergleichsergebnis Codex v0.1

## Ziel

Diese Datei vergleicht ausschließlich:

- `docs/docs/linksteward/analysis/karakeep-analysis-comparison-codex-v0.1.md`
- `docs/docs/linksteward/analysis/karakeep-analysis-comparison-claude-v0.1.md`

Alle Aussagen in diesem Dokument sind nur aus diesen zwei Vergleichsauswertungen abgeleitet. Punkte, die darüber hinaus Projekt- oder Code-Kontext bräuchten, sind als nicht aus den erlaubten Dateien ableitbar markiert.

## Kurzfazit

Beide Vergleichsauswertungen treffen dieselbe Grundentscheidung: KaraKeep ist eine geeignete technische Basis für LinkSteward, und der erste sinnvolle Alpha-Slice ist eine Linkwarden-kompatible API mit echtem Floccus-Sync im Linkwarden-Modus.

Die belastbarste v0.1-alpha-Entscheidung ist:

```text
KaraKeep als Basis behalten
SQLite für Alpha behalten
@karakeep/* Namespace für Alpha behalten
Auth/API Keys, Bookmarks, Lists, Tags wiederverwenden
Linkwarden-kompatible API minimal bauen
Soft Delete zunächst additiv über Extension Table modellieren
keine direkte Kernschema-Erweiterung vor dem ersten Sync-Slice
```

Der wichtigste geklärte Widerspruch ist `Extension Tables` vs `bookmarks.deletedAt`: Beide Vergleichsauswertungen sehen die Spannung, aber beide lösen sie für v0.1-alpha zugunsten von Extension Tables zuerst auf.

## 1. Übereinstimmungen

Beide Vergleichsauswertungen stimmen in diesen Punkten überein:

- KaraKeep ist als Fork-Basis für LinkSteward geeignet.
- Der technische Kern ist weit genug, um nicht bei null zu starten.
- Auth/API Keys sind direkt wiederverwendbar.
- Bookmarks, BookmarkLinks, BookmarkLists und Tags sind die passende Basis für Items, Links, Collections und Tags.
- Crawler, Archivierung, Import-Sessions, HTML Parser, Docker/AIO, Meilisearch, Worker-Infrastruktur und Ollama/OpenAI sind starke Wiederverwendungspunkte.
- Linkwarden-Kompatibilität fehlt als eigener Adapter und muss gebaut werden.
- Floccus im Linkwarden-Modus ist der erste sinnvolle Alpha-Test.
- Nicht-URL-Items und unerlaubte URL-Schemata müssen aus Kompatibilitäts-APIs ausgeblendet werden.
- Soft Delete ist für Floccus-Sync kritisch.
- SQLite ist der Ist-Zustand; PostgreSQL ist für v0.1-alpha kein Implementierungsziel.
- Branding und `@karakeep/*` Namespace sollten für Alpha nicht großflächig umbenannt werden.

Gemeinsamer v0.1-alpha-Pfad:

```text
Linkwarden-kompatible API
→ Floccus im Linkwarden-Modus
→ erster Browser-Bookmark-Sync
→ Änderungen in beide Richtungen
→ keine irreversiblen Löschungen
```

## 2. Widersprüche

### Extension Tables vs direkte Schema-Erweiterung

Beide Vergleichsauswertungen beschreiben denselben Ursprungskonflikt:

```text
Codex-Ursprungsanalyse:
Extension Tables bevorzugen, keine direkte Kernschema-Erweiterung für Alpha.

Claude-Ursprungsanalyse:
Hybridansatz mit direktem `bookmarks.deletedAt` plus Extension Tables.
```

Die beiden Vergleichsauswertungen lösen diesen Konflikt jedoch praktisch gleich:

```text
Für v0.1-alpha:
Extension Tables zuerst.
Direkte `bookmarks.deletedAt`-Spalte erst nach erstem Sync-Zyklus prüfen.
```

Damit ist dies kein verbleibender Entscheidungswiderspruch, sondern ein Review-Gate.

### Queue-System

Die Claude-Vergleichsauswertung nennt einen faktischen Fehler in der ursprünglichen Claude-Analyse:

```text
Falsch: Queue-System sei vermutlich Bull-basiert.
Korrigiert: Queue-System ist queue-liteque plus queue-restate.
```

Die Codex-Vergleichsauswertung erwähnt das nicht als Widerspruch, identifiziert aber `queue-liteque` und `queue-restate` als Queue-Provider. Die finale Datei sollte die Claude-Korrektur übernehmen.

### SQLite vs PostgreSQL

Beide Vergleichsauswertungen sehen die PostgreSQL-Frage als wichtig. Claude gewichtet den Dokumentationswiderspruch stärker, Codex bewertet SQLite für Alpha pragmatischer.

Gemeinsame aufgelöste Entscheidung:

```text
SQLite für v0.1-alpha beibehalten.
PostgreSQL-Frage per ADR/Dokumentationskorrektur klären.
```

### Floccus KaraKeep-Modus

Beide warnen davor, KaraKeep-Floccus-Modus ohne Test als gesichert zu behandeln. Linkwarden-Modus bleibt der belastbarere Alpha-Pfad.

Nicht aus den erlaubten Dateien ableitbar:

- Ob die aktuelle Floccus-Version KaraKeep-native Endpunkte tatsächlich vollständig unterstützt.

### Aufwandsschätzung

Claude nennt 400-600 Zeilen TypeScript und eine Migration als Hypothese. Codex gibt keine Schätzung und warnt, diese nicht ungeprüft zu übernehmen.

Entscheidung:

```text
Nicht als Planungszusage übernehmen.
```

## 3. Empfehlungen in beiden Vergleichsauswertungen

Beide enthalten diese Empfehlungen:

```text
KaraKeep als technische Basis verwenden
Auth/API Keys wiederverwenden
Bookmarks/BookmarkLinks als Link-Basis verwenden
BookmarkLists als Collections verwenden
Tags/tagsOnBookmarks wiederverwenden
Crawler/Archivierung wiederverwenden
Import-Sessions + HTML Parser wiederverwenden
Ollama/OpenAI-Inferenz wiederverwenden
Docker Compose/AIO für v0.1-alpha wiederverwenden
Linkwarden-kompatible API als v0.1-alpha-Priorität bauen
Floccus früh mit Firefox und Chromium testen
Nicht-URL-Items aus Kompatibilitäts-APIs ausblenden
Extension Tables als erste Erweiterungsstrategie wählen
SQLite für Alpha beibehalten
@karakeep/* Namespace für Alpha beibehalten
```

## 4. Gemeinsame wichtige Risiken

Beide bewerten diese Risiken als wichtig:

### Soft Delete und Sync-Löschungen

Floccus kann Löschungen auslösen. Harte Deletes können zu Datenverlust führen. Soft Delete muss vor produktivem Floccus-Sync geklärt sein.

### Linkwarden-Kompatibilität

Ähnliche Endpunkte reichen nicht. Floccus-Verhalten muss real getestet werden: Felder, Statuscodes, Pagination, Delete-Semantik, Tags und Mapping.

### SQLite vs PostgreSQL

Der Alpha soll SQLite behalten, aber der Zielkonflikt zur Architektur muss dokumentiert werden.

### Upstream-Merge-Konflikte

Kritische Änderungsbereiche:

```text
packages/db/schema.ts
packages/api/index.ts
packages/trpc/routers/_app.ts
packages/shared/types/*
```

### Nicht-URL-Items und URL-Schemata

KaraKeep kann Text- und Asset-Bookmarks speichern. Floccus/Linkwarden-Compat muss nur kompatible URL-Links ausgeben.

### Async Worker vs Sync-API

Crawling, Tagging und Archivierung laufen asynchron. Sync darf nicht auf Crawl- oder AI-Ergebnisse warten.

### Package-Namespace

`@karakeep/*` Umbenennung ist Churn und kein Alpha-Blocker.

## 5. Nur in der Codex-Vergleichsauswertung

Diese Punkte nennt oder betont nur die Codex-Vergleichsauswertung:

- Native LinkSteward API unter `/api/linksteward/v1/*` soll getrennt von Kompatibilitäts-APIs bleiben.
- `packages/api`, `packages/trpc`, `packages/db` werden als zentrale Andockpunkte herausgestellt.
- `packages/shared/types/*` wird als besonders riskanter Änderungsbereich genannt.
- `linksteward_sync_events`, `linksteward_ai_suggestions`, `linksteward_archive_jobs` und `linksteward_archive_events` werden explizit als additive Module genannt.
- Sync darf nicht auf Crawling/Archivierung warten.
- Auto-Tagging darf Floccus-Sync nicht destabilisieren.
- AGPL/Fork-Kommunikation wird als Langzeitrisiko erwähnt.
- Review-Gate nach erstem Floccus-Sync für eine mögliche spätere `bookmarks.deletedAt`-Spalte.
- Empfehlung für die finale Analyse-Struktur mit 15 Abschnitten.

## 6. Nur in der Claude-Vergleichsauswertung

Diese Punkte nennt oder betont nur die Claude-Vergleichsauswertung:

- Queue-System-Korrektur: nicht Bull, sondern `queue-liteque`/`queue-restate`.
- `packages/plugins/` inklusive `search-meilisearch`, `ratelimit-memory`, `ratelimit-redis`.
- Next.js Catch-All-Route `apps/web/app/api/[[...route]]/route.ts` als API-Mount.
- `apiKeys.exchange` als relevante tRPC-Prozedur.
- FeedRefreshingWorker und BackupSchedulingWorker als Timer-Loops statt Queue-Consumer.
- S3-kompatibler Asset Storage.
- OCR-Konfiguration.
- `@karakeep/*` Namespace-Risiko mit Quantifizierung über viele Import-Pfade.
- AIO-Container als Skalierungsgrenze.
- Stripe/Subscriptions als Self-hosting-Ballast.
- Meilisearch-Optionalität als offene Frage.
- Auth-Details wie NextAuth.js, bcrypt, OIDC und `ak1` Legacy-Format.
- konkrete Floccus-Protokollfrage: erkennt Floccus bestehende Einträge via URL oder Server-ID?
- WAL-Modus, Generated Columns, Composite Indexes, Kollaborationslisten und Tag-Stile als zusätzliche Schema-/Betriebsdetails.

## 7. Offene Fragen nach beiden Vergleichsauswertungen

### Datenbank

- Bleibt SQLite nur für v0.1-alpha oder dauerhaft?
- Wird PostgreSQL gestrichen, verschoben oder als Zielzustand per ADR markiert?
- Welche Indizes brauchen Extension Tables?
- Reicht WAL/SQLite für parallele Compat-API- und Worker-Writes?

### Soft Delete

- Reicht `linksteward_item_extensions.deletedAt` für v0.1-alpha?
- Muss KaraKeep UI gelöschte Items schon im Alpha ausblenden?
- Wie werden Restore, Hard Delete und Papierkorb modelliert?

### Floccus/Linkwarden

- Welche Linkwarden-API-Version und Felder erwartet Floccus?
- Wie behandelt Floccus Server-IDs, URL-Matching, Deletes und Konflikte?
- Sind Tags für den ersten Sync nötig?
- Wie verhält sich Floccus bei `javascript:`, `data:` und anderen Sonder-URLs?

### Mapping

- Reichen KaraKeep-IDs als stabile Server-IDs?
- Muss `linksteward_external_mappings` schon vor dem ersten Test befüllt werden?
- Wie werden verschachtelte `bookmarkLists.parentId` als Linkwarden Collections ausgegeben?

### Fork-Strategie

- Aktiver Upstream-Merge oder stabiler Fork?
- Wann wird Branding/Namespace angefasst?
- Wie bleiben LinkSteward-Typen von KaraKeep-Typen getrennt?

### Betrieb

- Ist Meilisearch für v0.1-alpha harte Abhängigkeit?
- Nicht aus den erlaubten Dateien ableitbar: Welche konkreten Codepfade Meilisearch zwingend voraussetzen.

## 8. Belastbarste v0.1-alpha-Entscheidung

Die belastbarste Entscheidung ist:

```text
Für LinkSteward v0.1-alpha:
├─ KaraKeep bleibt technische Basis
├─ SQLite bleibt bestehen
├─ @karakeep/* Namespace bleibt bestehen
├─ Auth/API Keys werden wiederverwendet
├─ Bookmarks, Lists und Tags werden wiederverwendet
├─ Linkwarden-kompatible API ist der erste Alpha-Slice
├─ Floccus Linkwarden-Modus ist der primäre Test
├─ Soft Delete wird additiv über Extension Table modelliert
├─ External Mappings werden additiv vorbereitet
├─ keine direkte `bookmarks.deletedAt`-Spalte im ersten Slice
├─ keine PostgreSQL-Migration
├─ keine Package-/Branding-Großumbenennung
└─ Queue-System wird als queue-liteque/restate verstanden, nicht Bull
```

Alpha-Erfolg:

```text
1. Floccus verbindet sich per Bearer/API-Key.
2. Browser-Ordner erscheinen als Collections.
3. Browser-Bookmarks erscheinen als Links.
4. Titel, URL und Collection synchronisieren in beide Richtungen.
5. Unerlaubte URLs und Nicht-URL-Items erscheinen nicht in Floccus.
6. Löschungen erzeugen keinen unwiederbringlichen Datenverlust.
```

## Finale priorisierte Empfehlung

1. Vor der ersten Codeänderung SQLite-vs-PostgreSQL und Soft-Delete-Alpha-Strategie dokumentarisch entscheiden.
2. Floccus Linkwarden-Protokoll manuell verifizieren.
3. Extension Tables als erste Erweiterungsstrategie wählen.
4. Minimal `linksteward_item_extensions` und `linksteward_external_mappings` planen.
5. Linkwarden-Compat-Mapper spezifizieren: Collections, Links, Tags, URL-Filter, AI-Tag-Verhalten.
6. Erst danach Linkwarden Collections/Links API implementieren.
7. Floccus E2E mit Firefox und Chromium früh testen.
8. Nach erstem erfolgreichen Sync prüfen, ob direkte `bookmarks.deletedAt`-Spalte nötig wird.

## Finale Entscheidungsvorlage: Extension Tables vs direkte Schema-Erweiterung

### Option A: Extension Tables zuerst

Beispiel:

```text
bookmarks unverändert
bookmarkLinks unverändert

linksteward_item_extensions
├─ bookmarkId
├─ deletedAt
├─ normalizedUrl
├─ canonicalUrl
├─ rootDomain
├─ urlHash
├─ revision
└─ metadataJson

linksteward_external_mappings
├─ provider
├─ externalId
├─ bookmarkId nullable
├─ listId nullable
├─ userId
└─ metadataJson
```

Vorteile:

- geringeres Upstream-Merge-Risiko
- KaraKeep-Kern bleibt unverändert
- LinkSteward-Semantik bleibt getrennt
- Migrationen sind additiv und besser rückbaubar
- passt zur Alpha-Begrenzung

Nachteile:

- zusätzliche Joins
- mehr Adapterlogik
- KaraKeep UI könnte gelöschte Items weiter anzeigen, sofern nicht separat gefiltert

Entscheidung: Für v0.1-alpha wählen.

### Option B: Direkte Schema-Erweiterung

Beispiel:

```text
bookmarks.deletedAt
bookmarkLinks.normalizedUrl
bookmarkLinks.urlHash
```

Vorteile:

- zentrale Filterung
- weniger Join-Aufwand
- Soft Delete wird Kernmodell

Nachteile:

- höheres Upstream-Merge-Risiko
- viele bestehende Queries betroffen
- höheres Risiko für Web/Mobile/Extension/CLI-Verhalten
- schwerer rückbaubar

Entscheidung: Nicht für den ersten Alpha-Slice.

### Option C: Hybrid später prüfen

```text
bookmarks.deletedAt direkt
alle anderen LinkSteward-Daten in Extension Tables
```

Entscheidung: Nach erstem Sync-Zyklus als Review-Gate offenhalten.

Review-Fragen:

```text
Sind Joins zu komplex?
Gibt es Performance-Probleme?
Müssen zu viele Kernqueries angepasst werden?
Ist das Upstream-Risiko vertretbar?
```

## Finale nächste Issues

```text
Issue 001: ADR SQLite vs PostgreSQL für v0.1-alpha
Ziel: SQLite für Alpha bestätigen oder PostgreSQL-Umbau bewusst beschließen.

Issue 002: Soft Delete Alpha-Semantik festlegen
Ziel: Extension-Table-Soft-Delete, Restore, Hard Delete, Filterung und Konflikte definieren.

Issue 003: Floccus Linkwarden API Contract verifizieren
Ziel: Endpunkte, Felder, Pagination, Deletes, Server-ID-Konzept und Tags manuell prüfen.

Issue 004: Extension Tables Basis spezifizieren
Ziel: `linksteward_item_extensions` und `linksteward_external_mappings` minimal definieren.

Issue 005: Compatibility Mapper spezifizieren
Ziel: `bookmarkLists` → Collections, `bookmarks/bookmarkLinks` → Links, Tags, URL-Filter, AI-Tag-Handling.

Issue 006: Linkwarden Collections API planen/implementieren
Ziel: GET/POST/PATCH/DELETE Collections als Adapter.

Issue 007: Linkwarden Links API planen/implementieren
Ziel: GET/POST/PATCH/DELETE Links als Adapter.

Issue 008: Linkwarden Tags API minimal klären
Ziel: Prüfen, welche Tag-Operationen Floccus wirklich braucht.

Issue 009: Floccus E2E-Testmatrix vorbereiten
Ziel: Firefox + Chromium, initialer Sync, Create, Update, Move, Delete, Konflikt, Duplikat, unerlaubte URLs.

Issue 010: Queue-System-Dokumentation korrigieren
Ziel: queue-liteque/restate als tatsächliches Queue-System dokumentieren; Bull nicht übernehmen.

Issue 011: Upstream-/Namespace-Strategie dokumentieren
Ziel: aktiver Merge vs stabiler Fork, `@karakeep/*` beibehalten für Alpha.

Issue 012: Finale `karakeep-analysis-v0.1.md` konsolidieren
Ziel: Übernahmepunkte aus beiden Vergleichsauswertungen zusammenführen.
```

## In finale `karakeep-analysis-v0.1.md` übernehmen

Übernehmen:

- KaraKeep als geeignete technische Basis.
- v0.1-alpha-Priorität: Linkwarden-kompatible API + Floccus erster Sync.
- Extension Tables zuerst als Alpha-Strategie.
- Direkte `bookmarks.deletedAt`-Spalte nur als späteres Review-Gate.
- SQLite für Alpha, PostgreSQL-Frage als ADR/Dokumentationskorrektur.
- Queue-System-Korrektur: `queue-liteque`/`queue-restate`, nicht Bull.
- Wiederverwendbare Module: Auth/API Keys, Bookmarks, Lists, Tags, Crawler, Import, AI/Ollama, Docker/AIO, Meilisearch.
- Kompatibilitäts-APIs dürfen Sync nicht an Crawler oder AI koppeln.
- Nicht-URL-Items und unerlaubte URL-Schemata aktiv filtern.
- AI-Tags im Alpha ausblenden oder als read-only behandeln.
- `@karakeep/*` Namespace für Alpha beibehalten.
- AIO-Container und Meilisearch als Alpha-Deployment-Basis, Skalierung später prüfen.
- OCR, S3 Asset Storage, Import-Metriken und Auth-Details als vorhandene Fähigkeiten.
- AGPL/Fork-Kommunikation und Upstream-Strategie als Langzeitthemen.

Nicht ungeprüft übernehmen:

- `bookmarks.deletedAt` sofort direkt einbauen.
- Aufwandsschätzung 400-600 Zeilen als Zusage.
- Floccus KaraKeep-Modus als sicher bestätigt.
- Meilisearch optional machen.
- Queue-System als Bull beschreiben.
- konkrete Codeänderungsreihenfolge als beschlossen, bevor Issues 001-005 geklärt sind.

## Vor erster Codeänderung manuell prüfen

Manuell zu prüfen:

```text
1. Floccus Linkwarden API Contract:
   Endpunkte, Felder, IDs, Pagination, Deletes, Tags.

2. Soft Delete Scope:
   Nur Compat-API filtern oder auch KaraKeep UI/API im Alpha?

3. SQLite/PostgreSQL Entscheidung:
   Alpha bewusst SQLite oder früher Architekturumbau?

4. External Mapping Bedarf:
   Reichen KaraKeep IDs oder braucht Floccus/Linkwarden persistente externe IDs?

5. URL-Schema-Verhalten:
   Welche Schemata akzeptiert Floccus tatsächlich?

6. AI-Tag-Verhalten:
   Werden AI-generierte Tags im Alpha ausgeblendet, read-only oder synchronisiert?

7. Meilisearch-Abhängigkeit:
   Ist Meilisearch für Alpha zwingend?
   Nicht aus den erlaubten Dateien ableitbar: konkrete Such-Codepfade.

8. Queue-Erweiterungsmuster:
   Wie werden neue Queues korrekt nach queue-liteque/restate-Muster angebunden?
   Nicht aus den erlaubten Dateien ableitbar: genaue Implementierung.

9. Upstream-Strategie:
   aktiver Merge oder stabiler Fork?

10. Namespace/Branding:
   `@karakeep/*` für Alpha beibehalten, spätere Umbenennung separat planen.
```

## Schlussentscheidung

Für LinkSteward v0.1-alpha ist am belastbarsten:

```text
Extension Tables zuerst.
Linkwarden-Compat zuerst.
Floccus real testen.
SQLite und @karakeep/* für Alpha beibehalten.
Keine direkte Kernschema-Erweiterung vor dem ersten erfolgreichen Sync.
```

Diese Entscheidung hält den Alpha-Scope klein und testet trotzdem den kritischsten Produktpfad: echte Browser-Bookmark-Synchronisation über Floccus.
