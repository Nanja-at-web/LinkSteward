# Linkwarden Compat Implementation Plan v0.1

> Erstellt: 2026-05-14  
> Branch: `feature/linkwarden-compat-alpha`  
> Ziel: kleinster erster Implementierungsschritt fuer die Linkwarden-kompatible API als v0.1-alpha-Slice  
> Status: Planungsdokument, keine Codeaenderung

## 1. Grundlage

Dieser Plan basiert auf:

- `AGENTS.md`
- `docs/docs/linksteward/analysis/karakeep-analysis-v0.1.md`
- `docs/docs/linksteward/adr/016-sqlite-for-alpha.md`
- `docs/docs/linksteward/adr/017-soft-delete-alpha-extension-table.md`
- `docs/docs/linksteward/adr/018-linkwarden-floccus-alpha-slice.md`

Verbindliche Leitplanken fuer den ersten Alpha-Slice:

- KaraKeep bleibt technische Basis.
- SQLite bleibt fuer v0.1-alpha bestehen.
- Kein PostgreSQL-Umbau vor Alpha.
- `@karakeep/*` Namespace bleibt fuer Alpha bestehen.
- Linkwarden-kompatible API zuerst.
- Floccus Linkwarden-Modus zuerst testen.
- Extension Tables zuerst.
- Keine direkte `bookmarks.deletedAt`-Spalte im ersten Alpha-Slice.
- Soft Delete spaeter ueber `linksteward_item_extensions.deletedAt`.
- External Mappings spaeter ueber `linksteward_external_mappings`.
- Nicht-URL-Items muessen aus Kompatibilitaets-APIs gefiltert werden.
- AI-Tags im Alpha ausblenden oder read-only behandeln.
- Queue-System ist `queue-liteque` / `queue-restate`, nicht Bull.

## 2. Befund: REST-Routen-Registrierung

Die REST-API wird in KaraKeep als Hono-App in `packages/api` gebaut und durch Next.js unter `/api` gemountet.

Relevante Dateien:

- `apps/web/app/api/[[...route]]/route.ts`
  - erzeugt `new Hono().basePath("/api")`
  - setzt pro Request `ctx` ueber `createContextFromRequest`
  - mountet `@karakeep/api` via `.route("/", allApp)`
  - exportiert HTTP-Methoden fuer Next.js

- `packages/api/index.ts`
  - registriert globale Middleware: Logger, CORS, Metrics, Context-Check, tRPC-Error-Adapter
  - registriert `/api/trpc`, `/api/assets`, `/api/public`, `/api/metrics`, `/api/webhooks`
  - baut den `v1`-Router und mountet ihn unter `/api/v1`
  - vorhandene v1-Routen:
    - `/api/v1/bookmarks`
    - `/api/v1/lists`
    - `/api/v1/tags`
    - weitere KaraKeep-Routen wie assets, users, feeds, highlights

Die Linkwarden-kompatiblen Routen koennen deshalb ohne neuen Server-Mount im bestehenden `v1`-Router eingebunden werden.

## 3. Einbindung von `/api/v1/collections` und `/api/v1/links`

Empfohlene Adapter-Struktur:

```text
packages/api/routes/linkwarden/collections.ts
packages/api/routes/linkwarden/links.ts
packages/api/routes/linkwarden/tags.ts        optional, spaeter
packages/api/routes/linkwarden/schemas.ts     optional, sobald mehrere Routen gemeinsame Shapes brauchen
```

Einbindung in `packages/api/index.ts`:

```text
v1
  .route("/collections", linkwardenCollections)
  .route("/links", linkwardenLinks)
```

Warum ein eigener Unterordner sinnvoll ist:

- Die Pfade bleiben Linkwarden-kompatibel (`/api/v1/collections`, `/api/v1/links`).
- Die Implementierung bleibt sichtbar als Kompatibilitaets-Adapter getrennt von KaraKeep-nativen `/lists` und `/bookmarks`.
- Response-Mapping, Floccus-spezifische Einschraenkungen und spaetere External-Mapping-Logik muessen nicht in vorhandene KaraKeep-Routen gemischt werden.

Nicht empfohlen fuer den ersten Schritt:

- vorhandene `packages/api/routes/lists.ts` inhaltlich auf Linkwarden-Semantik umbauen
- vorhandene `packages/api/routes/bookmarks.ts` inhaltlich auf Linkwarden-Semantik umbauen
- neue LinkSteward-URL wie `/api/linksteward/v1/*` als ersten Floccus-Pfad bauen

