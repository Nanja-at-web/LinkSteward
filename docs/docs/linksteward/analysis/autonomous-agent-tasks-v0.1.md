# LinkSteward – Autonome Agent-Aufgaben v0.1

> Erstellt: 2026-05-15
> Grundlage: AGENTS.md, karakeep-analysis-v0.1.md, linkwarden-compat-implementation-plan (Analysis),
>   adr/016-sqlite-for-alpha.md, adr/017-soft-delete-alpha-extension-table.md,
>   adr/018-linkwarden-floccus-alpha-slice.md
>
> Zweck: Aufgaben, die ein Coding-Agent (Claude Code, Codex) eigenständig ausführen kann,
>   ohne menschliche Rückmeldung, manuelle Tests oder fachliche Freigabe.
>
> Nicht enthalten: Aufgaben mit Browser-Test, Floccus-Test, Auth-Änderung,
>   POST/PATCH/DELETE-Endpunkten, Migrations, Löschlogik oder unklarer Korrektheit.
>
> Repo-Stand geprüft: 2026-05-15
> - packages/api/routes/linkwarden/collections.ts – ✅ existiert
> - packages/api/routes/linkwarden/links.ts       – ❌ existiert nicht (GET /api/v1/links nicht aktiv)

---

## Verbindliche Arbeitsregel für autonome Agenten

Diese Regeln gelten für **jede** Aufgabe in diesem Dokument. Sie ergänzen AGENTS.md § Commit Discipline.

### Vor dem Start

```
git status
```

Stelle sicher, dass der Working Tree sauber ist (keine uncommitted changes). Wenn nicht sauber:
**Stoppen und melden** – nicht blind weitermachen.

### Während der Arbeit

- Ändere **ausschließlich** die Dateien, die in der Aufgabe unter „Erlaubte Dateien" oder
  „Betroffene Dateien" aufgelistet sind.
- Wenn du merkst, dass eine weitere Datei geändert werden müsste, die nicht in der Liste steht:
  **Stoppen und melden** – nicht still zusätzliche Dateien anfassen.

### Vor dem Commit

```
git status
git diff --stat
git diff
```

- Prüfe ob **ausschließlich** die erwarteten Dateien verändert sind.
- Wenn unerwartete Dateien in `git diff` auftauchen: **Stoppen und melden.**
- Führe die für die Aufgabe vorgeschriebenen Checks aus (typecheck, lint). Wenn ein Check
  fehlschlägt: Fix first, dann erneut prüfen. Nicht committen solange Checks rot sind.

### Commit

```
git add <nur-die-aufgaben-relevanten-dateien>
git commit -m "<aufgabe>: <was geändert>"
```

- Ein Commit pro Aufgabe. Nicht mehrere Tasks zusammenfassen.
- Commit-Message beginnt mit Task-ID, z.B. `TASK-01: architecture-v0.1.md – PostgreSQL durch SQLite ersetzt`

### Nach dem Commit

```
git status
```

Bestätige dass der Working Tree sauber ist.

---

## Gruppe 1 – Sehr sicher: Dokumentationskorrekturen (kein Code)

---

### TASK-01: architecture-v0.1.md – PostgreSQL durch SQLite ersetzen

**Ziel:**
Die Architekturdokumentation enthält PostgreSQL/postgres-Referenzen. Das widerspricht dem
Ist-Zustand (SQLite) und ADR-016. Die Datei muss den tatsächlichen Stand widerspiegeln.

**Warum autonom möglich:**
ADR-016 ("SQLite for v0.1-alpha") und karakeep-analysis-v0.1.md Abschnitt 5 dokumentieren
die Entscheidung eindeutig. Die Korrektur ist rein faktisch, kein Ermessensspielraum.

**Voraussetzung:** Keine. Working Tree muss sauber sein.

**Betroffene Dateien:**
- `docs/docs/linksteward/architecture/architecture-v0.1.md`

**Erlaubte Änderungen:** Ausschließlich die oben genannte Datei.
**Verboten:** Jede andere Datei, kein Code, keine Configs.

**Risiko:** niedrig
**Code geändert:** nein
**Tests automatisch ausführbar:** nein (Dokumentation)

