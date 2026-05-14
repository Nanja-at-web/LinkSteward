# LinkSteward – Pflichtenheft / Requirements v0.1

## Grundentscheidungen

| Bereich | Entscheidung |
|---|---|
| Technische Basis | KaraKeep als Basis |
| Ergänzung | Linkwarden-artige Archivierung |
| Eigene Module | Duplikate, Broken Links, Ordnungssystem |
| Zielgruppe MVP | Einzelpersonen und Homelab-Nutzer |
| Zielgruppe später | Teams und geteilte Collections |
| Lizenz | AGPL-3.0 Open Source |
| Deployment Hauptweg | Docker Compose |
| Deployment zusätzlich | Proxmox LXC Script |
| Browser-Anbindung MVP | Keine eigene Extension, zuerst Floccus + Import/Export |
| Floccus-Kompatibilität MVP | Linkwarden-kompatible API + KaraKeep-kompatible API |
| Spätere Sync-Ziele | Nextcloud Bookmarks API, WebDAV/XBEL, Git, Google Drive, Dropbox |
| KI Standard | Ollama lokal |
| KI optional | OpenAI-kompatible API |
| KI abschaltbar | Ja |
| Standard-Archivierung | Link + Metadaten + Reader-Text + Screenshot |
| Optionale Archivierung | PDF, Single HTML, OCR, Video-Archivierung |
| Duplikate | Nie automatisch löschen; gruppieren, Vorschau, Merge, Papierkorb |
| Broken Links | Automatisch markieren; Reparaturvorschläge; Änderungen nur nach Bestätigung |

## Kernanforderungen

```text
Kernfeatures
├─ Links speichern
├─ Metadaten extrahieren
├─ Reader-Text extrahieren
├─ Screenshot archivieren
├─ Collections/Themenbaum
├─ Tags
├─ Domainübersicht
├─ Regeln
├─ Ollama Auto-Tagging
├─ Floccus-Support
├─ Linkwarden-kompatible API
├─ KaraKeep-kompatible API
├─ Browser Bookmark HTML Import
├─ Browser Bookmark HTML Export
├─ Duplikat-Erkennung
├─ Duplikat-Merge mit Vorschau
├─ Broken-Link-Monitor
├─ Reparaturvorschläge
├─ Docker Compose
└─ Proxmox LXC Support
```

## Nicht im MVP

```text
Nicht im MVP
├─ eigene Browser Extension
├─ vollständige Team-/Enterprise-Funktionen
├─ Google Drive/Dropbox Live-Sync
├─ Git-Sync mit Konfliktlösung
├─ vollständige semantische Suche
├─ vollständiges WebDAV-Servermodul
├─ automatische Broken-Link-Reparatur ohne Bestätigung
└─ automatisches Löschen von Duplikaten
```

## Sicherheitsanforderungen

```text
Security
├─ Authentifizierung
├─ API Keys mit Scopes
├─ sichere Sessions
├─ Rate Limiting
├─ CORS-Konfiguration
├─ SSRF-Schutz
├─ Upload-Validierung
├─ Rechteprüfung
├─ Soft Delete
├─ Papierkorb
└─ sichere Defaults
```