## 4. Wiederverwendbare tRPC-Router und Services

Die bestehende REST-Schicht ruft ueber `c.var.api` den tRPC-Caller auf. Das sollte fuer den ersten Adapter ebenfalls genutzt werden.

Direkt wiederverwendbar:

- `c.var.api.lists.list()`
  - fuer `GET /api/v1/collections`
  - liefert vorhandene KaraKeep-Listen

- `c.var.api.lists.create(...)`
  - fuer spaeteres `POST /api/v1/collections`
  - muss auf `type: "manual"` begrenzt werden

- `c.var.api.lists.get({ listId })`
  - fuer spaeteres `GET /api/v1/collections/:id`

- `c.var.api.lists.edit(...)`
  - fuer spaeteres `PATCH /api/v1/collections/:id`

- `c.var.api.lists.delete(...)`
  - fuer spaeteres `DELETE /api/v1/collections/:id`
  - vor Alpha-Sync nur mit Soft-Delete-Entscheidung verwenden

- `c.var.api.bookmarks.createBookmark(...)`
  - fuer spaeteres `POST /api/v1/links`
  - muss `type: "link"` und `source: "api"` oder spaeter `"linkwarden"` setzen

- `c.var.api.bookmarks.getBookmark(...)`
  - fuer spaeteres `GET /api/v1/links/:id`

- `c.var.api.bookmarks.updateBookmark(...)`
  - fuer spaeteres `PATCH /api/v1/links/:id`

- `c.var.api.bookmarks.updateTags(...)`
  - fuer spaetere Tag-Unterstuetzung

- `c.var.api.lists.addToList(...)` und `c.var.api.lists.removeFromList(...)`
  - fuer Collection-Zuordnung von Links

- `c.var.api.tags.list(...)` und `c.var.api.tags.create(...)`
  - fuer minimale Tag-Kompatibilitaet

Nur eingeschraenkt wiederverwendbar:

- `c.var.api.bookmarks.getBookmarks(...)`
  - liefert Links, Texte und Assets gemeinsam
  - kann nicht sauber nur Link-Bookmarks paginieren
  - Post-Filtering auf `content.type === "link"` waere fuer Floccus riskant, weil Seiten leer oder unvollstaendig werden koennen
  - fuer `GET /api/v1/links` sollte daher vor produktivem Alpha entweder ein Link-only Query-Pfad ergaenzt oder ein dedizierter Compat-Service gebaut werden

- `c.var.api.bookmarks.deleteBookmark(...)`
  - fuehrt aktuell Hard Delete aus
  - darf fuer Floccus-Loeschungen erst verwendet oder ersetzt werden, wenn Soft Delete ueber `linksteward_item_extensions.deletedAt` implementiert ist

## 5. Vorhandene Tabellen fuer Collections, Links und Tags

Collections:

- `bookmarkLists`
  - bildet KaraKeep-Listen ab
  - relevante Felder: `id`, `name`, `description`, `icon`, `userId`, `type`, `query`, `parentId`, `public`, `createdAt`
  - fuer Linkwarden-Compat in Alpha nur `type = "manual"` als Browser-Ordner verwenden
  - `parentId` kann verschachtelte Collections abbilden

- `bookmarksInLists`
  - M:N-Zuordnung zwischen Bookmarks und Listen
  - relevante Felder: `bookmarkId`, `listId`, `addedAt`, `listMembershipId`

Links:

- `bookmarks`
  - gemeinsames Item-Grundmodell
  - relevante Felder: `id`, `createdAt`, `modifiedAt`, `title`, `archived`, `favourited`, `userId`, `note`, `summary`, `type`, `source`
  - fuer Linkwarden-Compat nur `type = "link"` ausgeben

- `bookmarkLinks`
  - Link-spezifische Daten
  - relevante Felder: `id`, `url`, `title`, `description`, `imageUrl`, `favicon`, `crawledAt`, `crawlStatus`, `crawlStatusCode`
  - `id` referenziert `bookmarks.id`

Tags:

- `bookmarkTags`
  - Tag-Stammdaten je Nutzer
  - relevante Felder: `id`, `name`, `normalizedName`, `createdAt`, `userId`

- `tagsOnBookmarks`
  - M:N-Zuordnung zwischen Tags und Bookmarks
  - relevante Felder: `bookmarkId`, `tagId`, `attachedAt`, `attachedBy`
  - fuer Alpha: `attachedBy = "ai"` in Linkwarden-Compat ausblenden oder read-only behandeln