**Umsetzungsprompt:**
```
Lies docs/docs/linksteward/architecture/architecture-v0.1.md.
Lies docs/docs/linksteward/adr/016-sqlite-for-alpha.md zur Entscheidungsgrundlage.

Ersetze in architecture-v0.1.md:
- In der Systemübersicht: "├─ PostgreSQL" → "├─ SQLite"
- In den Docker Services: "├─ postgres" → (Zeile entfernen, SQLite braucht keinen eigenen Service)

Füge nach der Systemübersicht einen Hinweis ein:
  "Datenbank: SQLite (better-sqlite3, WAL-Modus). Kein PostgreSQL in v0.1-alpha. Siehe ADR-016."

Ändere keine anderen Zeilen. Kein Code, keine anderen Dateien.
Führe danach keine Build-Befehle aus.

Prüfe vor dem Commit mit `git diff` ob ausschließlich diese eine Dokumentationsdatei verändert wurde.
Wenn weitere Dateien geändert sind: Stoppen und melden.
```

---

### TASK-02: data-model-v0.1.md – Status-Hinweis als Zukunftsmodell ergänzen

**Ziel:**
`data-model-v0.1.md` beschreibt ein Zielmodell (items, normalized_url, url_hash, deleted_at, …),
das nicht dem aktuellen KaraKeep-Schema entspricht. Es fehlt ein expliziter Hinweis, dass dies
ein Ziel-Datenmodell ist, nicht der implementierte Ist-Stand.

**Warum autonom möglich:**
Das aktuelle Schema ist in `packages/db/schema.ts` ablesbar. Die Diskrepanz ist durch
karakeep-analysis-v0.1.md Abschnitt 4 ("Fehlende LinkSteward-Felder") belegt.
Der Hinweis ist additiv, ändert keine Inhalte.

**Voraussetzung:** Keine. Working Tree muss sauber sein.

**Betroffene Dateien:**
- `docs/docs/linksteward/architecture/data-model-v0.1.md`

**Erlaubte Änderungen:** Ausschließlich die oben genannte Datei.
**Verboten:** Jede andere Datei.

**Risiko:** niedrig
**Code geändert:** nein
**Tests automatisch ausführbar:** nein

**Umsetzungsprompt:**
```
Lies docs/docs/linksteward/architecture/data-model-v0.1.md.
Lies packages/db/schema.ts (erste 300 Zeilen) zum Vergleich mit dem Ist-Stand.

Füge direkt unter der ersten Überschrift ("# LinkSteward – Datenmodell / Datenbankschema v0.1")
folgenden Absatz ein:

> **Status (v0.1-alpha):** Dieses Dokument beschreibt das angestrebte Zieldatenmodell für LinkSteward.
> Es entspricht nicht dem aktuellen Ist-Stand. Die technische Basis ist KaraKeep (packages/db/schema.ts).
> Für v0.1-alpha werden nur additive Extension Tables eingeführt (linksteward_item_extensions,
> linksteward_external_mappings). Felder wie normalized_url, url_hash, deleted_at auf items-Ebene,
> duplicate_groups und link_health_checks sind Post-Alpha. Siehe karakeep-analysis-v0.1.md Abschnitt 4
> und ADR-016/ADR-017.

Ändere keine anderen Zeilen. Kein Code, keine anderen Dateien.

Prüfe vor dem Commit mit `git diff` ob ausschließlich diese eine Dokumentationsdatei verändert wurde.
Wenn weitere Dateien geändert sind: Stoppen und melden.
```

---

### TASK-03: linkwarden-analysis-v0.1.md – Offene Fragen mit Stand aktualisieren

**Ziel:**
`linkwarden-analysis-v0.1.md` enthält vier "Offene Fragen", die teilweise durch den aktuellen
Implementierungsstand beantwortet wurden. Der Stand soll eingetragen werden.

**Warum autonom möglich:**
Die Antworten sind aus bestehenden Dokumenten ableitbar:
- Implementierungsentscheidungen: linkwarden-compat-implementation-plan (in Analysis),
  adr/018, AGENTS.md
- Implementierter Stand: packages/api/routes/linkwarden/collections.ts (GET /api/v1/collections)
- GET /api/v1/links ist noch **nicht implementiert** (links.ts existiert nicht, 2026-05-15)
- Offene Teile (Floccus-Test) sind klar als noch offen erkennbar.

