# KaraKeep Analyse – Finales Vergleichsergebnis Claude v0.1

> Erstellt: 2026-05-14  
> Basis: Ausschließlicher Vergleich von  
> – `karakeep-analysis-comparison-codex-v0.1.md` (im Folgenden: Codex-VGL)  
> – `karakeep-analysis-comparison-claude-v0.1.md` (im Folgenden: Claude-VGL)  
> Zweck: Konsolidierte Entscheidungsgrundlage für LinkSteward v0.1-alpha

---

## Vorbemerkung

Beide Vergleichsdateien haben denselben Gegenstand (Vergleich der Codex- vs. Claude-Primäranalyse) und dieselbe Zielsetzung (Entscheidungsvorlage für v0.1-alpha). Die Übereinstimmungsrate ist hoch. Nennenswerte inhaltliche Widersprüche zwischen den beiden Vergleichsdateien gibt es nicht – es gibt aber Unterschiede in Vollständigkeit, Struktur und expliziter Benennung einzelner Risiken.

---

## 1. Übereinstimmungen zwischen Codex-VGL und Claude-VGL

### Hauptbefund

Beide Vergleichsdateien kommen unabhängig voneinander zum identischen Gesamtergebnis:

> KaraKeep ist als technische Basis für LinkSteward geeignet. Der erste Alpha-Slice ist die Linkwarden-kompatible API im Floccus-Linkwarden-Modus. Die Erweiterungsstrategie sind Extension Tables.

Dieser Befund ist durch zwei unabhängige Primäranalysen und zwei unabhängige Vergleiche vierfach bestätigt.

### Übereinstimmungen in der Datenbankbewertung

Beide Vergleiche sehen identisch:

- SQLite + Drizzle als Ist-Zustand, kein PostgreSQL-Umbau für v0.1-alpha
- `bookmarks`, `bookmarkLinks`, `bookmarkLists`, `bookmarkTags`, `tagsOnBookmarks`, `assets`, `importSessions`, `importStagingBookmarks`, `ruleEngineRules`, `ruleEngineActions`, `rssFeedsTable`, `webhooksTable`, `backupsTable` als vollständiges Ist-Schema
- Fehlende Lücken identisch: Soft Delete, External Mappings, URL-Normalisierung, Link-Health-Historie, Duplicate-Gruppen, AI-Suggestion-Workflow

### Übereinstimmungen in der API-Bewertung

Beide sehen:

- Hono REST API + tRPC als richtige Schichtung
- REST-API als dünner Adapter über tRPC
- Bearer API Keys ausreichend für Floccus
- Linkwarden-Kompatibilität fehlt vollständig (kein teilweise vorhanden)
- Native LinkSteward API gehört unter eigenem Pfad, nicht als Überlastung der KaraKeep-Routen

### Übereinstimmungen bei der Extension-Tables-Entscheidung

Beide Vergleiche wählen ohne Vorbehalt:

```text
Option A: Extension Tables zuerst.
Keine direkte bookmarks.deletedAt-Spalte für v0.1-alpha.
Review-Gate nach erstem Floccus-Sync.
```

Das Review-Gate nach dem ersten Sync (Joins zu komplex? Upstream-Konflikte zu hoch? Performance-Probleme?) ist in beiden Dateien wortgleich sinngemäß formuliert.

### Übereinstimmungen in der Risikoliste

Beide bewerten als kritisch (Reihenfolge stimmt überein):

1. Soft Delete muss vor produktivem Floccus-Sync geklärt sein
2. Linkwarden-API-Kompatibilität muss exakt getestet werden (nicht nur strukturell ähnlich)
3. SQLite vs. PostgreSQL – Dokumentationswiderspruch muss aufgelöst werden
4. Upstream-Merge-Konflikte in kritischen Dateien
5. Nicht-URL-Items in Kompatibilitäts-APIs aktiv filtern
6. Async Worker vs. synchrone API-Erwartung von Floccus

### Übereinstimmungen in der Entscheidungsliste für v0.1-alpha

Beide Vergleiche nennen dieselbe Entscheidungsliste:

```text
SQLite beibehalten
@karakeep/* Namespace beibehalten
Auth / API Keys wiederverwenden
Bookmarks / Lists / Tags wiederverwenden
Linkwarden-kompatible API minimal implementieren (collections + links + tags)
Floccus Linkwarden-Modus als primären Alpha-Test
Soft Delete additiv über linksteward_item_extensions.deletedAt
External Mappings als linksteward_external_mappings
Nicht-URL-Items aktiv in Compat-API filtern
Kein direktes bookmarks.deletedAt im ersten Alpha-Slice
```

### Übereinstimmungen in der Alpha-Erfolgsdefinition

Beide Vergleiche definieren identisch (mit minimalen Formulierungsunterschieden):

