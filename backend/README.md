# DungeonMaster Backend

Dieses Backend stellt eine einfache JSON-API bereit, um den Zustand des DungeonMaster-Tools zu speichern und wieder abzurufen.

## Starten

```bash
npm install
npm run start
```

Standardmäßig läuft der Server auf Port `8080`. Du kannst den Port mit `PORT=5000 npm run start` anpassen.

## API

- `GET /health` → Statuscheck
- `GET /state` → aktuellen Zustand abrufen
- `PUT /state` → Zustand überschreiben (JSON Body)
