---

### 🐳 **Dockerfile explicado paso a paso (para tontos 😄)**

```Dockerfile
# Construcción
FROM node:18 AS build
```
🧱 **¿Qué hace?**  
Le dice a Docker: “quiero usar una imagen base que ya tenga Node.js versión 18 instalada”.  
Esta parte se va a usar **solo para compilar tu app React**, no se queda en producción.  
El `AS build` es como ponerle un nombre a esta etapa (etapa de construcción).

---

```Dockerfile
WORKDIR /app
```
📁 **¿Qué hace?**  
Cambia el directorio de trabajo dentro del contenedor a una carpeta llamada `/app`.  
Todo lo que hagamos desde aquí, se hace dentro de esa carpeta.

---

```Dockerfile
COPY . .
```
📦 **¿Qué hace?**  
Copia **todo el contenido del proyecto** (los archivos que están en tu máquina o repositorio) hacia `/app` dentro del contenedor.

---

```Dockerfile
RUN npm ci && npm run build
```
🛠️ **¿Qué hace?**  
Ejecuta dos comandos importantes:

1. `npm ci`: instala las dependencias de tu proyecto desde el `package-lock.json`. Es más rápido y limpio que `npm install`, ideal para CI/CD.
2. `npm run build`: compila tu app React y genera una carpeta `dist` con los archivos listos para producción.

---

### 🚀 **Producción: ahora sí, el contenedor que se usará para desplegar**

```Dockerfile
FROM nginx:stable-alpine
```
🧊 **¿Qué hace?**  
Cambia la base del contenedor a una imagen **ligera y rápida de NGINX**, un servidor web muy usado para mostrar sitios estáticos como los de React.  
`alpine` significa que es súper liviano (¡rápido de descargar y ejecutar!).

---

```Dockerfile
COPY --from=build /app/dist /usr/share/nginx/html
```
📂 **¿Qué hace?**  
Toma la carpeta `dist` generada en la **etapa de construcción** (`build`) y la copia en el lugar donde NGINX busca archivos para mostrar al usuario:  
`/usr/share/nginx/html`

💡 Es como decir: “pone los archivos del sitio web en el servidor web”.

---

```Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```
⚙️ **¿Qué hace?**  
Reemplaza la configuración por defecto de NGINX con tu propio archivo `nginx.conf`, que probablemente contiene algo como redirecciones o soporte para `react-router`.

💬 Por ejemplo, redirigir todo a `index.html` para que funcionen las rutas de React sin error 404.

---

### 🧠 Resumen para no olvidar

| Parte        | ¿Para qué sirve?                      |
|--------------|----------------------------------------|
| `node:18`    | Construir tu app (con React + Node)    |
| `npm ci`     | Instalar dependencias limpias          |
| `npm run build` | Generar versión optimizada (dist)   |
| `nginx:alpine` | Servir tu sitio web React al mundo   |
| `COPY ...`   | Pasar los archivos construidos al servidor |
| `nginx.conf` | Personalizar el comportamiento del servidor |

---



La instrucción `COPY --from=build` en el Dockerfile utiliza una característica llamada **multi-stage builds**. Esto permite que un Dockerfile tenga múltiples etapas, cada una con su propio propósito, y que puedas copiar archivos entre ellas.

En este caso:

1. **`--from=build`**:  
   Indica que los archivos que se van a copiar provienen de la etapa llamada `build`. Esta etapa fue definida previamente en el Dockerfile con `FROM node:18 AS build`.

2. **`/app/dist`**:  
   Es la carpeta generada en la etapa `build` después de ejecutar `npm run build`. Contiene los archivos estáticos optimizados de tu aplicación React listos para producción.

3. **`/usr/share/nginx/html`**:  
   Es el directorio donde NGINX busca los archivos que servirá como sitio web. Al copiar los archivos de `dist` aquí, estás configurando tu aplicación React para que sea servida por NGINX.

En resumen, `--from=build` permite tomar los archivos generados en la etapa de construcción y usarlos en la etapa de producción, lo que hace que el contenedor final sea más liviano porque no incluye herramientas de desarrollo como Node.js.