**Voraussetzung:** Keine. Working Tree muss sauber sein.

**Betroffene Dateien:**
- `docs/docs/linksteward/analysis/linkwarden-analysis-v0.1.md`

**Erlaubte Änderungen:** Ausschließlich die oben genannte Datei.
**Verboten:** Jede andere Datei.

**Risiko:** niedrig
**Code geändert:** nein
**Tests automatisch ausführbar:** nein

**Umsetzungsprompt:**
```
Lies docs/docs/linksteward/analysis/linkwarden-analysis-v0.1.md.
Lies docs/docs/linksteward/adr/018-linkwarden-floccus-alpha-slice.md.
Lies packages/api/routes/linkwarden/collections.ts.
Prüfe ob packages/api/routes/linkwarden/links.ts existiert.
Lies docs/docs/linksteward/testing/floccus-sync-results-v0.1.md.

WICHTIG: links.ts existiert möglicherweise nicht. Prüfe das zuerst und passe den
"Implementierter Alpha-Stand" entsprechend an.

Ersetze den Abschnitt "## Offene Fragen" mit einem aktualisierten Stand.
Format: für jede Frage den Stand (beantwortet / teilweise / noch offen) und eine kurze Begründung.

Faktengrundlage:
1. "Wie exakt muss Linkwarden API für Floccus nachgebildet werden?"
   → Noch offen. Braucht echten Floccus-Linkwarden-Modus-Test.
     GET /collections ist implementiert, Response-Contract noch nicht gegen Floccus verifiziert.

2. "Welche Felder erwartet Floccus tatsächlich?"
   → Noch offen. Implementierter Minimalansatz für collections: id, name, parentId.
     Verifizierung steht aus.

3. "Wie werden Tags/Collections gemappt?"
   → Teilweise entschieden: nur manuelle Listen als Collections (kein Smart-List-Export).
     AI-Tag-Filterung (attachedBy="human") ist als Anforderung festgelegt, aber noch nicht
     implementiert (links.ts fehlt). Verifizierung mit Floccus steht aus.

4. "Welche Linkwarden-Exportformate sollen importiert werden?"
   → Noch offen. Sprint 5 (Import/Export). Kein Alpha-Thema.

Füge unter den Offene-Fragen-Abschnitt einen neuen Abschnitt "## Implementierter Alpha-Stand" ein:
- GET /api/v1/collections (read-only, manuelle Listen) – implementiert
- GET /api/v1/links – noch nicht implementiert (links.ts fehlt, Stand 2026-05-15)

Ändere sonst nichts am Dokument.

Prüfe vor dem Commit mit `git diff` ob ausschließlich diese eine Dokumentationsdatei verändert wurde.
Wenn weitere Dateien geändert sind: Stoppen und melden.
```

---

### TASK-04: floccus-compatibility-analysis-v0.1.md – KaraKeep-Modus-Ergebnis ergänzen

**Ziel:**
`floccus-compatibility-analysis-v0.1.md` enthält eine Testmatrix, aber keine Testergebnisse.
Das bestätigte KaraKeep-Modus-Ergebnis (2026-05-14) soll ergänzt werden.

**Warum autonom möglich:**
Das Ergebnis ist in `testing/floccus-sync-results-v0.1.md` vollständig dokumentiert.
Es geht nur darum, den Querverweis einzutragen.

**Voraussetzung:** Keine. Working Tree muss sauber sein.

**Betroffene Dateien:**
- `docs/docs/linksteward/analysis/floccus-compatibility-analysis-v0.1.md`

**Erlaubte Änderungen:** Ausschließlich die oben genannte Datei.
**Verboten:** Jede andere Datei.

**Risiko:** niedrig
**Code geändert:** nein
**Tests automatisch ausführbar:** nein

