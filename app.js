const state = {
  entries: [],
  monsters: [],
  players: [],
  notes: "",
  chatLog: "",
};

const fixedUrls = {
  foundry: "https://dnd.tavacloud.com/join",
  gpt: "https://chat.openai.com/g/gpt-dungeonmaster",
};

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
  foundryFrame: getEl("foundry-frame"),
  gptFrame: getEl("gpt-frame"),
  liveNotes: getEl("live-notes"),
  chatLog: getEl("chat-log"),
  entryCount: document.querySelector("[data-stat='entries']"),
  monsterCount: document.querySelector("[data-stat='monsters']"),
  playerCount: document.querySelector("[data-stat='players']"),
};

const downloadJson = (data, filename) => {
  const payload = JSON.stringify(data, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const loadJsonFile = (callback) => {
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
        callback(parsed);
      } catch (error) {
        alert("Ungültige JSON-Datei.");
      }
    };
    reader.readAsText(file);
  });
  input.click();
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
    elements.foundryFrame.src = fixedUrls.foundry;
  }
  if (elements.gptFrame) {
    elements.gptFrame.src = fixedUrls.gpt;
  }
};

const renderAll = () => {
  renderEntries();
  renderMonsters();
  renderPlayers();
  applyFrames();
  if (elements.liveNotes) {
    elements.liveNotes.textContent = state.notes || "";
  }
  if (elements.chatLog) {
    elements.chatLog.value = state.chatLog || "";
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

if (elements.entryList) {
  elements.entryList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-remove]");
    if (!button) return;
    const index = Number(button.dataset.remove);
    state.entries.splice(index, 1);
    renderEntries();
  });
}

if (elements.monsterTable) {
  elements.monsterTable.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-remove-monster]");
    if (!button) return;
    const id = button.dataset.removeMonster;
    state.monsters = state.monsters.filter((monster) => monster.id !== id);
    renderMonsters();
  });

  elements.monsterTable.addEventListener("input", (event) => {
    const input = event.target.closest("input[data-hp]");
    if (!input) return;
    const id = input.dataset.hp;
    const monster = state.monsters.find((item) => item.id === id);
    if (monster) {
      monster.hp = input.value;
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
  });
}

if (elements.liveNotes) {
  let notesTimeout;
  elements.liveNotes.addEventListener("input", () => {
    clearTimeout(notesTimeout);
    notesTimeout = setTimeout(() => {
      state.notes = elements.liveNotes.textContent;
    }, 300);
  });
}

if (elements.chatLog) {
  let chatTimeout;
  elements.chatLog.addEventListener("input", () => {
    clearTimeout(chatTimeout);
    chatTimeout = setTimeout(() => {
      state.chatLog = elements.chatLog.value;
    }, 300);
  });
}

if (getEl("export-notes")) {
  getEl("export-notes").addEventListener("click", () => {
    state.notes = elements.liveNotes ? elements.liveNotes.textContent : state.notes;
    downloadJson({ notes: state.notes }, "dungeonmaster-notes.json");
  });
}

if (getEl("import-notes")) {
  getEl("import-notes").addEventListener("click", () => {
    loadJsonFile((parsed) => {
      state.notes = typeof parsed.notes === "string" ? parsed.notes : "";
      renderAll();
    });
  });
}

if (getEl("export-players")) {
  getEl("export-players").addEventListener("click", () => {
    downloadJson({ players: state.players }, "dungeonmaster-players.json");
  });
}

if (getEl("import-players")) {
  getEl("import-players").addEventListener("click", () => {
    loadJsonFile((parsed) => {
      state.players = Array.isArray(parsed.players) ? parsed.players : [];
      renderPlayers();
    });
  });
}

if (getEl("export-chatlog")) {
  getEl("export-chatlog").addEventListener("click", () => {
    state.chatLog = elements.chatLog ? elements.chatLog.value : state.chatLog;
    downloadJson({ chatLog: state.chatLog }, "dungeonmaster-chatlog.json");
  });
}

if (getEl("import-chatlog")) {
  getEl("import-chatlog").addEventListener("click", () => {
    loadJsonFile((parsed) => {
      state.chatLog = typeof parsed.chatLog === "string" ? parsed.chatLog : "";
      renderAll();
    });
  });
}

if (getEl("reset-notes")) {
  getEl("reset-notes").addEventListener("click", () => {
    if (!confirm("Wirklich alle Notizen löschen?")) return;
    state.notes = "";
    renderAll();
  });
}

if (getEl("reset-players")) {
  getEl("reset-players").addEventListener("click", () => {
    if (!confirm("Wirklich alle Spieler löschen?")) return;
    state.players = [];
    renderPlayers();
  });
}

if (getEl("reset-chatlog")) {
  getEl("reset-chatlog").addEventListener("click", () => {
    if (!confirm("Wirklich den Chatlog löschen?")) return;
    state.chatLog = "";
    renderAll();
  });
}

renderAll();
