# GOG Games Preservation Scraper

> Proyecto experimental de automatización web orientado a la **catalogación y preservación de información pública sobre videojuegos** disponibles en sitios web que puedan desaparecer.

## 📌 Descripción

Este proyecto nace a partir de la posibilidad de que **GOG-Games**, un sitio independiente y no relacionado oficialmente con GOG.com, deje de estar disponible.

El objetivo principal del proyecto es crear una herramienta capaz de recorrer y catalogar automáticamente la información pública disponible sobre los videojuegos publicados en el sitio, con especial interés en la preservación histórica del catálogo.

La idea es evitar que, ante la desaparición de un sitio web, se pierda completamente la información asociada a su catálogo.

> **Importante:** este proyecto se plantea como una herramienta de investigación, automatización y preservación de metadatos. No pretende redistribuir videojuegos, cracks, contenido protegido ni facilitar la descarga no autorizada de material protegido por derechos de autor.

---

# 🎯 Objetivos

## Objetivo principal

Desarrollar un scraper automatizado capaz de:

1. Recorrer el catálogo de videojuegos.
2. Detectar las páginas individuales de cada videojuego.
3. Extraer información pública.
4. Almacenar los datos estructuradamente.
5. Evitar registros duplicados.
6. Mantener un historial de cambios.
7. Permitir continuar el proceso después de una interrupción.
8. Generar estadísticas sobre el catálogo.
9. Facilitar posteriormente la migración de los metadatos a un sistema de preservación.

## Información que podría recopilarse

Por cada videojuego:

```text
Título
URL de la página
Slug
Descripción
Fecha de publicación
Versión
Desarrollador
Publisher
Géneros
Plataforma
Idioma
Tamaño publicado
Imagen/portada
Screenshots
Identificadores disponibles
Fecha de extracción
Estado de la página
```

La información relacionada con descargas deberá tratarse únicamente dentro de los límites permitidos por los derechos de autor, términos de servicio y autorización del propietario del contenido.

---

# 🧠 ¿Por qué utilizar Web Scraping?

El sitio utiliza contenido HTML que puede contener información que no necesariamente está disponible mediante una API pública.

Además, determinadas páginas pueden utilizar:

- JavaScript
- contenido dinámico
- botones interactivos
- paginación
- solicitudes AJAX
- redirecciones
- contenido generado después de cargar la página

Por esta razón, un scraper basado únicamente en HTTP puede no ser suficiente.

Aquí aparecen herramientas como:

- Playwright
- Selenium
- Puppeteer
- Requests/Guzzle
- Cheerio/BeautifulSoup

---

# 🥊 Playwright vs Selenium

## Playwright

Playwright es una herramienta moderna de automatización de navegadores.

Permite controlar:

- Chromium
- Firefox
- WebKit

Además permite trabajar con:

- navegación
- múltiples pestañas
- cookies
- sesiones
- screenshots
- descargas
- interceptación de requests
- eventos del navegador
- ejecución de JavaScript
- esperas automáticas
- contextos independientes

### Ventajas

- API moderna.
- Muy buen manejo de páginas dinámicas.
- Esperas automáticas.
- Buen soporte para múltiples navegadores.
- Excelente manejo de contextos y sesiones.
- Muy cómodo para scraping de sitios modernos.
- Buen soporte para interceptar tráfico de red.

### Desventaja importante para este proyecto

Playwright **no posee actualmente un binding oficial para PHP**.

Sus principales bindings oficiales están orientados a:

```text
Node.js / TypeScript
Python
Java
.NET
```

Por lo tanto, utilizar Playwright directamente desde PHP no sería la opción más natural.

---

# 🕷️ Selenium

Selenium es una de las herramientas más conocidas para automatización de navegadores.

Tiene bindings para múltiples lenguajes y existe soporte para PHP mediante:

```text
php-webdriver
```

Esto permite utilizar una arquitectura completamente basada en PHP.

Ejemplo conceptual:

```text
PHP
 │
 ├── Selenium WebDriver
 │
 └── Chrome / Chromium
```

### Ventajas

- Puede utilizarse desde PHP.
- Ecosistema muy maduro.
- Amplio soporte de navegadores.
- Muchísima documentación.
- Fácil de integrar con aplicaciones PHP existentes.

### Desventajas

- API generalmente más verbosa.
- Algunas tareas modernas de automatización resultan más cómodas en Playwright.
- El manejo de esperas y determinados escenarios dinámicos puede requerir más código.

---

# 🏆 ¿Cuál elegir?

Para este proyecto existen dos alternativas principales.

## Opción A — PHP + Selenium

