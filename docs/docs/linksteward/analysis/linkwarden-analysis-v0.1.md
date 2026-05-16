# Linkwarden Analyse v0.1

## Ziel

Ermitteln, welche Linkwarden-Funktionen für LinkSteward übernommen oder nachgebaut werden sollen.

## Relevante Linkwarden-Stärken

```text
├─ Link-Archivierung
├─ Screenshot
├─ PDF
├─ Single HTML
├─ Reader View
├─ Annotationen/Highlights
├─ Collections/Subcollections
├─ Public Sharing
├─ Rollen/Rechte
├─ API Keys
└─ Floccus/Linkwarden API-Kompatibilität
```

## Für LinkSteward relevant

```text
MVP
├─ Linkwarden-kompatible API
├─ Collections/Links Mapping
├─ Linkwarden-artige Archivierung: Reader-Text + Screenshot
└─ später optional PDF/Single HTML

Post-MVP
├─ Annotationen/Highlights
├─ Public Sharing
├─ Team-Rechte
└─ tiefere Linkwarden-Migration
```

## Offene Fragen

### 1. Wie exakt muss Linkwarden API für Floccus nachgebildet werden?

**Stand: noch offen**

`GET /api/v1/collections` ist implementiert. Der Response-Contract (Felder, Paginierung,
Fehlerformate) ist noch nicht gegen einen echten Floccus-Linkwarden-Modus-Test verifiziert.
Erst nach dem ersten realen Floccus-Sync ist klar, welche API-Details exakt eingehalten
werden müssen. Siehe ADR-018 Review-Gate.

### 2. Welche Felder erwartet Floccus tatsächlich?

**Stand: noch offen**

Implementierter Minimalansatz für `GET /api/v1/collections`: `id`, `name`, `parentId`.
Dieser Ansatz basiert auf der bekannten Linkwarden-API-Struktur, ist aber noch nicht mit
echtem Floccus-Traffic verifiziert. Die tatsächlichen Pflichtfelder sind erst durch einen
Floccus-Linkwarden-Modus-Test nachweisbar.

### 3. Wie werden Tags/Collections gemappt?

**Stand: teilweise entschieden**

Collections: Nur manuelle Listen werden als Collections exportiert, Smart-Listen werden
ausgeschlossen. Entschieden durch ADR-018, implementiert in `GET /api/v1/collections`.

Tags: AI-Tag-Filterung (nur `attachedBy="human"` Tags) ist als Anforderung festgelegt
(AGENTS.md, ADR-018) und in `GET /api/v1/links` implementiert. URL-Schema-Filter sind
ebenfalls implementiert; E2E-Testabdeckung dafür ist noch TODO. Verifizierung mit Floccus steht aus.

### 4. Welche Linkwarden-Exportformate sollen importiert werden?

**Stand: noch offen**

Kein Alpha-Thema. Import/Export ist Sprint 5. Keine Entscheidung getroffen.

---

## Implementierter Alpha-Stand

- `GET /api/v1/collections` (read-only, manuelle Listen) – implementiert
  - E2E-Test: `packages/e2e_tests/tests/api/linkwarden-collections.test.ts`
- `GET /api/v1/links` – implementiert, E2E-getestet (10 Testfälle)
  - E2E-Test: `packages/e2e_tests/tests/api/linkwarden-links.test.ts`
  - URL-Schema-Filter im Endpoint vorhanden; E2E-Abdeckung dafür noch TODO
