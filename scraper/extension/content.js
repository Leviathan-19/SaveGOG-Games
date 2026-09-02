// Se ejecuta cuando la página termina de cargar
window.addEventListener("load", () => {
  console.log("GOG Scraper Content Script loaded");
  startPolling();
});

function startPolling() {
  const maxAttempts = 30; // Máximo 30 segundos de espera
  let attempts = 0;

  const intervalId = setInterval(() => {
    attempts++;
    const links = extractLinks();
    
    // Si encontramos al menos un enlace o si superamos el límite de tiempo
    if (links.length > 0 || attempts >= maxAttempts) {
      clearInterval(intervalId);
      
      console.log(`Búsqueda finalizada en intento ${attempts}. Enlaces encontrados:`, links);

      // Enviar los enlaces al background script
      chrome.runtime.sendMessage({
        action: "links_found",
        links: links
      });
    }
  }, 1000); // Revisar cada 1 segundo (1000 ms)
}

function extractLinks() {
  const foundLinks = new Set();
  
  // Buscar en todo el HTML y texto de la página usando Regex
  const pageContent = document.body.innerHTML + " " + document.body.innerText;
  
  // Expresión regular genérica para atrapar URLs
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  const matches = pageContent.match(urlRegex) || [];

  const validDomains = [
    "1fichier.com", "gofile.io", "pixeldrain.com", "fileq.net", 
    "multiup.org", "qiwi.gg", "fileditchstuff.me" // añadido fileditchstuff.me
  ];

  for (let url of matches) {
    // Limpiar posibles caracteres extra pegados al final
    url = url.replace(/[\\)"\]]+$/, "");
    
    // Verificar si pertenece a alguno de los dominios válidos
    const isValid = validDomains.some(domain => url.includes(domain));
    if (isValid) {
      foundLinks.add(url);
    }
  }
  
  return Array.from(foundLinks);
}
