import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajustar rutas según estructura real
const listPath = path.resolve(__dirname, "../listado/gog_games_list.json");
const outputPath = path.resolve(__dirname, "../links/Games_with_links.json");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

function readJsonFile(filePath: string, defaultVal: any = []) {
  if (!fs.existsSync(filePath)) return defaultVal;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    return defaultVal;
  }
}

function writeJsonFile(filePath: string, data: any) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.get("/next-game", (req, res) => {
  const allGames = readJsonFile(listPath, []);
  const processedGames = readJsonFile(outputPath, []);
  
  const processedIds = new Set(processedGames.map((g: any) => g.id));
  const pendingGames = allGames.filter((g: any) => !processedIds.has(g.id));
  
  if (pendingGames.length === 0) {
    res.json({ status: "done", message: "All games processed!" });
    return;
  }
  
  const nextGame = pendingGames[0];
  res.json({ status: "ok", game: nextGame, totalPending: pendingGames.length });
});

app.post("/save-game", (req, res) => {
  const { id, slug, title, links } = req.body;
  if (!id || !title) {
    res.status(400).json({ error: "Invalid data" });
    return;
  }
  
  const processedGames = readJsonFile(outputPath, []);
  
  const exists = processedGames.some((g: any) => g.id === id);
  if (!exists) {
    processedGames.push({
      id,
      slug,
      title,
      links: links && links.length > 0 ? links : [null]
    });
    writeJsonFile(outputPath, processedGames);
    console.log(`Guardado: ${title} (${links.length} links)`);
  } else {
    console.log(`Omitido (ya existe): ${title}`);
  }
  
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Servidor local corriendo en http://localhost:${PORT}`);
  console.log("Esperando conexiones desde la extensión de navegador...");
});