## 6. Spaetere Extension Tables

`linksteward_item_extensions` sollte spaeter in `packages/db/schema.ts` neben den KaraKeep-Bookmark-Tabellen ergaenzt werden. Es sollte additiv auf `bookmarks.id` referenzieren und mindestens `deletedAt` fuer Alpha-Soft-Delete tragen.

Vorlaeufige Rolle:

- Soft Delete fuer Floccus-/Linkwarden-Kompatibilitaet
- Filter in `GET /api/v1/links`
- Schutz vor irreversiblem Datenverlust bei Delete-Sync

`linksteward_external_mappings` sollte spaeter ebenfalls in `packages/db/schema.ts` ergaenzt werden. Es sollte externe System-IDs stabil mit KaraKeep-IDs verbinden.

Vorlaeufige Rolle:

- Mapping von Floccus-/Linkwarden-IDs auf KaraKeep-Listen und Bookmarks
- Konflikt- und Wiederanlage-Faelle nach Loeschungen absichern
- spaetere Unterstuetzung mehrerer externer Clients erlauben

Wichtig: Fuer den allerersten read-only Collections-Schritt sind beide Tabellen noch nicht erforderlich. Sie muessen aber vor produktivem Delete-/Sync-Verhalten geplant und implementiert werden.

## 7. Minimale erste Route

Empfehlung: Als erstes `GET /api/v1/collections` implementieren.

Warum diese Route zuerst:

- read-only, dadurch kein Risiko fuer Datenverlust
- kein neues Datenmodell und keine Migration noetig
- prueft den wichtigsten technischen Pfad:
  - Next.js API-Mount
  - Hono-v1-Router
  - Bearer API-Key Auth
  - tRPC-Caller ueber `c.var.api`
  - Linkwarden-Response-Mapping
- nutzt `bookmarkLists` und `c.var.api.lists.list()` direkt
- liefert eine kleine, reviewbare Grundlage fuer Floccus-Verbindungstests

Minimalverhalten fuer den ersten Code-Schritt:

```text
GET /api/v1/collections
Authorization: Bearer <KaraKeep API Key>

Antwort:
- nur Collections des authentifizierten Users
- nur manuelle Listen als Browser-Collections
- stabile IDs aus `bookmarkLists.id`
- Name aus `bookmarkLists.name`
- Parent aus `bookmarkLists.parentId`
- keine Smart Lists
- keine Public-/Collaboration-Sondersemantik
```

Noch nicht im ersten Code-Schritt:

- `POST /api/v1/collections`
- `PATCH /api/v1/collections/:id`
- `DELETE /api/v1/collections/:id`
- `GET /api/v1/links`
- Soft Delete
- External Mappings
- OpenAPI-/SDK-Generierung
- Floccus als vollstaendiger Sync-Test

## 8. Tests und manuelle Pruefschritte

Automatisierte Tests fuer den ersten Code-Schritt:

- neuer API-Test fuer `GET /api/v1/collections`
- Test mit gueltigem Bearer API-Key
- Test ohne Auth erwartet `401`
- Test mit zwei manuell angelegten Listen
- Test, dass Smart Lists nicht als Linkwarden-Collections ausgegeben werden
- Test fuer `parentId`, sobald verschachtelte Listen im Response-Shape enthalten sind

Moeglicher Test-Ort:

```text
packages/e2e_tests/tests/api/linkwarden-collections.test.ts
```

Moeglicher Test-Stil:

- bestehende Testhelfer aus `packages/e2e_tests/utils/api.ts`
- `createTestUser()` fuer API-Key
- entweder raw `fetch` gegen `/api/v1/collections` oder spaeter SDK/OpenAPI, wenn die Spezifikation aktualisiert wird

Manuelle Pruefschritte nach der ersten Implementierung:

```text
curl -H "Authorization: Bearer <api-key>" \
  http://localhost:<port>/api/v1/collections
```

Danach pruefen:

- Status `200`
- keine Auth ohne Bearer-Key
- Response enthaelt nur erwartete Collections
- vorhandene `/api/v1/lists` Route funktioniert unveraendert
- vorhandene `/api/v1/bookmarks` Route funktioniert unveraendert

Spaetere Floccus-Pruefung:

- Firefox Desktop mit Floccus Linkwarden-Modus
- Chromium Desktop mit Floccus Linkwarden-Modus
- initialer leerer Sync
- Ordner erstellen, umbenennen, verschieben
- Bookmark erstellen, aendern, verschieben
- Delete-Verhalten erst nach Soft-Delete-Implementierung produktiv testen

## 9. Risiken vor der ersten Codeaenderung

1. Linkwarden-Response-Shape ist noch nicht verifiziert.
   - Floccus-Kompatibilitaet haengt an konkreten Feldnamen, Statuscodes, IDs, Pagination und Fehlerformaten.
   - Nicht aus den gelesenen lokalen Dateien ableitbar: exakter aktuelle Linkwarden-API-Vertrag, den Floccus erwartet.

2. `GET /api/v1/links` braucht Link-only Pagination.
   - vorhandenes `getBookmarks` kann nicht sauber nur `type = "link"` paginieren.
   - Post-Filtering waere fuer Floccus riskant.

3. Delete darf nicht als Hard Delete starten.
   - `deleteBookmark` entfernt aktuell den Bookmark und Assets.
   - Floccus-Loeschungen brauchen vorher `linksteward_item_extensions.deletedAt`.

4. Smart Lists sind keine Browser-Ordner.
   - Linkwarden-Compat sollte fuer Alpha nur manuelle Listen ausgeben.
   - Smart Lists koennen als Collections falsche bidirektionale Semantik erzeugen.

5. AI-Tags koennen Sync-Ergebnisse destabilisieren.
   - `tagsOnBookmarks.attachedBy` unterscheidet `ai` und `human`.
   - Alpha-Compat sollte AI-Tags ausblenden oder read-only behandeln.

6. External IDs sind noch ungeklart.
   - KaraKeep-IDs koennen fuer den ersten read-only Schritt reichen.
   - Fuer echten Sync, Wiederanlage, Delete und Konflikte kann `linksteward_external_mappings` noetig werden.

7. OpenAPI/SDK-Abgleich ist eine eigene Entscheidung.
   - Bestehende E2E-Tests nutzen oft das generierte SDK.
   - Der erste Compat-Test kann raw `fetch` nutzen, um OpenAPI-/SDK-Aenderungen aus dem ersten Minimal-Slice herauszuhalten.

## 10. Konkrete betroffene Dateien

Erster Code-Schritt, minimal:

- `packages/api/index.ts`
  - neuen Collections-Adapter unter `/api/v1/collections` registrieren

- `packages/api/routes/linkwarden/collections.ts`
  - neue Hono-Route fuer `GET /`
  - `authMiddleware`
  - Aufruf von `c.var.api.lists.list()`
  - Mapping auf Linkwarden-kompatibles Collection-Shape

- `packages/e2e_tests/tests/api/linkwarden-collections.test.ts`
  - read-only API-Test fuer Auth und Basis-Response

Moegliche spaetere Dateien:

- `packages/api/routes/linkwarden/links.ts`
- `packages/api/routes/linkwarden/tags.ts`
- `packages/api/routes/linkwarden/schemas.ts`
- `packages/trpc/routers/bookmarks.ts` oder `packages/trpc/models/bookmarks.ts`
  - nur falls ein sauberer Link-only Query-Pfad ueber tRPC ergaenzt wird

- `packages/db/schema.ts`
  - spaeter fuer `linksteward_item_extensions` und `linksteward_external_mappings`

- `packages/db/drizzle/*`
  - spaeter fuer generierte Migrationen, nicht im ersten read-only Schritt

- `packages/open-api/*` und `packages/sdk/*`
  - spaeter, wenn die Compat-API in OpenAPI/SDK aufgenommen werden soll

## 11. Reihenfolge fuer die ersten 5 Implementierungs-Issues

### Issue 1: Linkwarden-Collection-Contract festlegen

Ziel:

- lokales Minimal-Response-Shape fuer `GET /api/v1/collections` definieren
- offene Felder markieren, die gegen echte Linkwarden-/Floccus-Erwartungen verifiziert werden muessen

Akzeptanz:

- dokumentiertes Request-/Response-Beispiel
- Entscheidung, ob Smart Lists fuer Alpha gefiltert werden
- Entscheidung, ob raw `fetch` oder SDK-Test fuer den ersten Test genutzt wird

### Issue 2: `GET /api/v1/collections` implementieren

Ziel:

- neue Route registrieren
- Bearer API-Key Auth wiederverwenden
- `c.var.api.lists.list()` verwenden
- nur manuelle Listen als Collections ausgeben

