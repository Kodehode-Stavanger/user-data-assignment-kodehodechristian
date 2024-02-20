document.addEventListener("DOMContentLoaded", () => {
  // Element setup for both players and monsters
  const playerSetup = {
    form: document.getElementById("initiativeFormPlayers"),
    list: document.getElementById("initiativeListPlayers"),
    rerollButton: document.getElementById("rerollPlayersButton"),
    clearButton: document.getElementById("clearAllPlayersButton"),
    input: document.getElementById("playerName"),
    storageKey: "playerInitiatives",
    type: "player", // Added to distinguish between players and monsters
  };

  const monsterSetup = {
    form: document.getElementById("initiativeFormMonsters"),
    list: document.getElementById("initiativeListMonsters"),
    rerollButton: document.getElementById("rerollMonstersButton"),
    clearButton: document.getElementById("clearAllMonstersButton"),
    input: document.getElementById("numberOfMonsters"),
    storageKey: "monsterInitiatives",
    type: "Monster", // Added to distinguish between players and monsters
  };

  let combinedInitiatives = []; // Combined list of players and monsters
  let currentTurnIndex = 0; // Track the current turn index across combined initiatives

  // Utility function to roll initiative
  const initiativeRoller = (numberOfFaces) =>
    Math.floor(Math.random() * numberOfFaces) + 1;

  // Initialize and render initiatives from storage and set up event listeners
  [playerSetup, monsterSetup].forEach((setup) => {
    setup.initiatives = JSON.parse(
      localStorage.getItem(setup.storageKey) || "[]"
    );
    setup.form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleFormSubmit(setup);
      combineAndSortInitiatives();
    });
    setup.rerollButton.addEventListener("click", () => {
      rerollInitiatives(setup);
      combineAndSortInitiatives();
    });
    setup.clearButton.addEventListener("click", () => {
      clearInitiatives(setup);
      combineAndSortInitiatives();
    });
  });

  document.getElementById("nextTurn").addEventListener("click", nextTurn);

  function handleFormSubmit(setup) {
    const input = setup.input.value.trim();
    if (setup.type === "Monster") {
      // For monsters
      const count = parseInt(input, 10);
      setup.initiatives = Array.from({ length: count }, (_, i) => ({
        name: `${setup.type} ${i + 1}`,
        value: initiativeRoller(20),
        type: setup.type,
      }));
    } else {
      // For players
      const names = input.split(",").map((name) => name.trim());
      setup.initiatives = names.map((name) => ({
        name,
        value: initiativeRoller(20),
        type: setup.type,
      }));
    }
    saveToStorage(setup);
    setup.input.value = ""; // Clear input field
  }

  function rerollInitiatives(setup) {
    setup.initiatives.forEach(
      (initiative) => (initiative.value = initiativeRoller(20))
    );
    saveToStorage(setup);
  }

  function clearInitiatives(setup) {
    setup.initiatives = [];
    saveToStorage(setup);
  }

  function saveToStorage(setup) {
    localStorage.setItem(setup.storageKey, JSON.stringify(setup.initiatives));
  }

  function combineAndSortInitiatives() {
    // Combine player and monster initiatives
    combinedInitiatives = [
      ...playerSetup.initiatives.map((i) => ({ ...i, list: playerSetup.list })),
      ...monsterSetup.initiatives.map((i) => ({
        ...i,
        list: monsterSetup.list,
      })),
    ];

    // Sort by value, then by type to prioritize players in case of a tie
    combinedInitiatives.sort(
      (a, b) => b.value - a.value || (a.type === "player" ? -1 : 1)
    );

    // Reset the current turn index and render the combined list
    currentTurnIndex = 0;
    renderCombinedList();
  }

  function renderCombinedList() {
    // Clear existing lists
    playerSetup.list.textContent = "";
    monsterSetup.list.textContent = "";

    // Render combined list items
    combinedInitiatives.forEach(({ name, value, list }, index) => {
      const li = document.createElement("li");
      li.textContent = `${name}: ${value}`;
      if (index === currentTurnIndex) {
        li.style.backgroundColor = "lightgreen"; // Highlight the current turn
      } else if (index < currentTurnIndex) {
        li.style.textDecoration = "line-through";
        li.style.opacity = "50%";
      }
      list.append(li);
    });
  }

  function nextTurn() {
    const totalItems = combinedInitiatives.length;
    currentTurnIndex = (currentTurnIndex + 1) % totalItems;
    // Determine if the next increment will loop back to the start
    if (currentTurnIndex === totalItems - 1) {
      // If it's the last turn, prepare to restart the cycle on the next click
      document.getElementById("nextTurn").textContent =
        "Last one attacking. Click to restart turn";
    } else if (currentTurnIndex === 0) {
      document.getElementById("nextTurn").textContent = "Next player/monster";
    }

    // Increment the turn index with wrapping

    // Check if the cycle has restarted to reset button text

    renderCombinedList();
  }
});
