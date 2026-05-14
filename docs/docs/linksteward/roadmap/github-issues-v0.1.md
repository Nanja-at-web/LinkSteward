# LinkSteward – GitHub Issues v0.1

## Labels

```text
area:api
area:floccus
area:archive
area:duplicates
area:broken-links
area:ordering
area:ai
area:import-export
area:proxmox
area:docker
area:security
area:ui
area:database
area:worker
area:docs
area:testing
area:settings
area:auth

type:feature
type:bug
type:task
type:docs
type:refactor
type:test
type:research
type:security

priority:critical
priority:high
priority:medium
priority:low

mvp:required
mvp:optional
post-mvp
```

## Epics

```text
EPIC 1 – Projektgrundlage
EPIC 2 – Auth, API Keys und Nutzerbasis
EPIC 3 – Native LinkSteward API
EPIC 4 – Linkwarden-kompatible API
EPIC 5 – KaraKeep-kompatible API
EPIC 6 – Floccus-Kompatibilität und Sync-Tests
EPIC 7 – Bookmark Import/Export
EPIC 8 – Archivierung
EPIC 9 – Ordnungssystem
EPIC 10 – Ollama/KI
EPIC 11 – Duplikat-Erkennung
EPIC 12 – Broken-Link-Monitor
EPIC 13 – Docker Compose
EPIC 14 – Proxmox LXC Support
EPIC 15 – Security
EPIC 16 – Dokumentation
EPIC 17 – v1.0 Stabilisierung
```

## Erste 10 Issues

```text
1. LK-001 – Repository und Projektstruktur anlegen
2. LK-002 – KaraKeep-Basis technisch analysieren
3. LK-003 – Architekturentscheidung: Fork oder eigenständige App dokumentieren
4. LK-004 – Lokale Entwicklungsumgebung starten
5. LK-005 – GitHub Labels und Milestones anlegen
6. LK-020 – API-Key-Modell mit Scopes implementieren
7. LK-021 – Native Item CRUD API implementieren
8. LK-030 – Linkwarden-kompatible Collections API implementieren
9. LK-031 – Linkwarden-kompatible Links API implementieren
10. LK-040 – KaraKeep-kompatible Bookmarks API implementieren
```

## Wichtige Issues

```text
[API] Native API Basisstruktur /api/linksteward/v1 erstellen
[API] Standard Error Format implementieren
[API] Cursor Pagination implementieren
[Auth] API Keys mit Scopes implementieren
[Compat] Linkwarden Collections API implementieren
[Compat] Linkwarden Links API implementieren
[Compat] KaraKeep Bookmarks API implementieren
[Compat] KaraKeep Lists API implementieren
[Floccus] Linkwarden-Modus Testmatrix implementieren
[Floccus] KaraKeep-Modus Testmatrix implementieren
[Archive] Screenshot-Job implementieren
[Archive] Reader-Text extrahieren
[Ordering] Domain-Parser implementieren
[Ordering] Regelengine MVP implementieren
[AI] Ollama Auto-Tagging integrieren
[Duplicates] URL-Normalisierung implementieren
[Duplicates] Merge-Vorschau UI
[Broken Links] Link Health Check Worker implementieren
[Broken Links] Repair Suggestions API implementieren
[Docker] Docker Compose Production Setup
[Proxmox] LXC-Installationskonzept
[Security] SSRF-Schutz
```
