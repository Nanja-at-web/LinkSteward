# Floccus Sync Test Results v0.1

## KaraKeep-Modus – Erster Verbindungstest

> Datum: 2026-05-14
> Floccus: v5.8.6
> Browser: Firefox Desktop
> Server: http://192.168.1.249:3000 (lokale LinkSteward-Instanz)
> Modus: KaraKeep-native (nicht Linkwarden-Modus)

### Ergebnis

```text
✅ Verbindung erfolgreich
✅ API-Key-Auth funktioniert
✅ Sync abgeschlossen – "Alles gut"
✅ Zuletzt synchronisiert: vor 54 Sekunden
```

### Konfiguration beim erfolgreichen Test

```text
Ziel auf dem Server: test (kleine Testliste)
Lokales Ziel:        Lesezeichenordner /Favoritenleiste/
```

### Vorangegangener Fehlschlag (E049 Failsafe)

Beim ersten Versuch mit der Kollektion "Imported Bookmarks" als Sync-Ziel
hat Floccus E049 ausgelöst:

> E049: Failsafe: The current sync run would increase your local links count
> in this profile by 7234%. Refusing to execute.

Ursache: Die Kollektion enthielt weit mehr Bookmarks als die lokale
Favoritenleiste. Floccus verweigert den Sync, um versehentlichen Massenimport
zu verhindern. Kein Server-Fehler – reiner Client-Schutzmechanismus.

Lösung: Kleinere Testkollektion ("test") als Ziel gewählt.

### Bewertung

Der KaraKeep-native Floccus-Adapter funktioniert out-of-the-box, da
LinkSteward die vollständige KaraKeep-API erbt ohne kritische Änderungen.
Diese Funktionalität war im MVP-Plan als Sprint 4 geplant und wurde früher
als erwartet bestätigt.

### Offene Punkte für intensiveren KaraKeep-Modus-Test

```text
├─ Bookmark erstellen (Browser → Server)
├─ Bookmark umbenennen
├─ URL ändern
├─ Bookmark löschen (Soft-Delete-Verhalten prüfen)
├─ Ordner erstellen
├─ Ordner umbenennen
├─ Ordner verschieben
├─ Ordner löschen
├─ Änderung Server → Browser
├─ Parallele Änderung / Konfliktfall
├─ Chromium/Edge Test
└─ Großer Datensatz (>500 Bookmarks)
```

Dieser intensivere Test ist auf einen späteren Zeitpunkt verschoben.

---

## Linkwarden-Modus – Status

> Stand: 2026-05-14

Implementiert (read-only):
- `GET /api/v1/collections` – liefert manuelle Listen als Linkwarden-Collections
- `GET /api/v1/links` – liefert Link-Bookmarks mit AI-Tag-Filter und URL-Schema-Filter

Noch nicht getestet mit echtem Floccus.

Noch nicht implementiert (für vollständigen Sync nötig):
```text
├─ POST   /api/v1/collections
├─ PATCH  /api/v1/collections/:id
├─ DELETE /api/v1/collections/:id
├─ POST   /api/v1/links
├─ PATCH  /api/v1/links/:id
└─ DELETE /api/v1/links/:id (braucht Soft Delete via linksteward_item_extensions)
```

Offene Fragen (aus linkwarden-analysis-v0.1.md), die nur durch echten Floccus-Test beantwortet werden können:
```text
├─ Wie exakt muss Linkwarden API für Floccus nachgebildet werden?
├─ Welche Felder erwartet Floccus tatsächlich?
└─ Wie werden Tags/Collections gemappt?
```
