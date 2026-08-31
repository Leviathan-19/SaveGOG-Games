// Se ejecuta cuando la página termina de cargar
window.addEventListener("load", () => {
  console.log("GOG Scraper Content Script loaded");
  
  // Esperar un poco para que JS dinámico de la página cargue los botones si es necesario
  setTimeout(extractLinks, 5000);
});

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
  
  const linksArray = Array.from(foundLinks);
  console.log("Enlaces encontrados:", linksArray);

  // Enviar los enlaces al background script
  chrome.runtime.sendMessage({
    action: "links_found",
    links: linksArray
  });
}
