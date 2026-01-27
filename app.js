const state = {
  entries: [],
  monsters: [],
  players: [],
  foundryUrl: "",
  gptUrl: "",
  notes: "",
};

const storageKey = "dungeonmaster-tool";

const getEl = (id) => document.getElementById(id);

const elements = {
  entryList: getEl("entry-list"),
  entryType: getEl("entry-type"),
  entryTitle: getEl("entry-title"),
  entryTags: getEl("entry-tags"),
  entryBody: getEl("entry-body"),
  monsterTable: document.querySelector("#monster-table tbody"),
  monsterName: getEl("monster-name"),
  monsterAc: getEl("monster-ac"),
  monsterHp: getEl("monster-hp"),
  monsterHpMax: getEl("monster-hp-max"),
  monsterInit: getEl("monster-init"),
  monsterNotes: getEl("monster-notes"),
  playerTable: document.querySelector("#player-table tbody"),
  playerName: getEl("player-name"),
  playerClass: getEl("player-class"),
  playerHp: getEl("player-hp"),
  playerAc: getEl("player-ac"),
  playerNotes: getEl("player-notes"),
  foundryUrl: getEl("foundry-url"),
  foundryFrame: getEl("foundry-frame"),
  gptUrl: getEl("gpt-url"),
  gptFrame: getEl("gpt-frame"),
  liveNotes: getEl("live-notes"),
  entryCount: document.querySelector("[data-stat='entries']"),
  monsterCount: document.querySelector("[data-stat='monsters']"),
  playerCount: document.querySelector("[data-stat='players']"),
};

const saveState = () => {
  if (elements.liveNotes) {
    state.notes = elements.liveNotes.innerHTML;
  }
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const loadState = () => {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);
    } catch (error) {
      console.warn("Konnte gespeicherten Zustand nicht laden", error);
    }
  }
};

const updateStats = () => {
  if (elements.entryCount) {
    elements.entryCount.textContent = String(state.entries.length);
  }
  if (elements.monsterCount) {
    elements.monsterCount.textContent = String(state.monsters.length);
  }
  if (elements.playerCount) {
    elements.playerCount.textContent = String(state.players.length);
  }
};

const renderEntries = () => {
  if (!elements.entryList) return;
  elements.entryList.innerHTML = "";
  state.entries.forEach((entry, index) => {
    const item = document.createElement("div");
    item.className = "list-item";

    const title = document.createElement("strong");
    const type = document.createElement("span");
    type.className = "pill";
    type.textContent = entry.type;
    title.append(entry.title + " ");
    title.appendChild(type);

    const tags = document.createElement("div");
    tags.className = "small";
    tags.textContent = entry.tags.join(", ") || "Keine Verlinkungen";

    const body = document.createElement("div");
    body.textContent = entry.body;

    const removeButton = document.createElement("button");
    removeButton.className = "secondary";
    removeButton.dataset.remove = String(index);
    removeButton.textContent = "Entfernen";

    item.append(title, tags, body, removeButton);
    elements.entryList.appendChild(item);
  });
  updateStats();
};

const renderMonsters = () => {
  if (!elements.monsterTable) return;
  elements.monsterTable.innerHTML = "";
  const sorted = [...state.monsters].sort((a, b) => Number(b.init) - Number(a.init));
  sorted.forEach((monster) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = monster.name;

    const initCell = document.createElement("td");
    initCell.textContent = monster.init;

    const hpCell = document.createElement("td");
    const hpInput = document.createElement("input");
    hpInput.dataset.hp = monster.id;
    hpInput.value = monster.hp;
    hpCell.appendChild(hpInput);

    const hpMaxCell = document.createElement("td");
    hpMaxCell.textContent = monster.hpMax;

    const acCell = document.createElement("td");
    acCell.textContent = monster.ac;

    const notesCell = document.createElement("td");
    notesCell.textContent = monster.notes;

    const removeCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.className = "danger";
    removeButton.dataset.removeMonster = monster.id;
    removeButton.textContent = "X";
    removeCell.appendChild(removeButton);

    row.append(nameCell, initCell, hpCell, hpMaxCell, acCell, notesCell, removeCell);
    elements.monsterTable.appendChild(row);
  });
  updateStats();
};

const renderPlayers = () => {
  if (!elements.playerTable) return;
  elements.playerTable.innerHTML = "";
  state.players.forEach((player) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = player.name;

    const classCell = document.createElement("td");
    classCell.textContent = player.class;

    const hpCell = document.createElement("td");
    hpCell.textContent = player.hp;

    const acCell = document.createElement("td");
    acCell.textContent = player.ac;

    const notesCell = document.createElement("td");
    notesCell.textContent = player.notes;

    const removeCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.className = "danger";
    removeButton.dataset.removePlayer = player.id;
    removeButton.textContent = "X";
    removeCell.appendChild(removeButton);

    row.append(nameCell, classCell, hpCell, acCell, notesCell, removeCell);
    elements.playerTable.appendChild(row);
  });
  updateStats();
};