```text
┌──────────────────────┐
│      Aplicación PHP  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Selenium WebDriver   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Chrome / Chromium    │
└──────────┬───────────┘
           │
           ▼
       Sitio web
```

Esta opción es recomendable si el objetivo principal es aprender:

- PHP
- Selenium
- WebDriver
- automatización web

---

# 🚀 Opción B — PHP + Playwright

Esta sería mi arquitectura preferida si quieres utilizar Playwright.

```text
                 ┌────────────────────┐
                 │       PHP API      │
                 │    / Dashboard     │
                 └─────────┬──────────┘
                           │
                           │ HTTP
                           ▼
                 ┌────────────────────┐
                 │ Playwright Worker  │
                 │ Node.js / TS       │
                 └─────────┬──────────┘
                           │
                           ▼
                    Chromium
                           │
                           ▼
                       Sitio web
                           │
                           ▼
                 ┌────────────────────┐
                 │     PostgreSQL     │
                 └────────────────────┘
```

PHP podría encargarse de:

- API
- autenticación
- administración
- base de datos
- trabajos de scraping
- estadísticas
- dashboard

Mientras que Node.js + Playwright se encargaría exclusivamente de:

- abrir páginas
- navegar
- esperar contenido
- ejecutar JavaScript
- obtener HTML
- extraer metadatos
- detectar cambios

Esta separación permite utilizar la herramienta más apropiada para cada responsabilidad.

---

# 🏗️ Arquitectura propuesta

```text
gog-games-preservation/
│
├── backend/
│   ├── app/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── database/
│
├── scraper/
│   ├── src/
│   │   ├── browser/
│   │   ├── crawlers/
│   │   ├── extractors/
│   │   ├── parsers/
│   │   └── workers/
│   │
│   ├── package.json
│   └── playwright.config.ts
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── storage/
│   └── metadata/
│
├── docker/
│
├── docs/
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

# 🗄️ Base de datos

Inicialmente podría utilizarse PostgreSQL.

Una tabla básica podría ser:

```sql
CREATE TABLE games (
    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    slug VARCHAR(255),

    source_url TEXT NOT NULL,

    description TEXT,

    developer VARCHAR(255),

    publisher VARCHAR(255),

    release_date DATE,

    version VARCHAR(100),

    platform VARCHAR(100),

    language VARCHAR(100),

    size VARCHAR(100),

    cover_url TEXT,

    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(50) DEFAULT 'active'
);
```

Posteriormente podrían añadirse tablas para:

```text
games
developers
publishers
genres
platforms
languages
screenshots
crawl_runs
crawl_errors
game_versions
```

---

# 🔄 Sistema de crawling

El scraper no debería recorrer todo el sitio continuamente.

La idea sería trabajar mediante tareas:

```text
Crawler
   │
   ├── Descubre URLs
   │
   ▼
Queue
   │
   ├── URL 1
   ├── URL 2
   ├── URL 3
   └── URL N
   │
   ▼
Worker
   │
   ├── Abre página
   ├── Extrae información
   ├── Valida información
   └── Guarda resultado
   │
   ▼
PostgreSQL
```

Esto permitiría pausar y continuar el proceso sin comenzar desde cero.

---

# 🧪 Estrategia de scraping

El proyecto debería implementarse por etapas.

## Fase 1 — Descubrimiento

Identificar:

- estructura del sitio
- páginas de categorías
- paginación
- URLs de videojuegos
- estructura HTML
- contenido dinámico

---

## Fase 2 — Extracción

Crear extractores independientes:

```text
GameTitleExtractor
DescriptionExtractor
DeveloperExtractor
PublisherExtractor
VersionExtractor
ImageExtractor
MetadataExtractor
```

Esto evita tener todo el scraper dentro de una única función.

---

## Fase 3 — Persistencia

Guardar los resultados en PostgreSQL.

Cada registro debería tener una identificación que permita detectar:

```text
Nuevo juego
Juego existente
Juego modificado
Juego eliminado
Página inaccesible
Error temporal
```

---

# 🛡️ Manejo responsable

El scraper debería incorporar mecanismos para evitar generar una carga innecesaria:

```text
Rate limiting
Retry controlado
Timeouts
Backoff
Respeto de robots.txt cuando corresponda
Límite de concurrencia
User-Agent identificable
Logging
```

Por ejemplo:

```text
Request
   │
   ▼
¿Disponible?
   │
   ├── NO → Retry
   │
   └── SÍ
        │
        ▼
     Parsear
        │
        ▼
     Guardar
