# Import/Export Test Cases v0.1

## Browser HTML Import

```text
Testfälle
├─ einfache bookmarks.html mit 10 Links
├─ verschachtelte Ordner
├─ leere Ordner
├─ doppelte Links
├─ Links mit Tags, falls Format vorhanden
├─ nicht unterstützte URL-Schemata
├─ Umlaute/Sonderzeichen
└─ große Datei mit 1.000+ Links
```

## Browser HTML Export

```text
Testfälle
├─ Themenbaum exportieren
├─ Domainbaum exportieren
├─ Thema → Domain Export
├─ Primärkategorie als Ordner
├─ Mehrfachzuordnung primary_only
├─ Export in Firefox importieren
├─ Export in Chrome importieren
└─ Sonderzeichen prüfen
```

## Akzeptanzkriterien

```text
├─ Ordnerstruktur bleibt erhalten
├─ Links bleiben korrekt
├─ Titel bleiben korrekt
├─ Duplikate werden markiert
├─ Exportdatei ist browserkompatibel
└─ Import/Export blockiert UI nicht
```
