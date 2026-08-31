document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const statusDiv = document.getElementById("status");

  // Actualizar UI al abrir el popup
  chrome.runtime.sendMessage({ action: "status" }, (response) => {
    if (response) {
      updateUI(response.isScraping, response.currentGame);
    }
  });

  startBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "start" }, (response) => {
      updateUI(true, null);
    });
  });

  stopBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "stop" }, (response) => {
      updateUI(false, null);
    });
  });

  function updateUI(isScraping, currentGame) {
    if (isScraping) {
      statusDiv.innerHTML = `Estado: <b>Ejecutando</b><br>Procesando: ${currentGame ? currentGame.title : '...'}`;
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      statusDiv.innerHTML = `Estado: <b>Detenido</b>`;
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  }
});