**Umsetzungsprompt:**
```
Lies docs/docs/linksteward/analysis/floccus-compatibility-analysis-v0.1.md.
Lies docs/docs/linksteward/testing/floccus-sync-results-v0.1.md.

Füge am Ende der Datei einen neuen Abschnitt ein:

## Testergebnisse v0.1-alpha

### KaraKeep-Modus (2026-05-14)
- Floccus v5.8.6, Firefox Desktop
- Status: ✅ Verbindung und Basis-Sync bestätigt ("Alles gut")
- Details: docs/docs/linksteward/testing/floccus-sync-results-v0.1.md
- Intensiver Test (bidirektional, Konflikt, große Datensätze) steht aus.

### Linkwarden-Modus
- Status: ⬜ Noch nicht getestet
- GET /api/v1/collections ist implementiert.
- GET /api/v1/links ist noch nicht implementiert (links.ts fehlt, Stand 2026-05-15).
- Floccus-Verbindungstest steht aus.

Ändere sonst nichts am Dokument.

Prüfe vor dem Commit mit `git diff` ob ausschließlich diese eine Dokumentationsdatei verändert wurde.
Wenn weitere Dateien geändert sind: Stoppen und melden.
```

---

## Gruppe 2 – Tests für bestehende read-only Endpunkte

> **Empfohlener nächster autonomer Schritt: TASK-05**

---

### TASK-05: E2E-Test für GET /api/v1/collections schreiben

**Ziel:**
Die Route `GET /api/v1/collections` hat keinen automatisierten Test.
Das linkwarden-compat-implementation-plan-Dokument (Abschnitt 8) nennt diesen Test explizit
als Akzeptanzkriterium für Issue 2.

**Warum autonom möglich:**
- Bestehende E2E-Tests (z.B. lists.test.ts, tags.test.ts) zeigen das Muster exakt.
- Die Route ist read-only, hat bekannte Logik (nur manuelle Listen, kein Smart-List-Export).
- Testfälle sind im compat-plan Abschnitt 8 spezifiziert.
- Kein SDK nötig: raw fetch gegen /api/v1/collections (Route ist nicht im OpenAPI-Spec).
- Kein Floccus, kein Browser, kein manueller Schritt.

**Voraussetzung:**
- `packages/api/routes/linkwarden/collections.ts` existiert – ✅ bestätigt (2026-05-15)
- Working Tree muss sauber sein (git status prüfen)

**Betroffene Dateien:**
- `packages/e2e_tests/tests/api/linkwarden-collections.test.ts` (neu)

**Erlaubte Änderungen:**
- Neue Datei `packages/e2e_tests/tests/api/linkwarden-collections.test.ts` erstellen
**Verboten:** Alle anderen Dateien. Kein neues Package, keine neuen Dependencies,
kein Anfassen von collections.ts, package.json, pnpm-lock.yaml.

**Risiko:** niedrig
**Code geändert:** ja (neue Testdatei)
**Tests automatisch ausführbar:** ja – `pnpm --filter @karakeep/e2e_tests typecheck` und `pnpm test`

**Umsetzungsprompt:**
```
Lies packages/e2e_tests/tests/api/lists.test.ts als Vorlage für den Testaufbau.
Lies packages/e2e_tests/utils/api.ts für createTestUser().
Lies packages/api/routes/linkwarden/collections.ts für die Route-Logik.

Erstelle packages/e2e_tests/tests/api/linkwarden-collections.test.ts.

Nutze raw fetch (nicht den KaraKeep SDK – die Route ist nicht im OpenAPI-Spec).
URL-Muster: http://localhost:${port}/api/v1/collections

Testfälle:
1. Ohne Auth-Header → 401
2. Mit gültigem Bearer API-Key → 200, Body hat Property "collections" als Array
3. Zwei manuelle Listen erstellen (via SDK oder tRPC-Client), GET /collections aufrufen
   → beide Listen erscheinen in "collections"
4. Eine Smart-Liste erstellen, GET /collections aufrufen
   → Smart-Liste erscheint NICHT in "collections"
5. Jedes Element in "collections" hat mindestens: id (string), name (string)
6. parentId ist vorhanden (null oder string, kein undefined)

Verwende beforeEach mit createTestUser() wie in lists.test.ts.
Kein neues Package, keine neuen Dependencies.

Führe nach dem Schreiben aus:
  pnpm --filter @karakeep/e2e_tests typecheck

Wenn typecheck grün:
  git status           → darf nur die neue Testdatei zeigen
  git diff --stat      → nur die neue Testdatei
  Wenn andere Dateien geändert: Stoppen und melden.
  Dann committen.
```

