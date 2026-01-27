import express from "express";
import cors from "cors";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const stateFile = path.join(dataDir, "state.json");

const defaultState = {
  entries: [],
  monsters: [],
  players: [],
  foundryUrl: "",
  gptUrl: "",
  notes: "",
};

const ensureStorage = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(stateFile);
  } catch {
    await fs.writeFile(stateFile, JSON.stringify(defaultState, null, 2));
  }
};

const readState = async () => {
  await ensureStorage();
  const raw = await fs.readFile(stateFile, "utf8");
  return JSON.parse(raw);
};

const writeState = async (payload) => {
  await ensureStorage();
  const nextState = {
    ...defaultState,
    ...payload,
  };
  await fs.writeFile(stateFile, JSON.stringify(nextState, null, 2));
  return nextState;
};

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/state", async (req, res, next) => {
  try {
    const state = await readState();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

app.put("/state", async (req, res, next) => {
  try {
    const updated = await writeState(req.body || {});
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error("Backend error:", error);
  res.status(500).json({ error: "Internal server error" });
});

ensureStorage()
  .then(() => {
    app.listen(port, () => {
      console.log(`DungeonMaster backend listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start backend:", error);
    process.exit(1);
  });
