# Update Guide v0.1

## Ziel

Updates sollen reproduzierbar, dokumentiert und sicher sein.

## Docker Update

```text
1. Backup erstellen
2. Release Notes lesen
3. docker compose pull
4. docker compose down
5. docker compose up -d
6. Migrationen prüfen
7. Logs prüfen
8. Smoke Test ausführen
```

## Proxmox Update später

```text
1. Backup/Snapshot erstellen
2. Update-Script ausführen
3. Services neu starten
4. Logs prüfen
5. LinkSteward öffnen
6. Floccus-Sync testen
```

## Smoke Tests

```text
├─ Login
├─ API Key gültig
├─ Item-Liste lädt
├─ Link speichern
├─ Archivjob startet
├─ Suche funktioniert
├─ Floccus-Verbindungstest
└─ Worker läuft
```