```text
1. Floccus verbindet sich per Bearer-API-Key
2. Browser-Ordner erscheinen als LinkSteward Collections
3. Browser-Bookmarks erscheinen als LinkSteward Links
4. Änderungen (Titel, URL, Collection) synchronisieren in beide Richtungen
5. Unerlaubte URL-Schemata und Nicht-URL-Items erscheinen nicht in Floccus
6. Löschungen verursachen keinen unwiederbringlichen Datenverlust
```

### Übereinstimmungen in der Übernahmeempfehlung

Beide Vergleiche stimmen überein:

**Aus der Codex-Primäranalyse übernehmen:**
- Extension Tables konsequent bevorzugen
- queue-liteque/queue-restate als korrektes Queue-System
- Linkwarden-Floccus-Sync als kleinstes technisches Alpha-Feature
- Trennung Native LinkSteward API und Compat-APIs
- Auto-Tagging-Risiko für Floccus-Sync
- Nicht-URL-Items-Filter
- packages/shared/types/* als Risiko-Änderungsbereich
- AGPL/Fork-Kommunikation

**Aus der Claude-Primäranalyse übernehmen:**
- PostgreSQL vs. SQLite Dokumentationswiderspruch
- Package-Namespace @karakeep/* als Fork-Risiko
- AIO-Container als Skalierungsgrenze
- Stack-Details (Next.js 15, Hono, tRPC, Drizzle, better-sqlite3, s6-overlay)
- Auth-Details (NextAuth.js, bcrypt, OIDC, ak1-Legacy)
- SSRF-Schutz via network.ts
- Crawl-Defaults und S3 Asset Storage
- OCR als konfigurierbares Feature
- FeedRefreshingWorker und BackupSchedulingWorker als Timer-Loops

**Nicht ungeprüft übernehmen (beide stimmen überein):**
- Queue-System ist Bull-basiert → faktisch falsch, korrigieren
- bookmarks.deletedAt sofort direkt hinzufügen → für Alpha zu früh
- Aufwandsschätzung 400-600 Zeilen → nur Hypothese
- Floccus KaraKeep-Modus direkt bestätigt → erst nach Test
- Meilisearch optional machen → erst nach Prüfung aller Suchpfade

---

## 2. Widersprüche zwischen Codex-VGL und Claude-VGL

Es gibt **keine inhaltlichen Widersprüche** in den Kernaustagen. Beide Vergleichsdateien kommen zu denselben Entscheidungen. Die Unterschiede liegen ausschließlich in Struktur und Detailtiefe.

### Strukturelle Unterschiede (kein inhaltlicher Widerspruch)

| Aspekt | Codex-VGL | Claude-VGL |
|--------|-----------|------------|
| Einstieg | Kurzfazit | Ziel-Abschnitt |
| Widersprüche | 3 explizit benannt | 5 nummeriert (W1-W5) |
| Issues | 10 (ohne Abhängigkeiten) | 11 (mit Abhängigkeitsnotation) |
| Finale Struktur | 14 Abschnitte | 15 Abschnitte |
| Prioritäten | sequenzielle Liste | explizite Prioritätsgruppen 1-4 |
| Risiken | 7 nummeriert | 7 nummeriert |

### Einziger nennenswert unterschiedlicher Schwerpunkt

**Queue-System-Fehler:**

- Codex-VGL erwähnt die korrekte Queue-Identifikation (queue-liteque) als Codex-only Punkt, aber **listet sie nicht als eigenen Widerspruch und nicht als eigenes Risiko**.
- Claude-VGL listet den Queue-Fehler explizit als Widerspruch W2 und als Risiko 3 ("Queue-System ist kein Bull").

Dieser Unterschied in der Strukturierung ist keine inhaltliche Abweichung – beide korrigieren den Fehler. Die Claude-VGL macht ihn jedoch sichtbarer für einen Leser, der die Datei ohne Vorwissen liest.

---

## 3. Empfehlungen in beiden Vergleichsauswertungen

Alle folgenden Empfehlungen erscheinen inhaltlich in beiden Dateien:

```text
BELASTBAR (beide ohne Vorbehalt):
──────────────────────────────────
KaraKeep als Fork-Basis
Auth / API Keys wiederverwenden
Bookmarks / Lists / Tags wiederverwenden
bookmarkLists als Collections
Crawler / Archivierung wiederverwenden
Import-Sessions + HTML Parser wiederverwenden
Ollama / OpenAI-Inferenz wiederverwenden
Docker Compose / AIO für v0.1-alpha
Linkwarden-kompatible API als v0.1-alpha-Priorität
Nicht-URL-Items aktiv filtern
Floccus früh mit echten Clients testen
Extension Tables als erste Strategie
SQLite für v0.1-alpha beibehalten
@karakeep/* Namespace beibehalten

MIT VORBEHALT (beide mit gleicher Einschränkung):
──────────────────────────────────────────────────
Soft Delete über Extension Table (Post-Alpha Review-Gate offen)
Meilisearch im Docker Compose beibehalten (Alternativen nicht untersucht)
```

---

## 4. Risiken, die von beiden als wichtig bewertet werden

Beide Vergleiche nennen diese Risiken als besonders wichtig und priorisieren sie ähnlich:

### Kritisch (Scope-blockend):

**R1 – Soft Delete vor Floccus-Sync**
Löschungen über Floccus könnten zu unwiederbringlichem Datenverlust führen, wenn kein Soft Delete implementiert ist. ADR-015 fordert es explizit.

**R2 – Linkwarden-API-Semantik muss exakt getestet werden**
Ähnliche Endpunkte ≠ kompatible Semantik. Ohne Floccus-Test ist keine Kompatibilitäts-Zusage möglich.

### Architektur (entscheidungspflichtig vor erster Migration):

**R3 – SQLite vs. PostgreSQL Dokumentationswiderspruch**
LinkSteward-Architekturdokumentation nennt PostgreSQL, Codebase nutzt SQLite. Der Widerspruch muss aufgelöst werden, bevor weitere Architektur-Entscheidungen auf der Dokumentation aufbauen.

### Implementierungsrelevant:

**R4 – Queue-System ist nicht Bull**
Die Claude-Primäranalyse nennt das Queue-System falsch. Neue LinkSteward-Queues müssen als Plugins nach dem queue-liteque-Muster implementiert werden.

**R5 – Upstream-Merge-Konflikte**
`packages/db/schema.ts`, `packages/api/index.ts`, `packages/trpc/routers/_app.ts`, `packages/shared/types/*` sind die kritischen Dateien. Additive Strategie reduziert, eliminiert nicht.

**R6 – Auto-Tagging destabilisiert Floccus-Sync**
KI-Tags entstehen asynchron. Floccus könnte beim nächsten Sync unerwartete Tags sehen. Compat-API sollte AI-Tags für Alpha ausblenden oder als read-only markieren.

**R7 – @karakeep/* Namespace (>500 Pfade)**
Kein v0.1-alpha Blocker, aber Umbenennung muss geplant werden. Je länger gewartet wird, desto mehr divergiert der Fork.

---

## 5. Punkte nur in der Codex-Vergleichsauswertung

Aspekte, die im Codex-VGL erscheinen, aber im Claude-VGL fehlen oder schwächer ausgearbeitet sind:

### Kurzfazit-Struktur am Anfang

Das Codex-VGL hat einen expliziten "Kurzfazit"-Abschnitt direkt nach dem Ziel-Abschnitt. Dieser ermöglicht schnelles Querlesen ohne den gesamten Vergleich zu lesen. Das Claude-VGL hat stattdessen einen "Ziel"-Abschnitt ohne Sofortzusammenfassung.

### Abschließendes Leitbild

Codex-VGL schließt mit einer klaren Leitlinie:

> "Damit bleibt der Alpha-Scope klein genug, testet aber genau den riskantesten und wichtigsten Teil: echte Browser-Bookmark-Synchronisation über Floccus."

Diese Formulierung ist prägnanter als der Claude-VGL-Abschluss und eignet sich gut als Leitlinie für das Projektteam.

### Betonung von `linksteward_sync_events` und weiteren Extension Tables

Codex-VGL listet im "Punkte nur in Codex"-Abschnitt explizit alle neun Extension Tables auf:

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

Das Claude-VGL führt diese Liste im gleichen Abschnitt, aber ohne `linksteward_sync_events` explizit zu nennen.

---

## 6. Punkte nur in der Claude-Vergleichsauswertung

Aspekte, die im Claude-VGL erscheinen, aber im Codex-VGL fehlen oder schwächer ausgearbeitet sind:

### Queue-System als eigener Widerspruch und Risiko

Das Claude-VGL macht den Queue-Fehler (Claude-Primäranalyse nennt "Bull") zu einem expliziten Widerspruch (W2) und zu einem eigenen Risiko (Risiko 3: "WICHTIG FÜR IMPLEMENTIERUNG"). Das Codex-VGL erwähnt es nur in den "Punkte nur in Codex"-Listen, ohne es als strukturellen Risikopunkt herauszuarbeiten. Für einen Leser ohne Vorwissen ist das Claude-VGL hier klarer.

### Explizite Prioritätsgruppen in der priorisierten Empfehlung

Das Claude-VGL gliedert die priorisierte Empfehlung in vier Prioritätsgruppen (Priorität 1: Vor Implementierung, Priorität 2: Erster Block, Priorität 3: Erster Sync-Test, Priorität 4: Post-Alpha). Das Codex-VGL hat eine flache Liste ohne Gruppierung. Die Struktur des Claude-VGL ist für Sprint-Planung direkt verwertbarer.

### Explizite Abhängigkeiten in der Issues-Liste

Das Claude-VGL notiert bei jedem Issue seine Abhängigkeiten:

```text
Issue 001: Abhängigkeit: Muss vor Issue 004 abgeschlossen sein.
Issue 002: Abhängigkeit: Blockiert Issues 006 und 007.
Issue 003: Abhängigkeit: Blockiert Issue 004.
```

Das Codex-VGL hat keine Abhängigkeitsnotation. Für die Reihenfolgeplanung ist das Claude-VGL direkt verwertbarer.

### Queue-System und Meilisearch als separate Offene-Fragen-Abschnitte

Das Claude-VGL hat für diese Themen eigene Unterabschnitte in "Offene Fragen". Das Codex-VGL führt sie als Teil von "Fork-Strategie" oder lässt Meilisearch-Fragen implizit.

### WAL-Modus-Frage

Claude-VGL stellt explizit: "WAL-Modus ist aktiviert – reicht das für parallele Linkwarden-Compat-API + Worker-Writes?" Diese Frage fehlt im Codex-VGL. Sie ist für die Implementierung der Compat-API relevant.

### Aufwandsschätzung als eigener Widerspruch (W5)

Claude-VGL behandelt die "400-600 Zeilen"-Schätzung als expliziten Widerspruch (Codex gibt keine Schätzung). Codex-VGL listet sie nur unter "nicht vollständig belastbar". Der Unterschied ist minimal, aber die explizite Benennung macht es sichtbarer.

---

## 7. Offene Fragen nach beiden Vergleichsauswertungen

Diese Fragen sind nach beiden Vergleichsdateien noch offen und brauchen explizite Entscheidungen:

### Vor der ersten Codeänderung zwingend zu klären:

```text
F1 – SQLite vs. PostgreSQL
     Architekturdokumentation korrigieren oder PostgreSQL-Ziel per ADR begründen.
     Entscheidung muss vor erster Migration stehen.

F2 – Soft Delete Semantik
     Restore-Workflow, Hard Delete (Papierkorb leeren), Filterung in KaraKeep-UI
     vs. nur Compat-API, Konfliktfälle bei gleichzeitigem Sync.

F3 – Floccus Linkwarden-API-Contract
     Welche Linkwarden-API-Version? Welche exakten Feldnamen, Statuscodes,
     Pagination-Parameter, Delete-Semantik? Wie erkennt Floccus existierende
     Einträge – via URL oder via Server-ID?

F4 – External Mappings Timing
     Soll linksteward_external_mappings bereits im ersten Sync befüllt werden,
     oder erst nach dem ersten Protokoll-Test?
```

### Vor dem ersten produktiven Alpha-Release:

```text
F5 – Verschachtelte Collections
     Wie werden KaraKeep bookmarkLists.parentId in Linkwarden-Responses gemappt?

F6 – Tags im ersten Sync
     Braucht Floccus Tags bereits im ersten Sync-Zyklus, oder reicht Collections + Links?

F7 – AI-Tags in Compat-API
     Ausblenden (sicherer) oder als read-only markieren (vollständiger)?

F8 – Linkwarden Delete-Semantik
     Reicht HTTP 204 für Floccus, oder gibt es ein Tombstone-/Conflict-Konzept?
```

### Strategisch (können iterativ entschieden werden):

```text
F9 – Fork-Strategie
     Aktiver Merge gegen KaraKeep-Upstream vs. stabiler Fork auf fixem Commit.
     Beeinflusst Branch-Struktur und Merge-Aufwand.

F10 – @karakeep/* Namespace
      Wann und in welchen Schritten wird auf @linksteward/* umgestellt?

F11 – Meilisearch Pflicht oder optional
      Alle Meilisearch-Suchpfade identifizieren; SQLite FTS5 als Alternative untersuchen.

F12 – Queue-Plugin-Implementierung
      Wie werden neue LinkSteward-Queues als Plugins nach queue-liteque-Muster implementiert?
      Gibt es eine Minimalvorlage im bestehenden Code?
```

---

## 8. Belastbarste Entscheidung für LinkSteward v0.1-alpha

Beide Vergleichsdateien konvergieren auf dieselbe Entscheidung. Das erhöht die Belastbarkeit gegenüber einer Einzelauswertung erheblich.

```text
Entscheidung (vierfach bestätigt: 2 Primäranalysen + 2 Vergleiche):

├─ KaraKeep bleibt technische Basis
├─ SQLite beibehalten (kein PostgreSQL-Umbau)
│   └─ Architekturdokumentation korrigieren
├─ @karakeep/* Namespace beibehalten
├─ Queue-System ist queue-liteque (SQLite-Plugin), NICHT Bull
├─ Extension Tables als erste Erweiterungsstrategie (Option A)
│   ├─ linksteward_item_extensions (inkl. deletedAt für Soft Delete)
│   └─ linksteward_external_mappings (für Floccus-ID-Tracking)
├─ Soft Delete NICHT als direkte bookmarks.deletedAt-Spalte für Alpha
├─ Linkwarden-kompatible API als erster Implementierungsblock
│   ├─ GET/POST/PATCH/DELETE /api/v1/collections
│   ├─ GET/POST/PATCH/DELETE /api/v1/links
│   └─ GET/POST /api/v1/tags (minimal)
├─ AI-Tags in Compat-API für Alpha ausblenden oder read-only
├─ Nicht-URL-Items aktiv in Compat-API filtern
└─ Floccus Linkwarden-Modus als erster Alpha-Test
   (Firefox + Chromium, realer Test vor Fertigstellung)

Wann gilt Alpha als erfolgreich:
├─ Floccus verbindet sich per Bearer-API-Key
├─ Browser-Ordner erscheinen als Collections
├─ Browser-Bookmarks erscheinen als Links
├─ Änderungen synchronisieren bidirektional
├─ Unerlaubte URLs erscheinen nicht in Floccus
└─ Löschungen verursachen keinen Datenverlust
```

---

## Finale priorisierte Empfehlung

### Priorität 1 – Entscheidungen (vor jeder Codeänderung)

```text
P1.1: ADR verfassen: SQLite vs. PostgreSQL
      → Architekturdokumentation auf SQLite-Basis korrigieren
      → PostgreSQL als explizit späteres Ziel oder gestrichen markieren

P1.2: Floccus Linkwarden-API-Contract verifizieren
      → Floccus-Quellcode oder manueller Test: Felder, Endpunkte, Delete, Server-ID-Konzept
      → Ohne das ist kein Compat-API-Design belastbar

P1.3: Soft Delete Semantik festlegen
      → Scope für v0.1-alpha: Nur Compat-API filtert, KaraKeep-UI unverändert
      → Delete/Restore/Hard-Delete-Definitionen dokumentieren
```

### Priorität 2 – Erster Implementierungsblock

```text
P2.1: Extension Tables Basisschema
      → linksteward_item_extensions (bookmarkId FK, deletedAt, normalizedUrl, urlHash, revision)
      → linksteward_external_mappings (provider, externalId, bookmarkId/listId/userId)
      → Drizzle-Migration erstellen

P2.2: Compatibility Mapper spezifizieren
      → bookmarkLists → collections
      → bookmarks (type=link) → links
      → URL-Filterliste (welche Schemata ausblenden)
      → AI-Tag-Handling für Alpha (ausblenden vs. read-only)

P2.3: Linkwarden Collections API implementieren
      → packages/api/routes/linksteward/collections.ts
      → GET/POST/PATCH/DELETE /api/v1/collections

P2.4: Linkwarden Links API implementieren
      → packages/api/routes/linksteward/links.ts
      → GET/POST/PATCH/DELETE /api/v1/links

P2.5: Tags-Minimal-Route prüfen
      → Reicht GET /api/v1/tags aus, oder braucht Floccus eigene Linkwarden-Tags-Route?
```

### Priorität 3 – Erster Sync-Test

```text
P3.1: Docker Compose Dev-Setup starten
P3.2: Floccus im Linkwarden-Modus verbinden
P3.3: Initialen Sync testen: Create, Update, Move, Delete
P3.4: Unerlaubte URLs testen (javascript:, data:, chrome:)
P3.5: Löschung testen: Soft Delete statt Hard Delete verifizieren
```

### Priorität 4 – Post-Alpha

```text
P4.1: Soft Delete Strategie re-evaluieren (direkte Spalte? Extension Table genug?)
P4.2: Meilisearch-Optionalität prüfen (alle Suchpfade identifizieren)
P4.3: Fork-/Upstream-Strategie entscheiden und dokumentieren
P4.4: @karakeep/* Namespace-Umbenennung planen
P4.5: Native LinkSteward API unter /api/linksteward/v1/* aufbauen
P4.6: Floccus KaraKeep-Modus untersuchen (erst nach Linkwarden-Modus stabil)
```

---

## Finale Entscheidungsvorlage: Extension Tables vs. direkte Schema-Erweiterung

### Option A: Nur Extension Tables – EMPFOHLEN FÜR v0.1-alpha

```text
Bestehend (unverändert):
├─ bookmarks
├─ bookmarkLinks
└─ alle anderen KaraKeep-Kerntabellen

Neu (additiv):
linksteward_item_extensions
├─ bookmarkId (FK → bookmarks.id, ON DELETE CASCADE)
├─ deletedAt (nullable)
├─ normalizedUrl (nullable)
├─ canonicalUrl (nullable)
├─ rootDomain (nullable)
├─ urlHash (nullable)
├─ revision (default 0)
└─ metadataJson (nullable)

linksteward_external_mappings
├─ id
├─ provider (floccus | linkwarden | browser_html)
├─ externalId
├─ bookmarkId (FK, nullable)
├─ listId (FK, nullable)
├─ userId (FK)
└─ metadataJson (nullable)
```

**Vorteile:**
- bookmarks und bookmarkLinks bleiben unverändert → geringes Upstream-Merge-Risiko
- KaraKeep-UI, Mobile, Extension, CLI verhalten sich unverändert (gelöschte Items sichtbar, für Alpha akzeptabel)
- LinkSteward-Semantik klar abgegrenzt
- Migrationen additiv, besser rückbaubar
- Passt zu ADR-002 (Erweiterungsschicht)

**Nachteile:**
- Zusätzliche Joins für Soft-Delete-Filter in Compat-API
- KaraKeep-UI zeigt gelöschte Items (für Alpha akzeptabel, Post-Alpha zu klären)
- Mehr Adapterlogik im Compatibility Mapper

**Entscheidung: Für v0.1-alpha wählen.**

---

### Option B: Direkte Schema-Erweiterung – NICHT FÜR v0.1-alpha

```text
bookmarks.deletedAt
bookmarkLinks.normalizedUrl
bookmarkLinks.urlHash
```

**Warum nicht für Alpha:**
- Berührt meistgenutzte KaraKeep-Tabelle
- Alle bestehenden Queries brauchen WHERE deletedAt IS NULL
- KaraKeep-Web, Mobile, Extension, CLI zeigen trotzdem gelöschte Items ohne Anpassung
- Höheres Upstream-Merge-Risiko
- Höherer Alpha-Scope

**Als Post-Alpha Review-Gate offenhalten.**

---

### Option C: Hybrid – ERST NACH ERSTEM SYNC-ZYKLUS EVALUIEREN

```text
bookmarks.deletedAt direkt + alle anderen Felder in Extension Tables
```

Vorteil: Soft Delete zentral. Nachteil: Berührt trotzdem die kritischste Kerntabelle, zu breiter Alpha-Scope.

---

### Review-Gate nach erstem Floccus-Sync

```text
Nach erstem erfolgreichen Sync evaluieren:
├─ Sind Joins für Soft-Delete-Filter in Compat-API zu komplex?
├─ Werden zu viele KaraKeep-Kernqueries manuell angepasst?
├─ Gibt es Performance-Probleme durch Extension-Table-Joins?
├─ Ist Upstream-Merge-Risiko durch direkte bookmarks.deletedAt vertretbar?
└─ Rechtfertigt das die Option B oder C?
```

---

## Finale Liste konkreter nächster Issues

Aus beiden Vergleichsdateien konsolidiert, mit Abhängigkeiten:

```text
Issue 001 – ADR: SQLite vs. PostgreSQL
Ziel: v0.1-alpha auf SQLite bestätigen; Architekturdokumentation korrigieren;
      PostgreSQL als Ziel-ADR verfassen oder streichen.
Abhängigkeit: Vor Issue 004. Parallel zu Issues 002 und 010.

Issue 002 – Floccus Linkwarden-API-Contract verifizieren
Ziel: Floccus-Quellcode oder Test: Endpunkte, Felder, Pagination, Delete-Semantik,
      Server-ID-Konzept, Tags-Anforderung im ersten Sync.
Abhängigkeit: Blockiert Issues 005, 006, 007, 008.

Issue 003 – Soft Delete Semantik festlegen
Ziel: Delete/Restore/Hard-Delete-Definitionen; Filterung nur in Compat-API (Alpha-Scope);
      KaraKeep-UI unverändert als explizite Alpha-Einschränkung dokumentieren.
Abhängigkeit: Blockiert Issue 004.

Issue 004 – Extension Tables Basisschema + Migration
Ziel: linksteward_item_extensions und linksteward_external_mappings als Drizzle-Tabellen.
      Drizzle-Migration erstellen.
Abhängigkeit: Issues 001 und 003.

Issue 005 – Compatibility Mapper spezifizieren
Ziel: Mapping-Regeln bookmarkLists → collections, bookmarks → links,
      URL-Filterliste, AI-Tag-Handling für Alpha.
Abhängigkeit: Issue 002.

Issue 006 – Linkwarden Collections API implementieren
Ziel: GET/POST/PATCH/DELETE /api/v1/collections als Adapter auf bookmarkLists.
Abhängigkeit: Issues 004 und 005.

Issue 007 – Linkwarden Links API implementieren
Ziel: GET/POST/PATCH/DELETE /api/v1/links als Adapter auf bookmarks/bookmarkLinks.
Abhängigkeit: Issues 004 und 005.

Issue 008 – Linkwarden Tags API prüfen
Ziel: Reicht bestehendes GET /api/v1/tags, oder braucht Floccus eigene Tags-Route?
Abhängigkeit: Issue 002.

Issue 009 – Floccus E2E-Testmatrix vorbereiten und durchführen
Ziel: Firefox + Chromium; Szenarien: Init-Sync, Create, Update, Move, Delete,
      Konflikt, Duplikat, unerlaubte URLs.
Abhängigkeit: Issues 006 und 007.

Issue 010 – Upstream-Fork-Strategie entscheiden
Ziel: Aktiver Merge vs. stabiler Fork. Branch-Struktur und Merge-Policy festlegen.
Abhängigkeit: Keine (parallel zu allen anderen).

Issue 011 – Finale KaraKeep-Analyse konsolidieren
Ziel: karakeep-analysis-v0.1.md aus Codex- und Claude-Primäranalyse zusammenführen.
      Queue-Fehler korrigieren. Widersprüche auflösen.
Abhängigkeit: Issues 001-010.
```

---

## Punkte für die finale `karakeep-analysis-v0.1.md`

### Aus der Codex-Primäranalyse übernehmen

```text
Explizite Empfehlung "Extension Tables zuerst" mit Begründung
Linkwarden-Floccus-Sync als kleinstes technisches Alpha-Feature
Trennung Native LinkSteward API (/api/linksteward/v1/*) und Compat-APIs
packages/api, packages/trpc, packages/db als Andockpunkte
Liste der 9 Extension Tables (inkl. linksteward_sync_events)
Risiko: Auto-Tagging destabilisiert Floccus-Sync
Risiko: Nicht-URL-Items müssen aktiv gefiltert werden
packages/shared/types/* als Risiko-Änderungsbereich
AGPL-3.0/Fork-Kommunikation als Langzeitrisiko
Revision/Sync-Clock als fehlende Synchronisations-Felder
queue-liteque + queue-restate als korrektes Queue-System (nicht Bull)
packages/plugins/ als wichtiger Strukturpunkt
apiKeys.exchange als vorhandene Erweiterung des API-Key-Systems
```

### Aus der Claude-Primäranalyse übernehmen

```text
PostgreSQL vs. SQLite Dokumentationswiderspruch als explizites Architekturrisiko
Package-Namespace @karakeep/* als Fork-Risiko (>500 Stellen)
AIO-Container als Skalierungsgrenze
Stack-Details: Next.js 15, Hono, tRPC, Drizzle, better-sqlite3, Meilisearch, s6-overlay
Auth-Details: NextAuth.js, bcrypt 10 Runden, OIDC, OAuth-Accounts, ak1-Legacy-Format
SSRF-Schutz via network.ts (DNS-Resolver, private IP-Blocking, Allowlist)
Crawl-Defaults (Screenshot=true, Banner=true, PDF=false, FullPageArchive=false)
S3-kompatible Asset-Storage als vorhandene Option
OCR als konfigurierbares Feature (OCR_LANGS, OCR_USE_LLM)
FeedRefreshingWorker und BackupSchedulingWorker als Timer-Loops (nicht Queue-Consumer)
Import-Worker-Metriken (Prometheus)
Stripe/Subscriptions als Self-Hosting-Ballast (kein MVP-Blocker)
Meilisearch-Optionalität als offene Frage (Suchpfade prüfen)
Upstream-Merge-Strategie als explizite Entscheidungsfrage
SQLite WAL-Modus aktiviert (Hinweis für parallele Writes)
listCollaborators und listInvitations (geteilte Listen-Feature)
bookmarkTags.normalizedName als GENERATED COLUMN
```

### Korrekturen gegenüber Claude-Primäranalyse

```text
KORREKTUR: Queue-System ist NICHT Bull-basiert.
           Es ist queue-liteque (SQLite-Plugin, DATA_DIR/queue.db)
           plus queue-restate (Restate-Alternative).
           Neue LinkSteward-Queues müssen als Plugins nach
           queue-liteque-Muster implementiert werden.
```

### Nicht ungeprüft übernehmen

```text
Aufwandsschätzung 400-600 Zeilen → nur Hypothese, keine Planungsgrundlage
bookmarks.deletedAt sofort einbauen → für Alpha-Scope zu früh
Floccus KaraKeep-Modus direkt nutzbar → erst nach Protokolltest bestätigen
Meilisearch optional für v0.1-alpha → erst nach Prüfung aller Suchpfade
Konkrete Dateiänderungsreihenfolge mit Migration → erst nach Implementierungs-ADR
```

### Empfohlene Struktur

```text
1. Kurzfazit (inkl. Queue-System Korrektur)
2. Repository-Struktur und Stack
3. Datenbankmodell (Ist-Zustand KaraKeep)
4. Abgleich LinkSteward-Zieldatenmodell (inkl. PostgreSQL-Widerspruch)
5. API-Architektur und Auth
6. Worker-System und Queues (queue-liteque explizit, Timer-Loops explizit)
7. Archivierung und Crawling (inkl. Crawl-Defaults, S3, OCR)
8. Import/Export
9. AI/Ollama/OCR
10. Docker/Deployment (inkl. AIO-Skalierungsgrenze)
11. Floccus/Linkwarden-Kompatibilität
12. Erweiterungsstrategie (Extension Tables – begründet, alle 9 Tabellen)
13. Risiken (priorisiert, 7 Risiken)
14. Offene Entscheidungen für v0.1-alpha
15. Konkrete nächste Issues (mit Abhängigkeiten)
```

---

## Punkte, die vor der ersten Codeänderung manuell geprüft werden sollten

Diese Punkte sind aus den vorliegenden Vergleichsdateien nicht ableitbar und erfordern externe Verifikation:

```text
MANUELL ZU PRÜFEN:

M1 – Floccus Linkwarden-Modus: exakte API-Erwartungen
     Quelle: Floccus-Quellcode (GitHub) oder manueller Testlauf
     Frage: Feldnamen, Pagination, Delete-Semantik, Server-ID-Konzept,
            Tombstone-Konzept, Verhalten bei unerlaubten URLs

M2 – Floccus Server-ID-Konzept
     Frage: Erkennt Floccus existierende Bookmarks via URL oder via Server-ID?
     Konsequenz: Beeinflusst Design von linksteward_external_mappings

M3 – Linkwarden-API-Version
     Quelle: Linkwarden-Dokumentation oder Floccus-Konfigurationsoptionen
     Frage: Welche Linkwarden-API-Version implementiert Floccus?
            v1? v2? Eigene Floccus-Erweiterungen?

M4 – Meilisearch-Abhängigkeiten im Code
     Quelle: grep/rg im Repository nach Meilisearch-Imports
     Frage: Welche Codepfade sind zwingend auf Meilisearch angewiesen?
            Schlägt der App-Start ohne Meilisearch fehl?

M5 – queue-liteque Plugin-Implementierungsmuster
     Quelle: packages/plugins/queue-liteque im Repository
     Frage: Wie wird ein neues Plugin nach diesem Muster implementiert?
            Gibt es einen minimalen Beispiel-Code als Vorlage?

M6 – WAL-Modus und parallele Writes
     Quelle: Lokaler Lasttest oder SQLite-Dokumentation
     Frage: Kann SQLite mit WAL parallele Writes von
            Linkwarden-Compat-API + Worker-Jobs ohne Locks handeln?

M7 – linksteward_external_mappings Timing
     Quelle: Floccus-Protokollverständnis aus M1 und M2
     Frage: Muss die Mapping-Tabelle schon im ersten Sync befüllt werden,
            oder erst nach Protokoll-Verifikation?
```

---

## Einschätzung zur Codex-Vergleichsdatei

Falls die Codex-Vergleichsdatei (`karakeep-analysis-comparison-codex-v0.1.md`) später als zusätzliche Vergleichsebene hinzugezogen wird:

**Würde ich ihr zustimmen?**

Ja, im Wesentlichen vollständig.

**Begründung:**

- Die Kernaustagen (Extension Tables, SQLite für Alpha, Linkwarden-Modus als erster Slice, Floccus früh testen) sind korrekt und belastbar.
- Die Risikopriorisierung ist sinnvoll und vollständig.
- Die Übernahmeempfehlung für die finale Analyse ist zutreffend.
- Die Schlussentscheidung ist klar formuliert und umsetzbar.

**Einzige Einschränkung:**

Das Codex-VGL macht den Queue-System-Fehler (Claude-Analyse nennt "Bull") strukturell weniger sichtbar, als es für einen neuen Leser ideal wäre. Es steht nur in der "Punkte nur in Codex"-Liste, nicht als eigenes Risiko oder Widerspruch. Das könnte bei flüchtigem Lesen übersehen werden.

**Konsequenz:**

Für die finale `karakeep-analysis-v0.1.md` sollte die Queue-Korrektur als expliziter Hinweis erscheinen (nicht nur in einer Listzeile), damit kein Implementierer mit der falschen Annahme eines Bull-Systems arbeitet.

**Fazit:** Das Codex-VGL ist eine solide Vergleichsauswertung. Das Claude-VGL fügt Strukturierung, Abhängigkeitsnotation und die Queue-Widerspruch-Hervorhebung hinzu, ohne inhaltlich zu widersprechen. Beide zusammen konsolidieren gut zum vorliegenden Ergebnisdokument.

---

## Schlusswort

Beide Vergleichsdokumente führen zur selben Entscheidung. Die Konvergenz über vier unabhängige Analyse-Ebenen (2 Primäranalysen, 2 Vergleiche) gibt dem folgenden Kern-Entscheid hohe Belastbarkeit:

```text
LinkSteward v0.1-alpha = Floccus erster Sync im Linkwarden-Modus.
Basis: KaraKeep unverändert + zwei additive Extension Tables.
Maß für Erfolg: Echter Bookmark-Sync funktioniert bidirektional.
Alles andere ist Post-Alpha.
```
