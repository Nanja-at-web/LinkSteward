# Backup & Restore v0.1

## Zu sichern

```text
├─ PostgreSQL Datenbank
├─ Asset Storage
├─ Konfiguration / .env
├─ Import-/Export-Dateien optional
└─ Suchindex optional, kann neu aufgebaut werden
```

## Nicht zwingend zu sichern

```text
├─ Meilisearch Index, wenn Reindex möglich
├─ Ollama Modelle, falls neu ladbar
└─ temporäre Dateien
```

## Backup-Strategie

```text
1. App/Worker kurz pausieren oder konsistenten DB-Dump verwenden
2. PostgreSQL Dump erstellen
3. Asset-Verzeichnis sichern
4. .env sichern
5. Backup verschlüsselt speichern
6. Restore regelmäßig testen
```

## Vor riskanten Aktionen empfehlen

```text
├─ große Importe
├─ Duplikat-Merge in Masse
├─ Migrationen
├─ Update auf neue Major-Version
└─ Datenmodelländerungen
```
