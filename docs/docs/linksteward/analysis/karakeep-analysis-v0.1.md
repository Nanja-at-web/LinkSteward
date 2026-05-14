# KaraKeep Analyse v0.1

## Ziel

Prüfen, ob KaraKeep als technische Basis für LinkSteward geeignet ist und wo LinkSteward-Erweiterungen andocken sollen.

## Zu analysieren

```text
Repository-Struktur
├─ Monorepo-Aufbau
├─ Apps/Packages
├─ Web-App
├─ Worker
├─ Mobile/Extension, falls vorhanden
└─ Build-System

Datenmodell
├─ Bookmarks/Items
├─ Lists
├─ Tags
├─ Assets
├─ Users/Auth
├─ API Keys
├─ Import/Export
└─ AI/OCR/Archive

API
├─ Bookmarks
├─ Lists
├─ Tags
├─ Assets
├─ Auth
└─ Floccus-relevante Endpunkte

Worker
├─ Archivierung
├─ Crawling
├─ OCR
├─ AI
├─ RSS
└─ Import/Export

Deployment
├─ Docker Compose
├─ Meilisearch
├─ Browser/Chrome Service
├─ Volumes
└─ Env Vars
```

## Ergebnis-Template

```text
Wiederverwendbar
├─ ...
Fehlt
├─ ...
Muss erweitert werden
├─ ...
Risiken
├─ ...
Empfehlung für v0.1-alpha
├─ ...
```

## Entscheidung nach Analyse

```text
Variante A: KaraKeep-Tabellen direkt erweitern
Variante B: LinkSteward Extension Tables
Empfehlung aktuell: Extension Tables bevorzugen, sofern technisch sinnvoll.
```