---

## Gruppe 3 – Code-Kommentare (bestehende Endpunkte)

---

### TASK-08: Kommentar in collections.ts aktualisieren

**Ziel:**
Der Kommentar in `collections.ts` sagt: "response contract still needs verification
against a real client." Das ist korrekt, aber unpräzise. Er soll auf das zugehörige
Testergebnis-Dokument zeigen und klarer formuliert werden.

**Warum autonom möglich:**
Nur ein Kommentar wird aktualisiert. Der Inhalt ist durch floccus-sync-results-v0.1.md
und den aktuellen Projektstand eindeutig bestimmbar.

**Voraussetzung:**
- `packages/api/routes/linkwarden/collections.ts` existiert – ✅ bestätigt (2026-05-15)
- Working Tree muss sauber sein (git status prüfen)

**Betroffene Dateien:**
- `packages/api/routes/linkwarden/collections.ts`

**Erlaubte Änderungen:** Ausschließlich den beschriebenen Kommentar in collections.ts.
**Verboten:** Logik-Änderungen, Imports, andere Dateien.

**Risiko:** niedrig
**Code geändert:** ja (Kommentar)
**Tests automatisch ausführbar:** ja – `pnpm --filter @karakeep/api typecheck`

**Umsetzungsprompt:**
```
Lies packages/api/routes/linkwarden/collections.ts.
Lies docs/docs/linksteward/testing/floccus-sync-results-v0.1.md.

Ersetze den Kommentar:
  // Alpha-minimal Linkwarden-compatible shape. The exact Floccus/Linkwarden
  // response contract still needs verification against a real client.

Durch:
  // Alpha-minimal Linkwarden-compatible shape.
  // Fields id, name, parentId chosen based on known Linkwarden API structure.
  // Response contract not yet verified against Floccus in Linkwarden mode.
  // See docs/docs/linksteward/testing/floccus-sync-results-v0.1.md

Ändere nichts anderes.

Führe aus:
  pnpm --filter @karakeep/api typecheck

Wenn typecheck grün:
  git status      → darf nur collections.ts zeigen
  git diff        → nur den Kommentar-Swap
  Wenn andere Dateien geändert: Stoppen und melden.
  Dann committen.
```

---

## Gruppe 4 – Möglich, aber besser zuerst reviewed

---

### TASK-10: architecture-v0.1.md um Linkwarden-Compat-Schicht ergänzen

**Ziel:**
Die Systemübersicht in `architecture-v0.1.md` zeigt drei API-Schichten (Native, Linkwarden,
KaraKeep), aber listet keine konkreten implementierten Endpunkte. Eine kurze
Ergänzung mit dem aktuellen Stand (GET /collections) und Link zur api-spec
würde die Übersicht aktuell halten.

**Warum nur mit Review:**
- Die Systemübersicht ist bereits korrekt in der Struktur.
- Es gibt Überlappung mit api-spec-v0.1.md – das Risiko von widersprüchlichen Dokumenten
  ist real, wenn der Stand sich ändert.
- Besser nach dem ersten Floccus-Test, wenn klar ist welche Endpunkte stabil sind.

**Voraussetzung:**
- TASK-01 (PostgreSQL-Fix) muss vorher abgeschlossen sein.
- Working Tree muss sauber sein.

**Betroffene Dateien:**
- `docs/docs/linksteward/architecture/architecture-v0.1.md`

**Erlaubte Änderungen:** Ausschließlich die oben genannte Datei.
**Verboten:** Jede andere Datei.

**Risiko:** niedrig
**Code geändert:** nein
**Tests automatisch ausführbar:** nein

