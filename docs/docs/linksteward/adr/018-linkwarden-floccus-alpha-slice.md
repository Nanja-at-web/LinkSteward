# ADR 018 - Linkwarden-compatible API and Floccus Linkwarden mode as first alpha slice

## Status

Accepted

## Kontext

Das wichtigste technische Ziel fuer LinkSteward v0.1-alpha ist ein kleiner, nachweisbarer Browser-Bookmark-Sync. Die finale Analyse priorisiert dafuer die Linkwarden-kompatible API und Floccus im Linkwarden-Modus.

KaraKeep bleibt technische Basis, aber der KaraKeep-Floccus-Modus wird nicht als erster Weg gewaehlt. Der Alpha-Slice soll zuerst einen kompatiblen Pfad pruefen, der fuer Floccus bereits als Integrationsziel existiert.

## Entscheidung

- Der erste Alpha-Slice ist die Linkwarden-kompatible API.
- Primaerer Test ist Floccus im Linkwarden-Modus.
- Der KaraKeep-Floccus-Modus kommt spaeter.
- Ziel ist echter Browser-Bookmark-Sync mit:
  - Collections
  - Links
  - bidirektionalen Aenderungen
  - keinen Datenverlusten bei Loeschungen
  - Filterung von Nicht-URL-Items aus Kompatibilitaets-APIs

## Konsequenzen

Die erste Alpha-Implementierung konzentriert sich auf Linkwarden-kompatible Endpunkte, Authentifizierung mit API-Key/Bearer-Token und die fuer Floccus relevanten Datenfluesse. Collections und Links muessen so abgebildet werden, dass Floccus Ordner und Bookmarks synchronisieren kann.

Nicht-URL-Items duerfen in den Kompatibilitaets-APIs nicht als Browser-Bookmarks erscheinen. AI-generierte Tags und KaraKeep-spezifische Item-Typen muessen fuer die Alpha ausgeblendet oder nur read-only behandelt werden, sofern sie den Linkwarden-Kompatibilitaetspfad stoeren wuerden.

## Vorteile

- Der Alpha-Scope ist klar und praktisch testbar.
- Floccus im Linkwarden-Modus liefert ein konkretes Integrationsziel.
- LinkSteward kann frueh beweisen, dass bidirektionaler Browser-Sync funktioniert.
- Die Entscheidung vermeidet einen breiten KaraKeep-Floccus-Modus als ersten Schritt.
- Nicht-URL-Filterung schuetzt die Kompatibilitaets-API vor KaraKeep-spezifischen Item-Typen.

## Nachteile / Risiken

- Linkwarden-Kompatibilitaet muss exakt genug sein, damit Floccus zuverlaessig funktioniert.
- Nicht dokumentierte Floccus-Erwartungen koennen erst im realen Sync sichtbar werden.
- Der KaraKeep-Floccus-Modus wird bewusst verschoben.
- Bidirektionale Aenderungen und Loeschungen bleiben die riskantesten Teile des Alpha-Slices.
- Es kann Mapping-Logik noetig werden, um externe IDs und KaraKeep-Items stabil zu verbinden.

## Review-Gate / spaetere Neubewertung

Der Alpha-Slice wird nach dem ersten erfolgreichen Floccus-Sync bewertet. Erfolgreich bedeutet mindestens: Floccus verbindet sich mit API-Key/Bearer-Token, Browser-Ordner erscheinen als Collections, Browser-Bookmarks erscheinen als Links, Aenderungen an Titel, URL und Collection laufen bidirektional, Nicht-URL-Items werden gefiltert und Loeschungen verursachen keinen irreversiblen Datenverlust.

Erst nach diesem Review wird entschieden, ob der KaraKeep-Floccus-Modus, weitere Linkwarden-Endpunkte oder tiefere Schema-Erweiterungen priorisiert werden.

## Bezug zur finalen Analyse

Diese ADR basiert auf `docs/docs/linksteward/analysis/karakeep-analysis-v0.1.md`. Die finale Analyse nennt als belastbarste v0.1-alpha-Entscheidung: Linkwarden-kompatible API zuerst, Floccus im Linkwarden-Modus zuerst testen und KaraKeep-Floccus-Modus spaeter. `AGENTS.md` fuehrt dieselben Punkte als verbindliche Alpha-Regeln.
