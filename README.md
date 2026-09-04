# BlogDeCafé

Sitio web estático (HTML/CSS/JS) con un backend en Node.js/Express para
registrar las inscripciones a los cursos.

## Estructura del proyecto

```
blog_de_cafe/
├── index.html, cursos.html, contacto.html, ...   # Front-end estático
├── css/                                            # Estilos
├── js/
│   ├── config.js          # URL del backend (edítala si cambias el puerto)
│   ├── inscripciones.js   # Validación y envío de los formularios de curso
│   └── normalize.js       # Detección de soporte WebP (Modernizr)
├── backend/
│   ├── server.js           # Servidor Express (API de inscripciones)
│   ├── package.json
│   ├── .env.example         # Plantilla de variables de entorno
│   └── data/
│       └── inscripciones.json  # Se crea automáticamente (NO se sube a git)
├── .gitignore
└── README.md
```

## 1. Levantar el backend (API de inscripciones)

Requisitos: [Node.js](https://nodejs.org/) 18 o superior instalado.

Desde la terminal integrada de VSCode:

```bash
cd backend
npm install
cp .env.example .env      # En Windows (PowerShell): copy .env.example .env
npm start
```

Deberías ver:

```
Servidor de BlogDeCafé escuchando en http://localhost:3000
```

El backend crea automáticamente `backend/data/inscripciones.json` la primera
vez que se ejecuta, y ahí se van agregando las inscripciones (id, curso,
correo, teléfono y fecha).

### Endpoints disponibles

| Método | Ruta                  | Descripción                                   |
|--------|-----------------------|------------------------------------------------|
| GET    | `/health`              | Verifica que el servidor esté activo           |
| GET    | `/api/inscripciones`   | Lista todas las inscripciones guardadas        |
| POST   | `/api/inscripciones`   | Registra una nueva inscripción (curso, email, telefono) |

## 2. Abrir el sitio (front-end)

Con el backend corriendo, abre la carpeta raíz del proyecto con la extensión
**Live Server** de VSCode (clic derecho sobre `index.html` → "Open with Live
Server"), o cualquier servidor estático de tu preferencia. No abras el
`index.html` con doble clic directamente desde el explorador de archivos,
ya que algunas rutas de recursos (`/css`, `/js`) requieren un servidor.

Ve a la sección **Cursos**, haz clic en "Inscribirme a este curso" en
cualquiera de los tres cursos, completa correo y teléfono, y envía el
formulario. Verás un mensaje de éxito o error sin recargar la página, y el
registro quedará guardado en `backend/data/inscripciones.json`.

Si tu backend corre en un host o puerto distinto a `http://localhost:3000`,
actualiza la constante `API_URL` en `js/config.js`.

## 3. Seguridad y control de versiones

El archivo `.gitignore` ya está configurado para que **nunca** se suban al
repositorio:

- El archivo real `.env` (solo se versiona `.env.example` como plantilla).
- El archivo de datos `backend/data/inscripciones.json` (contiene datos
  personales de los inscritos). Se mantiene un `.gitkeep` para conservar la
  carpeta vacía en el repositorio.
- Cualquier archivo `.db` / `.sqlite` si en el futuro migras a una base de
  datos de ese tipo.
- `node_modules/`.

Si en algún momento migras a MySQL u otro motor, agrega sus credenciales
también al `.env` (nunca al código fuente) y documenta las variables nuevas
en `.env.example`.
