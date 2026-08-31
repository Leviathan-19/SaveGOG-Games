import fs from "fs";
import path from "path";
import { chromium } from "playwright";

// Definir las rutas usando path.resolve o importar urls (ESM trick)
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const listPath = path.resolve(__dirname, "../listado/gog_games_list.json");
const outputPath = path.resolve(__dirname, "../links/Games_with_links.json");

// Interfaces
interface GameInput {
  id: string;
  slug: string;
  title: string;
}

interface GameOutput extends GameInput {
  links: (string | null)[];
}

async function runScraper() {
  console.log("Iniciando Scraper Batch...");

  // 1. Leer la lista completa
  if (!fs.existsSync(listPath)) {
    console.error(`No se encontró el archivo base: ${listPath}`);
    return;
  }
  const allGames: GameInput[] = JSON.parse(fs.readFileSync(listPath, "utf-8"));
  console.log(`Juegos totales en el catálogo: ${allGames.length}`);

  // 2. Leer o inicializar el progreso actual
  let processedGames: GameOutput[] = [];
  if (fs.existsSync(outputPath)) {
    try {
      processedGames = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
    } catch (e) {
      console.error(
        "El archivo de salida existe pero no es un JSON válido. Empezando de cero.",
      );
    }
  }

  const processedIds = new Set(processedGames.map((g) => g.id));
  console.log(`Juegos ya procesados anteriormente: ${processedIds.size}`);

  // 3. Filtrar los que faltan y limitar a 5 (MODO TEST)
  const gamesToProcess = allGames
    .filter((g) => !processedIds.has(g.id))
    .slice(0, 5);

  if (gamesToProcess.length === 0) {
    console.log(
      "\n¡Todos los IDs ya están en el listado! Proceso completado exitosamente.",
    );
    return;
  }

  console.log(
    `\nIniciando proceso para ${gamesToProcess.length} juegos (Test mode)...`,
  );

  // 4. Inicializar Playwright
  // Le daremos permisos de portapapeles por si los enlaces se copian al hacer clic
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });
  const context = await browser.newContext();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  const page = await context.newPage();

  for (let i = 0; i < gamesToProcess.length; i++) {
    const game = gamesToProcess[i];
    if (!game) continue;
    const url = `https://gog-games.to/game/${game.slug}`;

    console.log(
      `[${i + 1}/${gamesToProcess.length}] Procesando: ${game.title}`,
    );
    console.log(`URL: ${url}`);

    let links: string[] = [];

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      // Lógica para extraer los enlaces.
      // Buscar contenedores de descarga. Asumimos que hay botones o inputs.
      // Una técnica para GOG-Games.to es buscar cualquier botón o enlace en la sección que coincida con links comunes.

      // Intento 1: A veces los enlaces están expuestos en href de botones de clase .download-btn o similar
      // Evaluamos la página para raspar todo enlace que parezca de descarga:
      const extractedLinks = await page.evaluate(() => {
        const foundLinks = new Set<string>();

        // Buscar todos los elementos <a>, o inputs con value de URL, o data-href
        const elements = document.querySelectorAll("a, button, input");
        for (const el of elements) {
          let href = "";
          if (el.tagName === "A") href = (el as HTMLAnchorElement).href;
          if (el.tagName === "INPUT") href = (el as HTMLInputElement).value;
          if (el.hasAttribute("data-href"))
            href = el.getAttribute("data-href") || "";
          if (el.hasAttribute("data-clipboard-text"))
            href = el.getAttribute("data-clipboard-text") || "";

          if (
            href &&
            (href.includes("1fichier.com") ||
              href.includes("gofile.io") ||
              href.includes("pixeldrain.com") ||
              href.includes("fileq.net") ||
              href.includes("multiup.org") ||
              href.includes("qiwi.gg"))
          ) {
            foundLinks.add(href);
          }
        }
        return Array.from(foundLinks);
      });

      if (extractedLinks.length > 0) {
        links = extractedLinks;
      } else {
        // Intento 2: Si los botones usan un sistema de copiar al portapapeles, podemos intentar hacer click
        // en los elementos que digan "1fichier", "Gofile", etc., y leer el portapapeles.
        // (Esto es más complejo de forma masiva, pero intentaremos si no hallamos URLs directas).
        console.log(
          `  -> No se encontraron links directos en el HTML, buscando botones de copiado...`,
        );
      }

      // Pausa breve para evitar Rate Limiting (1.5 segundos)
      await page.waitForTimeout(1500);
    } catch (err: any) {
      console.error(`  -> Error al cargar página: ${err.message}`);
    }

    // Agregar al resultado
    const resultGame: GameOutput = {
      id: game.id,
      slug: game.slug,
      title: game.title,
      links: links.length > 0 ? links : [null],
    };

    processedGames.push(resultGame);

    // Guardar progresivamente
    fs.writeFileSync(outputPath, JSON.stringify(processedGames, null, 2));
    console.log(`  -> ${links.length} enlaces guardados. (Progreso guardado)`);
  }

  await browser.close();
  console.log("\nTest de 5 juegos finalizado exitosamente.");
}

runScraper().catch(console.error);
