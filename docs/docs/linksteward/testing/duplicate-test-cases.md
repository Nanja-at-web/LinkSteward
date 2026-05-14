# Duplicate Test Cases v0.1

## URL-Duplikate

```text
https://example.com
https://example.com/

http://example.com
https://example.com

https://www.example.com
https://example.com

https://example.com/page?utm_source=test
https://example.com/page

https://example.com/page?fbclid=abc
https://example.com/page
```

## Tests

```text
├─ exakte URL erkennen
├─ normalisierte URL erkennen
├─ Tracking-Parameter ignorieren
├─ trailing slash behandeln
├─ http/https Varianten markieren
├─ DuplicateGroup erstellen
├─ False Positive markieren
├─ Ignore speichern
├─ Merge Preview anzeigen
├─ Tags zusammenführen
├─ Collections zusammenführen
├─ Assets erhalten
└─ alte Items in Papierkorb
```

## Sicherheitsregeln

```text
├─ nie automatisch löschen
├─ nie ohne Vorschau mergen
├─ Merge protokollieren
└─ Wiederherstellung/Papierkorb ermöglichen
```
