# LinkSteward – MVP-Implementierungsplan v0.1

## Kritischer Pfad zum testbaren Prototyp

```text
KaraKeep-Fork lokal starten
→ API Key erzeugen
→ Item speichern
→ Collection speichern
→ Linkwarden-kompatible API minimal implementieren
→ Floccus im Linkwarden-Modus verbinden
→ Bookmark aus Browser nach LinkSteward synchronisieren
→ Bookmark in LinkSteward anzeigen
→ Bookmark in LinkSteward ändern
→ Änderung zurück in Browser synchronisieren
```

## Sprint-Struktur

```text
Sprint 0 – Vorbereitung
Sprint 1 – Projektbasis und lokale Entwicklung
Sprint 2 – Native API Basis
Sprint 3 – Linkwarden Compatibility + Floccus erster Sync
Sprint 4 – KaraKeep Compatibility + Floccus zweiter Sync
Sprint 5 – Import/Export HTML
Sprint 6 – Archivierung MVP
Sprint 7 – Ordnungssystem MVP
Sprint 8 – Ollama Auto-Tagging MVP
Sprint 9 – Duplikat-Erkennung MVP
Sprint 10 – Broken-Link-Monitor MVP
Sprint 11 – Docker/Proxmox Self-hosting Polish
Sprint 12 – MVP Stabilisierung
```

## Sprint 1 – Projektbasis

```text
├─ KaraKeep-Basis forken oder lokal klonen
├─ lokale Entwicklungsumgebung starten
├─ Datenbankmigrationen verstehen
├─ bestehende API/Worker-Struktur analysieren
├─ LinkSteward-Namespace/Package vorbereiten
├─ Feature Flags vorbereiten
├─ .env.example erweitern
└─ Docker Dev Setup prüfen
```

## Sprint 2 – Native API

```text
├─ API-Key-Modell
├─ Bearer Auth
├─ Native API Prefix /api/linksteward/v1
├─ Items CRUD
├─ Collections CRUD
├─ Collections Tree Endpoint
├─ Tags CRUD
├─ Soft Delete
├─ Pagination
└─ Error Format
```

## Sprint 3 – Linkwarden + Floccus

```text
├─ Linkwarden Collections API
├─ Linkwarden Links API
├─ Linkwarden Tags minimal
├─ Response Mapping
├─ Unsupported Items Filter
├─ Firefox Floccus Test
├─ Chromium Floccus Test
└─ Sync Events
```

## Sprint 4 – KaraKeep + Floccus

```text
├─ KaraKeep Bookmarks API
├─ KaraKeep Lists API
├─ Tags Mapping
├─ Bookmark/List-Zuordnung
├─ Firefox Floccus Test
├─ Chromium Floccus Test
└─ Unterschiede dokumentieren
```

## Sprint 5 – Import/Export

```text
├─ Browser HTML Parser
├─ Import Preview
├─ Import Job
├─ Ordner → Collections
├─ Bookmarks → Items
├─ Export Preview
├─ Browser HTML Export
└─ Themenbaum → Browser-Ordnerstruktur
```

## Sprint 6 – Archivierung

```text
├─ ArchiveJob-Datenmodell
├─ Job-System
├─ Browser Service
├─ Metadaten
├─ Reader-Text
├─ Screenshot
├─ Asset Storage
├─ Archivstatus
├─ Retry
└─ SSRF-Schutz
```

## Sprint 7 – Ordnungssystem

```text
├─ Domainübersicht
├─ Themenbaum UI
├─ Primärkategorie
├─ Regelengine MVP
├─ Domain → Kategorie/Tag Regeln
├─ Regeltest
└─ Export nutzt Themenbaum
```

## Sprint 8 – Ollama

```text
├─ AI Settings
├─ Ollama Provider
├─ Verbindungstest
├─ Klassifizierungsjob
├─ JSON-Ausgabe
├─ AI Suggestions
├─ Vorschläge UI
├─ Vorschlag übernehmen/ablehnen
└─ „immer so machen“ → Regel
```

## Sprint 9 – Duplikate

```text
├─ URL-Normalisierung
├─ Tracking-Parameter entfernen
├─ DuplicateGroup
├─ Erkennung beim Speichern
├─ Erkennung beim Import
├─ UI/API
├─ Ignore/False Positive
├─ Merge Preview
├─ Merge-Ausführung
└─ Papierkorb
```

## Sprint 10 – Broken Links

```text
├─ LinkHealthCheck
├─ HEAD/GET Prüfung
├─ Redirect-Verfolgung
├─ Statusmodell
├─ manuelle Prüfung
├─ Broken-Link-Übersicht
├─ Reparaturvorschläge
├─ Reparatur nach Bestätigung
└─ URL History
```

## v0.1-alpha

```text
├─ lokale Installation
├─ API Key
├─ Items / Collections / Tags
├─ Linkwarden-kompatible API minimal
├─ Floccus Linkwarden-Sync
├─ Browser HTML Import
├─ einfache Duplikatwarnung
└─ Docker Compose Dev Setup
```