Akzeptanz:

- Auth mit API-Key funktioniert
- unauthentifizierter Request liefert `401`
- vorhandene `/api/v1/lists` Route bleibt unveraendert
- E2E-Test fuer Basisfall gruen

### Issue 3: Link-only Query-Strategie fuer `GET /api/v1/links` entscheiden

Ziel:

- klaeren, ob ein dedizierter Compat-Service oder eine tRPC-Erweiterung genutzt wird
- keine Post-Filtering-Pagination als produktive Loesung

Akzeptanz:

- Entscheidung dokumentiert
- Query filtert serverseitig auf `bookmarks.type = "link"` / Join mit `bookmarkLinks`
- Nicht-URL-Items werden nicht ausgegeben

### Issue 4: `GET /api/v1/links` read-only implementieren

Ziel:

- Linkwarden-kompatible Links lesen
- nur Link-Bookmarks ausgeben
- Collection-Zuordnung ueber `bookmarksInLists`
- AI-Tags ausblenden oder read-only behandeln

Akzeptanz:

- Text- und Asset-Bookmarks erscheinen nicht
- Pagination ist stabil
- manuelle Listen-Zuordnung ist sichtbar
- E2E-Test fuer Link-Ausgabe gruen

### Issue 5: Soft-Delete- und External-Mapping-Minimalmodell vorbereiten

Ziel:

- `linksteward_item_extensions.deletedAt` und `linksteward_external_mappings` fuer schreibende Sync-Endpunkte spezifizieren
- erst danach `POST/PATCH/DELETE /links` und Delete-Sync implementieren

Akzeptanz:

- ADR-017 wird technisch konkretisiert
- keine direkte `bookmarks.deletedAt`-Spalte
- Delete-Verhalten fuer Floccus ist vor dem ersten produktiven Delete-Test geklaert

## 12. Empfehlung fuer den allerersten Code-Schritt

Der allererste Code-Schritt sollte sein:

```text
Implementiere nur `GET /api/v1/collections` als neuen Linkwarden-Compat-Adapter.
```

Konkrete Ausgestaltung:

- neue Datei `packages/api/routes/linkwarden/collections.ts`
- Route in `packages/api/index.ts` unter `v1.route("/collections", ...)`
- `authMiddleware` verwenden
- `c.var.api.lists.list()` aufrufen
- nur `type === "manual"` ausgeben
- Mapping klein halten: `id`, `name`, `parentId` und notwendige Timestamp-/Metadatenfelder nur soweit der verifizierte Contract sie braucht
- ein E2E-Test mit raw `fetch`

Warum nicht `GET /api/v1/links` zuerst:

- Link-Filtering und Pagination sind noch riskant.
- Nicht-URL-Filterung ist fuer Floccus verbindlich.
- spaeteres Soft Delete betrifft Links staerker als Collections.

Warum nicht `POST` oder `DELETE` zuerst:

- Schreibende Sync-Endpunkte koennen Daten veraendern.
- Delete ist ohne Extension-Table-Soft-Delete nicht alpha-sicher.

## 13. Klare Grenze: Noch nicht implementieren

Nicht im ersten Implementierungsschritt:

- PostgreSQL-Umbau
- Namespace-/Branding-Umbau weg von `@karakeep/*`
- direkte `bookmarks.deletedAt`-Spalte
- `linksteward_item_extensions` Migration
- `linksteward_external_mappings` Migration
- Hard Delete ueber Linkwarden-Compat
- `POST/PATCH/DELETE /api/v1/collections`
- `POST/PATCH/DELETE /api/v1/links`
- KaraKeep-Floccus-Modus
- Crawler-/Archivierungs-Erweiterungen
- AI-Suggestions oder Duplicate-Erkennung
- OpenAPI-/SDK-Generierung, sofern sie nicht explizit fuer Tests gebraucht wird
- breite Refactorings der vorhandenen KaraKeep-Routen

## 14. Kurzentscheidung

Fuer v0.1-alpha ist der belastbarste kleinste Schritt:

```text
Read-only Collections Adapter:
GET /api/v1/collections
```

Dieser Schritt beweist den neuen Linkwarden-kompatiblen API-Pfad mit minimalem Risiko. Danach kann LinkSteward gezielt die schwierigeren Teile angehen: Link-only Pagination, Nicht-URL-Filterung, Soft Delete und External Mappings.
