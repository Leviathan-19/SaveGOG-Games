let isScraping = false;
let currentTabId = null;
let currentGame = null;

// Escuchar mensajes del popup o del content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
    isScraping = true;
    processNextGame();
    sendResponse({ status: "started" });
  } else if (message.action === "stop") {
    isScraping = false;
    sendResponse({ status: "stopped" });
  } else if (message.action === "status") {
    sendResponse({ isScraping, currentGame });
  } else if (message.action === "links_found") {
    // Recibimos los enlaces del content script
    if (isScraping && currentGame && sender.tab && sender.tab.id === currentTabId) {
      saveGameData(currentGame, message.links)
        .then(() => {
          chrome.tabs.remove(currentTabId);
          currentTabId = null;
          // Pequeña pausa antes de abrir el siguiente para no saturar
          setTimeout(processNextGame, 2000);
        })
        .catch(console.error);
    }
  }
});

async function processNextGame() {
  if (!isScraping) return;

  try {
    const response = await fetch("http://localhost:3000/next-game");
    const data = await response.json();

    if (data.status === "done") {
      isScraping = false;
      console.log("Proceso finalizado");
      return;
    }

    currentGame = data.game;
    const url = `https://gog-games.to/game/${currentGame.slug}`;
    console.log(`Procesando: ${currentGame.title}`);

    chrome.tabs.create({ url, active: false }, (tab) => {
      currentTabId = tab.id;
    });

  } catch (error) {
    console.error("Error al obtener el siguiente juego. ¿Está el servidor Node corriendo?", error);
    isScraping = false;
  }
}

async function saveGameData(game, links) {
  try {
    await fetch("http://localhost:3000/save-game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: game.id,
        slug: game.slug,
        title: game.title,
        links: links,
      }),
    });
  } catch (error) {
    console.error("Error guardando el juego:", error);
  }
}
