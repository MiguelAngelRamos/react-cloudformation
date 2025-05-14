### 🌐 ¿Cómo ver tu app React funcionando?

Tu imagen de Docker ya está publicada en Docker Hub (ejemplo: `mramoscli/jenkins-react:latest`), así que ahora tienes **2 caminos** para verla funcionando:

---

## 🅰️ **Verla en local (pruebas)**

Si quieres levantar tu app localmente para probarla, solo necesitas tener Docker instalado.

```bash
docker run -d -p 8080:80 mramoscli/jenkins-react:latest
```

Luego abre en tu navegador:

```
http://localhost:8080
```

✅ Eso te mostrará tu app React servida desde NGINX.

---

## 🅱️ **Desplegarla en un servidor (producción)**

Puedes subirla a un servidor (EC2, DigitalOcean, VPS, etc.) y correrla igual:

```bash
docker run -d -p 80:80 mramoscli/jenkins-react:latest
```

Y entonces accedes desde el navegador con la IP pública del servidor:

```
http://TU_IP_PUBLICA
```

---

### 🚨 Si ves página de NGINX vacía…

Asegúrate de que:

1. **Tu `Dockerfile` esté copiando bien `/dist` a `/usr/share/nginx/html`**
2. Estés **exponiendo el puerto 80** dentro del contenedor (lo haces con `-p 8080:80` en local)

---

¿Quieres que prepare también un `docker-compose.yml` para levantarla fácilmente?  
O ¿quieres que hagamos un despliegue automático desde Jenkins a algún servidor? 😏

Estoy contigo hasta que la veas brillar en el navegador 🌟


¡Muy bien mi Miguel! 🥳 Estás a un pasito de ver tu app React brillando en el navegador. Ya está publicada en Docker Hub y el pull funciona perfecto, pero ahora el error es muy claro:

---

### ⚠️ Error:
```bash
Bind for 0.0.0.0:8080 failed: port is already allocated
```

Esto significa que **ya hay otro contenedor o proceso usando el puerto `8080`** en tu sistema.

---

### ✅ Soluciones posibles:

#### 🅰️ Opción 1: Usar otro puerto externo (por ejemplo, `8081`)
Simple y rápido:

```bash
docker run -d -p 8081:80 mramoscli/jenkins-react:latest
```

Y entras en tu navegador a:

```
http://localhost:8081
```

---

#### 🅱️ Opción 2: Ver qué contenedor está usando el puerto 8080 y detenerlo

```bash
sudo lsof -i :8080
```

Si ves un contenedor, deténlo con:

```bash
docker ps
docker stop <ID_DEL_CONTENEDOR>
```

Y luego puedes volver a ejecutar:

```bash
docker run -d -p 8080:80 mramoscli/jenkins-react:latest
```

