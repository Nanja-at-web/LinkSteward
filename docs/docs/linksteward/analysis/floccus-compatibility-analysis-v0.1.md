# Floccus Compatibility Analyse v0.1

## Ziel

LinkSteward soll zuerst über Floccus mit Browser-Lesezeichen synchronisieren, bevor eine eigene Browser-Erweiterung gebaut wird.

## MVP-Strategie

```text
Floccus → LinkSteward
├─ Linkwarden-kompatible API
└─ KaraKeep-kompatible API
```

## Später

```text
├─ Nextcloud Bookmarks API
├─ WebDAV/XBEL
├─ Git
├─ Google Drive
└─ Dropbox
```

## Testmatrix

```text
Firefox + Floccus + Linkwarden-Modus
Chrome/Chromium + Floccus + Linkwarden-Modus
Firefox + Floccus + KaraKeep-Modus
Chrome/Chromium + Floccus + KaraKeep-Modus
```

## Testfälle

```text
├─ initialer Sync
├─ Bookmark erstellen
├─ Bookmark umbenennen
├─ URL ändern
├─ Bookmark löschen
├─ Ordner erstellen
├─ Ordner verschieben
├─ Ordner löschen
├─ Änderung LinkSteward → Browser
├─ Änderung Browser → LinkSteward
├─ Konfliktfall
└─ Duplikatfall
```

## URL-Schemata

Kompatibel:

```text
http(s)
ftp
javascript
```

Nicht in Kompatibilitäts-APIs ausgeben:

```text
data:
chrome:
file:
about:
moz-extension:
chrome-extension:
```

## Sicherheitsregel

Floccus-Sync-Löschungen werden in LinkSteward als Soft Delete verarbeitet.

## Testergebnisse v0.1-alpha

### KaraKeep-Modus (2026-05-14)

- Floccus v5.8.6, Firefox Desktop
- Status: ✅ Verbindung und Basis-Sync bestätigt ("Alles gut")
- Details: docs/docs/linksteward/testing/floccus-sync-results-v0.1.md
- Intensiver Test (bidirektional, Konflikt, große Datensätze) steht aus.

### Linkwarden-Modus

- Status: ⬜ Noch nicht getestet
- GET /api/v1/collections ist implementiert.
- GET /api/v1/links ist implementiert und E2E-getestet (10 Testfälle). URL-Schema-Filter im Endpoint vorhanden; E2E-Abdeckung dafür noch TODO.
- Floccus-Verbindungstest steht aus.
