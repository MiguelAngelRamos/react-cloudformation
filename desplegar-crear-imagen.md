Gracias por compartir la imagen del `Dockerfile`. Vamos paso a paso:

---

### ✅ 1. **¿Qué hace tu `Dockerfile`?**
Tu Dockerfile está bien estructurado para una app de React que se construye con `npm run build` y luego se sirve con **Nginx**. Veamos:

#### 🔧 Fase 1: Build
```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build
```
- Usa una imagen de Node.js 18.
- Copia todo el código dentro de `/app`.
- Ejecuta `npm ci` (instalación limpia de dependencias) y `npm run build` (genera `/dist` o `/build` según config de Vite o React).

#### 📦 Fase 2: Producción con Nginx
```dockerfile
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```
- Usa Nginx Alpine.
- Copia la carpeta generada `dist` (de Vite) al directorio web de Nginx.
- Sobrescribe la configuración de Nginx.

---

### 🛠️ 2. **Comando para crear la imagen**
Asegúrate de estar en el mismo directorio donde está tu `Dockerfile`, y ejecuta:

```bash
docker build -t mramoscli/jenkins-react:latest .
```

📌 Explicación:
- `-t`: le da nombre y etiqueta a la imagen.
- `.`: indica que el contexto de construcción está en el directorio actual.

---

### 🚀 3. **Comando para correr el contenedor**
Tu comando es correcto:

```bash
docker run -d -p 8080:80 mramoscli/jenkins-react:latest
```

📌 Significado:
- `-d`: modo *detached* (en segundo plano).
- `-p 8080:80`: expone el puerto 80 del contenedor (Nginx) al 8080 de tu máquina local.
- `mramoscli/jenkins-react:latest`: nombre de la imagen.

🔎 Luego puedes abrir en el navegador:  
**http://localhost:8080**

---

### ✅ Verificación
Después de ejecutar el contenedor, puedes verificar que esté corriendo con:

```bash
docker ps
```