**Umsetzungsprompt:**
```
Lies docs/docs/linksteward/architecture/architecture-v0.1.md (nach TASK-01 korrekt).
Lies docs/docs/linksteward/architecture/api-spec-v0.1.md für den vollständigen Endpunkte-Katalog.

Prüfe welche linkwarden-Routen aktuell implementiert sind:
- packages/api/routes/linkwarden/collections.ts vorhanden? → GET /api/v1/collections implementiert
- packages/api/routes/linkwarden/links.ts vorhanden? → GET /api/v1/links implementiert
Passe die Liste unten an den tatsächlichen Stand an.

Füge nach der Systemübersicht einen Abschnitt "## Implementierungsstand v0.1-alpha" ein:

  Linkwarden Compatibility API (implementiert):
  - GET /api/v1/collections  (read-only, manuelle Listen)

  Linkwarden Compatibility API (ausstehend):
  - GET /api/v1/links         (read-only, Link-Bookmarks – links.ts noch nicht erstellt)
  - POST/PATCH/DELETE /api/v1/collections
  - POST/PATCH/DELETE /api/v1/links

  Vollständiger Endpunkte-Katalog: docs/docs/linksteward/architecture/api-spec-v0.1.md

Ändere sonst nichts.

Prüfe vor dem Commit mit `git diff` ob ausschließlich diese eine Dokumentationsdatei verändert wurde.
Wenn weitere Dateien geändert sind: Stoppen und melden.
```

---

## Später autonom ausführbar – nach GET /api/v1/links

> Diese Aufgaben setzen voraus, dass `packages/api/routes/linkwarden/links.ts` existiert
> und die Route in `packages/api/index.ts` unter `.route("/links", linkwardenLinks)` registriert ist.
>
> Stand 2026-05-15: links.ts existiert **nicht**. Diese Tasks sind gesperrt bis die Datei
> erstellt und in index.ts eingetragen wurde.

---

### TASK-06: E2E-Test für GET /api/v1/links schreiben

**Ziel:**
Die Route `GET /api/v1/links` hat keinen automatisierten Test.
Sie hat mehr Filterlogik als collections (Typ-Filter, AI-Tag-Filter, URL-Schema-Filter,
Pagination) – das macht automatisierte Tests besonders wertvoll.

**Warum autonom möglich (sobald Voraussetzung erfüllt):**
- Alle Filterregeln sind im Code (`links.ts`) und in AGENTS.md klar definiert.
- Text- und Asset-Bookmarks lassen sich mit dem SDK erstellen und der Ausschluss testbar machen.
- AI-Tag-Filterung ist durch `attachedBy` steuerbar.
- Pagination mit `?page=0` ist rein serverseitige Logik.
- Die URL-Schema-Filter-Testfälle mit `data:` oder `chrome:` URLs sind deterministisch.
- Kein Browser, kein Floccus, kein manueller Schritt.

**Voraussetzung:**
- `packages/api/routes/linkwarden/links.ts` muss existieren – ❌ fehlt (Stand 2026-05-15)
- Route muss in packages/api/index.ts registriert sein
- Working Tree muss sauber sein

**Betroffene Dateien:**
- `packages/e2e_tests/tests/api/linkwarden-links.test.ts` (neu)

**Erlaubte Änderungen:** Ausschließlich die neue Testdatei.
**Verboten:** Alle anderen Dateien. Kein neues Package, keine neuen Dependencies.

**Risiko:** niedrig (sobald Voraussetzung erfüllt)
**Code geändert:** ja (neue Testdatei)
**Tests automatisch ausführbar:** ja – `pnpm --filter @karakeep/e2e_tests typecheck` und `pnpm test`