const applyFrames = () => {
  if (elements.foundryFrame) {
    elements.foundryFrame.src = state.foundryUrl || "about:blank";
  }
  if (elements.gptFrame) {
    elements.gptFrame.src = state.gptUrl || "about:blank";
  }
  if (elements.foundryUrl) {
    elements.foundryUrl.value = state.foundryUrl;
  }
  if (elements.gptUrl) {
    elements.gptUrl.value = state.gptUrl;
  }
};

const renderAll = () => {
  renderEntries();
  renderMonsters();
  renderPlayers();
  applyFrames();
  if (elements.liveNotes) {
    elements.liveNotes.innerHTML = state.notes || "";
  }
  updateStats();
};

const addEntry = () => {
  if (!elements.entryTitle) return;
  const title = elements.entryTitle.value.trim();
  if (!title) return;
  state.entries.unshift({
    type: elements.entryType.value,
    title,
    tags: elements.entryTags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    body: elements.entryBody.value.trim(),
  });
  elements.entryTitle.value = "";
  elements.entryTags.value = "";
  elements.entryBody.value = "";
  renderEntries();
  saveState();
};

const addMonster = () => {
  if (!elements.monsterName) return;
  const name = elements.monsterName.value.trim();
  if (!name) return;
  state.monsters.push({
    id: crypto.randomUUID(),
    name,
    ac: elements.monsterAc.value.trim(),
    hp: elements.monsterHp.value.trim(),
    hpMax: elements.monsterHpMax.value.trim(),
    init: elements.monsterInit.value.trim(),
    notes: elements.monsterNotes.value.trim(),
  });
  elements.monsterName.value = "";
  elements.monsterAc.value = "";
  elements.monsterHp.value = "";
  elements.monsterHpMax.value = "";
  elements.monsterInit.value = "";
  elements.monsterNotes.value = "";
  renderMonsters();
  saveState();
};

const addPlayer = () => {
  if (!elements.playerName) return;
  const name = elements.playerName.value.trim();
  if (!name) return;
  state.players.push({
    id: crypto.randomUUID(),
    name,
    class: elements.playerClass.value.trim(),
    hp: elements.playerHp.value.trim(),
    ac: elements.playerAc.value.trim(),
    notes: elements.playerNotes.value.trim(),
  });
  elements.playerName.value = "";
  elements.playerClass.value = "";
  elements.playerHp.value = "";
  elements.playerAc.value = "";
  elements.playerNotes.value = "";
  renderPlayers();
  saveState();
};

if (getEl("add-entry")) {
  getEl("add-entry").addEventListener("click", addEntry);
}
if (getEl("add-monster")) {
  getEl("add-monster").addEventListener("click", addMonster);
}
if (getEl("add-player")) {
  getEl("add-player").addEventListener("click", addPlayer);
}

if (getEl("save-foundry")) {
  getEl("save-foundry").addEventListener("click", () => {
    state.foundryUrl = elements.foundryUrl.value.trim();
    applyFrames();
    saveState();
  });
}

if (getEl("save-gpt")) {
  getEl("save-gpt").addEventListener("click", () => {
    state.gptUrl = elements.gptUrl.value.trim();
    applyFrames();
    saveState();
  });
}

if (elements.entryList) {
  elements.entryList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-remove]");
    if (!button) return;
    const index = Number(button.dataset.remove);
    state.entries.splice(index, 1);
    renderEntries();
    saveState();
  });
}

if (elements.monsterTable) {
  elements.monsterTable.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-remove-monster]");
    if (!button) return;
    const id = button.dataset.removeMonster;
    state.monsters = state.monsters.filter((monster) => monster.id !== id);
    renderMonsters();
    saveState();
  });

  elements.monsterTable.addEventListener("input", (event) => {
    const input = event.target.closest("input[data-hp]");
    if (!input) return;
    const id = input.dataset.hp;
    const monster = state.monsters.find((item) => item.id === id);
    if (monster) {
      monster.hp = input.value;
      saveState();
    }
  });
}

if (elements.playerTable) {
  elements.playerTable.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-remove-player]");
    if (!button) return;
    const id = button.dataset.removePlayer;
    state.players = state.players.filter((player) => player.id !== id);
    renderPlayers();
    saveState();
  });
}

if (elements.liveNotes) {
  let notesTimeout;
  elements.liveNotes.addEventListener("input", () => {
    clearTimeout(notesTimeout);
    notesTimeout = setTimeout(saveState, 300);
  });
}

if (getEl("export-data")) {
  getEl("export-data").addEventListener("click", () => {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dungeonmaster-data.json";
    link.click();
    URL.revokeObjectURL(url);
  });
}

if (getEl("import-data")) {
  getEl("import-data").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          Object.assign(state, parsed);
          renderAll();
          saveState();
        } catch (error) {
          alert("Ungültige JSON-Datei.");
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });
}

if (getEl("reset-data")) {
  getEl("reset-data").addEventListener("click", () => {
    if (!confirm("Wirklich alles löschen?")) return;
    state.entries = [];
    state.monsters = [];
    state.players = [];
    state.notes = "";
    state.foundryUrl = "";
    state.gptUrl = "";
    renderAll();
    saveState();
  });
}

loadState();
renderAll();
