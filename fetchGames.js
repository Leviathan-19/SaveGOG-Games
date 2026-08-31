const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://gog-games.to/api/web/all-games?select=id,slug,title';
const outputFile = path.join(__dirname, 'gog_games_list.json');

console.log(`Realizando petición GET a ${url}...`);

https.get(url, (res) => {
    let data = '';

    // Recibir los fragmentos de datos
    res.on('data', (chunk) => {
        data += chunk;
    });

    // Todo el contenido ha sido recibido
    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const games = JSON.parse(data);
                
                // Mapear solo los 3 campos por seguridad, aunque la API ya filtra
                const filteredGames = games.map(game => ({
                    id: game.id,
                    slug: game.slug,
                    title: game.title
                }));

                fs.writeFileSync(outputFile, JSON.stringify(filteredGames, null, 2));
                console.log(`\n¡Éxito! Archivo guardado en: ${outputFile}`);
                console.log(`Total de juegos guardados: ${filteredGames.length}`);
            } catch (error) {
                console.error('Error al parsear el JSON:', error.message);
            }
        } else {
            console.error(`Error en la petición: Código de estado ${res.statusCode}`);
        }
    });

}).on('error', (err) => {
    console.error('Error de conexión:', err.message);
});