**Umsetzungsprompt:**
```
Prüfe zuerst: existiert packages/api/routes/linkwarden/links.ts?
Wenn nein: Aufgabe abbrechen und melden.

Lies packages/e2e_tests/tests/api/bookmarks.test.ts als Vorlage.
Lies packages/e2e_tests/utils/api.ts für createTestUser().
Lies packages/api/routes/linkwarden/links.ts vollständig für die Route-Logik.
Lies AGENTS.md für die gültigen Filterregeln.

Erstelle packages/e2e_tests/tests/api/linkwarden-links.test.ts.

Nutze raw fetch (nicht den KaraKeep SDK).
URL-Muster: http://localhost:${port}/api/v1/links

Testfälle:
1. Ohne Auth-Header → 401
2. Mit gültigem Bearer API-Key, keine Bookmarks → 200, { response: [], nextPage: null }
3. Ein Link-Bookmark erstellen (type: "link") → erscheint in response
4. Ein Text-Bookmark erstellen (type: "text") → erscheint NICHT in response
5. response-Elemente haben mindestens: id, name, url, tags (Array), createdAt, updatedAt
6. collection ist null oder { id, name }
7. Tags: Bookmark mit human-Tag erstellen → Tag erscheint in response.tags
8. Pagination: Mehr als 20 Link-Bookmarks erstellen → nextPage ist nicht null bei page=0,
   page=1 liefert weitere Bookmarks
9. collectionId-Filter: Liste erstellen, Bookmark der Liste zuordnen,
   GET /links?collectionId=<listId> → nur dieser Bookmark erscheint
10. URL-Schema-Filter: Bookmark mit URL "data:text/plain,test" erstellen
    → erscheint NICHT in response (ausgefiltertes Schema)
11. Kein AI-Tag: Bookmark mit tagsOnBookmarks.attachedBy="ai" (via direkte DB oder
    über tRPC-Caller wenn verfügbar) → AI-Tag erscheint NICHT in response.tags

Nutze beforeEach mit createTestUser().
Kein neues Package, keine neuen Dependencies.

Führe nach dem Schreiben aus:
  pnpm --filter @karakeep/e2e_tests typecheck

Wenn typecheck grün:
  git status      → darf nur die neue Testdatei zeigen
  git diff --stat → nur die neue Testdatei
  Wenn andere Dateien geändert: Stoppen und melden.
  Dann committen.
```

---

### TASK-07: Erklärungskommentar in links.ts ergänzen

**Ziel:**
`packages/api/routes/linkwarden/links.ts` enthält komplexe CTE-Logik und einen
URL-Schema-Filter. Diese sind ohne Kontext schwer nachvollziehbar. Ein kurzer Kommentar
pro Block verbessert die Lesbarkeit für zukünftige Agents und Reviewer.

**Warum autonom möglich (sobald Voraussetzung erfüllt):**
Reine Kommentar-Ergänzung, kein Logik-Change. Korrektheit ist durch den bestehenden Code
und die Entscheidungsdokumente klar. AGENTS.md erlaubt Kommentare wenn das WHY
nicht offensichtlich ist.

**Voraussetzung:**
- `packages/api/routes/linkwarden/links.ts` muss existieren – ❌ fehlt (Stand 2026-05-15)
- Working Tree muss sauber sein

**Betroffene Dateien:**
- `packages/api/routes/linkwarden/links.ts`

**Erlaubte Änderungen:** Ausschließlich Kommentar-Zeilen in links.ts. Keine Logik-Änderungen.
**Verboten:** Alle anderen Dateien, Logik-Änderungen, Import-Änderungen.

**Risiko:** niedrig (sobald Voraussetzung erfüllt)
**Code geändert:** ja (Kommentare)
**Tests automatisch ausführbar:** ja – `pnpm --filter @karakeep/api typecheck`

**Umsetzungsprompt:**
```
Prüfe zuerst: existiert packages/api/routes/linkwarden/links.ts?
Wenn nein: Aufgabe abbrechen und melden.

Lies packages/api/routes/linkwarden/links.ts vollständig.
Lies AGENTS.md (Kommentar-Regeln: nur WHY, nicht WHAT).

Ergänze kurze Kommentare an drei Stellen:

1. Über EXCLUDED_URL_SCHEMES:
   // Schemes meaningless outside the originating browser profile; see api-spec-v0.1.md

2. Über dem if/else für cteSq (collectionId-Branch):
   // collectionId filter must live inside the CTE so LIMIT/OFFSET applies to the correct subset.
   // A post-CTE WHERE on the outer join would break pagination correctness.

3. Über der for-Schleife (Aggregation):
   // Left joins produce one row per (tag × list) per bookmark.
   // Aggregate back to one object per bookmark; collect unique tags, take first collection seen.

Halte dich streng an die drei Stellen. Keine weiteren Kommentare, keine Logik-Änderungen.

Führe aus:
  pnpm --filter @karakeep/api typecheck

Wenn typecheck grün:
  git status  → darf nur links.ts zeigen
  git diff    → nur Kommentar-Zeilen
  Wenn andere Dateien geändert oder Logik-Änderungen: Stoppen und melden.
  Dann committen.
```

---

### TASK-09: Linkwarden Response-Shape in schemas.ts extrahieren

