
---

## 🧾 **Explicación paso a paso del Jenkinsfile**

```groovy
pipeline {
  agent none
```
🔹 **¿Qué hace?**  
Le indica a Jenkins que **no usará un agente global por defecto**.  
Esto significa que **cada stage debe definir su propio agente** (`agent any`, `agent docker`, etc.).

Esto te da mayor control y flexibilidad para usar diferentes entornos según el paso del pipeline.

---

### 🌍 `environment`

```groovy
  environment {
    DOCKER_IMAGE = 'mramoscli/jenkins-react'
    DOCKER_TAG = 'latest'
  }
```

🔹 **¿Qué hace?**  
Declara **variables de entorno** que puedes usar en cualquier parte del pipeline con `$DOCKER_IMAGE` y `$DOCKER_TAG`.

✅ Buenas prácticas:
- Evita repetir strings.
- Permite cambiar fácilmente el nombre o la etiqueta de la imagen desde un solo lugar.

---

## 🧱 Stages (etapas del pipeline)

---

### 🔍 Stage: `Checkout`

```groovy
  stage('Checkout') {
    agent any
    steps {
      git branch: 'main', url: 'https://gitlab.com/groupkiber/jenkins-react.git'
    }
  }
```

🔹 **¿Qué hace?**  
Clona el repositorio desde GitLab usando la rama `main`.

🔸 **Comando:**  
```groovy
git branch: 'main', url: 'https://...'
```
Este comando es parte del plugin Git de Jenkins. Le dice qué rama debe traer y desde qué URL.

---

### 🧪 Stage: `Build & Test`

```groovy
  stage('Build & Test') {
    agent {
      docker { image 'node:18'; args '-u root' }
    }
```

🔹 **¿Qué hace?**  
Usa una imagen Docker que ya tenga **Node.js 18** preinstalado, para que puedas ejecutar comandos de `npm`.

🔸 `args '-u root'`:  
Ejecuta el contenedor como **usuario root**, necesario para que algunos comandos de instalación o lectura de archivos funcionen sin permisos denegados.

---

```groovy
    steps {
      sh 'npm ci'
```

🔸 **¿Qué hace?**  
`npm ci` es como `npm install` pero:
- **Más rápido**
- Usa estrictamente `package-lock.json`
- Elimina `node_modules` antes de instalar (ideal para CI/CD)

---

```groovy
      sh 'npm run test'
```

🔸 **¿Qué hace?**  
Ejecuta los tests definidos en el `package.json`.  
En tu caso, usa **Vitest** con reporte JUnit.

---

```groovy
      sh 'npm run coverage'
```

🔸 **¿Qué hace?**  
Ejecuta las pruebas nuevamente, pero con cobertura activada.  
Genera archivos de reporte como `coverage/index.html` y más.

---

```groovy
      sh 'npm run build'
```

🔸 **¿Qué hace?**  
Compila la app React usando Vite.  
Genera una carpeta `dist/` con los archivos de producción.

---

```groovy
    post {
      always {
        archiveArtifacts artifacts: 'coverage/**', fingerprint: true
      }
    }
```

🔹 **¿Qué hace?**  
Guarda como artefactos todos los archivos dentro de `coverage/` para poder verlos luego desde Jenkins.  
El `fingerprint: true` permite identificar versiones exactas de archivos entre builds.

---

### 🐳 Stage: `Build Docker Image`

```groovy
  stage('Build Docker Image') {
    agent any
    steps {
      sh 'docker build -t $DOCKER_IMAGE:$DOCKER_TAG .'
    }
  }
```

🔹 **¿Qué hace?**  
Construye una imagen Docker **desde el `Dockerfile` del proyecto**.  
Le asigna el nombre `mramoscli/jenkins-react:latest`.

🔸 `docker build -t nombre:etiqueta .`  
- `-t`: Tag (nombre + versión)
- `.`: Contexto de build (la carpeta actual)

---

### ☁️ Stage: `Push a Docker Hub`

```groovy
  stage('Push a Docker Hub') {
    agent any
```

🔹 **¿Qué hace?**  
Publica tu imagen en Docker Hub, para que pueda ser usada desde cualquier parte del mundo 🌍

---

```groovy
    withCredentials([usernamePassword(
      credentialsId: 'docker-hub-creds',
      usernameVariable: 'DOCKER_USER',
      passwordVariable: 'DOCKER_PASS'
    )])
```

🔹 **¿Qué hace?**  
Toma credenciales seguras almacenadas en Jenkins para iniciar sesión en Docker Hub.

✅ **`credentialsId`** debe ser el ID de las credenciales que creaste en **Jenkins > Credentials**.

---

```groovy
      sh '''
        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
        docker push $DOCKER_IMAGE:$DOCKER_TAG
      '''
```

🔸 **¿Qué hace?**  
- Hace login en Docker Hub.
- Empuja la imagen al repositorio especificado (`mramoscli/jenkins-react:latest`).

---

### 🎯 Resultado Final:

Cuando el pipeline se ejecuta exitosamente:
1. La app es testeada y validada.
2. La cobertura se genera.
3. Se construye la app y la imagen Docker.
4. Se publica automáticamente en Docker Hub.

---