```

No se recomienda realizar cientos de solicitudes simultáneas contra un sitio pequeño.

---

# 📊 Información adicional

Una vez almacenado el catálogo podrían generarse estadísticas como:

```text
Total de videojuegos encontrados
Juegos por año
Juegos por género
Juegos por plataforma
Desarrolladores más frecuentes
Publishers más frecuentes
Tamaño total declarado
Juegos nuevos detectados
Juegos desaparecidos
```

Esto convierte el proyecto en algo más interesante que simplemente un scraper.

---

# 🔐 Variables de entorno

Ejemplo:

```env
APP_ENV=development

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=gog_preservation
DATABASE_USER=postgres
DATABASE_PASSWORD=

SCRAPER_BASE_URL=
SCRAPER_DELAY_MS=2000
SCRAPER_CONCURRENCY=1
```

Las URLs y credenciales reales nunca deberían almacenarse directamente en Git.

---

# 🐳 Docker

Una posible infraestructura sería:

```text
docker-compose
│
├── php
│
├── node-playwright
│
├── postgres
│
└── adminer
```

Esto permitiría levantar todo el entorno mediante:

```bash
docker compose up -d
```

---

# 🧭 Roadmap

## Etapa 1

- [ ] Crear repositorio
- [ ] Configurar Git
- [ ] Crear estructura del proyecto
- [ ] Configurar PostgreSQL
- [ ] Crear modelo `Game`

## Etapa 2

- [ ] Crear crawler
- [ ] Detectar URLs
- [ ] Extraer metadatos
- [ ] Implementar paginación
- [ ] Implementar manejo de errores

## Etapa 3

- [ ] Crear workers
- [ ] Implementar cola
- [ ] Añadir rate limiting
- [ ] Añadir logs
- [ ] Implementar reanudación

## Etapa 4

- [ ] Dashboard
- [ ] Estadísticas
- [ ] Exportación JSON
- [ ] Exportación CSV
- [ ] Exportación SQL

## Etapa 5

- [ ] Docker
- [ ] CI/CD
- [ ] Tests
- [ ] Documentación
- [ ] Sistema de snapshots

---

# ⚖️ Consideraciones legales

Este proyecto debe diferenciar entre:

### Catalogación

Información como:

```text
Nombre
Descripción
Portada
Desarrollador
Publisher
Versión
Fecha
URL de origen
```

y

### Distribución

Contenido como:

```text
Ejecutables
Instaladores
Cracks
Keygens
Archivos protegidos por copyright
Enlaces destinados a descargar dicho contenido
```

El segundo grupo puede estar sujeto a derechos de autor, términos de servicio y otras restricciones legales.

Por ello, el proyecto debe limitarse a información cuya recopilación y utilización sea legítima y autorizada.

Para una verdadera iniciativa de preservación, una alternativa mucho más sólida es trabajar con:

- software con licencia abierta
- juegos abandonados cuando exista autorización
- material de dominio público
- repositorios de preservación autorizados
- copias que el usuario tenga derecho a conservar
- APIs y fuentes oficiales

---

# 💡 Posible evolución

El proyecto podría evolucionar desde un simple scraper hasta una plataforma de preservación:

```text
                 ┌──────────────────┐
                 │      Crawler     │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Metadata Parser  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │    PostgreSQL    │
                 └────────┬─────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       ┌─────────────┐         ┌─────────────┐
       │   REST API  │         │  Dashboard  │
       └─────────────┘         └─────────────┘
              │                       │
              └───────────┬───────────┘
                          ▼
                  Catálogo histórico
```

## 🎯 Resultado esperado

El resultado final sería un **catálogo histórico automatizado**, capaz de conservar la información pública de un sitio antes de que éste desaparezca, permitiendo estudiar cómo estaba compuesto su catálogo y qué información estaba disponible en determinado momento.

---

# 📝 Decisión tecnológica inicial

| Tecnología | Uso |
|---|---|
| PHP | Backend / API |
| Node.js + TypeScript | Scraper |
| Playwright | Automatización del navegador |
| PostgreSQL | Persistencia |
| Docker | Entorno |
| GitHub | Control de versiones |
| JSON/CSV | Exportación |

### Alternativa

Si se desea mantener un único lenguaje:

```text
PHP
+
Selenium
+
php-webdriver
+
PostgreSQL
```

Sin embargo, si el objetivo es aprender una herramienta moderna de automatización, la combinación:

```text
PHP + Node.js/TypeScript + Playwright + PostgreSQL
```

ofrece una separación de responsabilidades muy interesante.

---

## 📚 Referencias

- Playwright: documentación oficial.
- Selenium: documentación oficial.
- php-webdriver: binding de Selenium para PHP.
- GOG.com: plataforma oficial de distribución DRM-free.
- GOG-Games: sitio independiente; no debe confundirse con GOG.com.