**Ziel:**
Die Antwort-Interfaces (`LinkTag`, `LinkCollection`, `LinkResponse`) in `links.ts` sind
datei-lokal. Wenn später `/api/v1/links/:id`, `/api/v1/tags` oder andere Linkwarden-Routen
hinzukommen, werden dieselben Shapes gebraucht. Extraktion in
`packages/api/routes/linkwarden/schemas.ts` verhindert Duplizierung.

**Warum nur mit Review (und erst nach links.ts):**
- links.ts existiert noch nicht (Stand 2026-05-15).
- Der genaue Response-Shape ist noch nicht gegen Floccus verifiziert.
- Besser nach dem ersten erfolgreichen Floccus-Test, wenn feststeht welche Felder
  wirklich gebraucht werden.

**Voraussetzung:**
- `packages/api/routes/linkwarden/links.ts` muss existieren – ❌ fehlt (Stand 2026-05-15)
- TASK-06 (E2E-Test) empfohlen vorher, damit der Response-Shape als stabil gilt
- Floccus Linkwarden-Modus-Test sollte abgeschlossen sein
- Working Tree muss sauber sein

**Betroffene Dateien:**
- `packages/api/routes/linkwarden/schemas.ts` (neu)
- `packages/api/routes/linkwarden/links.ts` (Importe anpassen)

**Erlaubte Änderungen:** schemas.ts (neu) und links.ts (nur Import-Zeilen anpassen).
**Verboten:** Alle anderen Dateien, Logik-Änderungen in links.ts.

**Risiko:** niedrig-mittel (sobald Voraussetzungen erfüllt)
**Code geändert:** ja
**Tests automatisch ausführbar:** ja – `pnpm --filter @karakeep/api typecheck && pnpm lint`

**Umsetzungsprompt:**
```
Prüfe zuerst: existiert packages/api/routes/linkwarden/links.ts?
Wenn nein: Aufgabe abbrechen und melden.

Lies packages/api/routes/linkwarden/links.ts.
Erstelle packages/api/routes/linkwarden/schemas.ts mit den Interfaces
LinkTag, LinkCollection, LinkResponse (ohne Implementierungslogik).
Importiere sie in links.ts statt der lokalen Definitionen.

Führe aus:
  pnpm --filter @karakeep/api typecheck
  pnpm oxlint packages/api/routes/linkwarden/

Wenn beide grün:
  git status      → darf nur schemas.ts (neu) und links.ts zeigen
  git diff links.ts → darf nur Import-Zeile(n) geändert sein, keine Logik
  Wenn andere Dateien geändert: Stoppen und melden.
  Dann committen.
```

---

## Nicht autonom ausführbar

Die folgenden Punkte wurden identifiziert, aber ausgeschlossen, weil sie menschliche
Rückmeldung, manuelle Tests oder unsichere Korrektheit erfordern:

| Aufgabe | Grund für Ausschluss |
|---|---|
| GET /api/v1/links implementieren (links.ts erstellen) | Braucht Design-Review; ist Voraussetzung für TASK-06/07/09 |
| Floccus Linkwarden-Modus testen | Braucht Browser + echten Floccus-Client |
| Response-Shape gegen Floccus verifizieren | Braucht Floccus-Traffic-Beobachtung |
| POST /api/v1/collections implementieren | Schreib-Endpunkt, braucht ADR-018-Review-Gate |
| DELETE /api/v1/links mit Soft Delete verdrahten | Schreibt linksteward_item_extensions; braucht Floccus-Test zuerst |
| KaraKeep-Modus Floccus bidirektional testen | Browser-Test, manuell |
| Browser HTML Import testen | UI-Test, manuell |
| Archivierung (Screenshot, Reader-Text) | Noch nicht implementiert, Sprint 6 |
| Ollama Auto-Tagging | Braucht Ollama-Instanz, manuell |
| Duplikat-Erkennung, Merge-Vorschau | Noch nicht implementiert, Sprint 9 |
| Broken-Link-Monitor | Noch nicht implementiert, Sprint 10 |
| ADR-018 Review-Gate bewerten | Fachliche Entscheidung, braucht Floccus-Test-Ergebnis |
| Migrationen generieren | Nur zusammen mit expliziter Schema-Änderung |
