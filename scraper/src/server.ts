import express, { type Request, type Response } from "express";
import { chromium, type Browser, type Page } from "playwright";

const app = express();
const port = 3000;

app.use(express.json());

// Endpoint to scrape a https://gog-games.to/
app.post("/scrape", async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  let browser: Browser | null = null;

  try {
    console.log(`[Scraper] Iniciando scraping para: ${url}`);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Ir a la URL
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Aceptar cookies si existe algún banner (ejemplo genérico, se ajustará luego según GOG-Games)
    // await page.click('.cookie-banner-accept-button').catch(() => {});

    // Extraer título de la página
    const title = await page.title();

    // Extraer descripción (meta tag)
    const description = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]');
      return meta ? meta.getAttribute("content") : null;
    });

    // Estos selectores son placehoder, deberemos ajustarlos a la estructura real de GOG-Games
    const gameData = {
      title: title.replace(" - GOG Games", "").trim(),
      url: url,
      description: description,
      // Agregaremos más extractores aquí en el futuro
    };

    console.log(`[Scraper] Scraping exitoso para: ${url}`);
    res.json({ success: true, data: gameData });
  } catch (error: any) {
    console.error(`[Scraper] Error al procesar ${url}:`, error.message);
    res
      .status(500)
      .json({ error: "Error durante el scraping", details: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(port, () => {
  console.log(`[Scraper] API corriendo en http://localhost:${port}`);
});
