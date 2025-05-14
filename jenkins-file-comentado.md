

---

### 🧾 Jenkinsfile comentado

```groovy
// Declaramos que no usaremos un agente global, sino que cada etapa definirá su propio agente
pipeline {
  agent none

  // Variables de entorno globales (nombre y etiqueta de la imagen Docker)
  environment {
    DOCKER_IMAGE = 'mramoscli/jenkins-react'  // Nombre de la imagen que subiremos a Docker Hub
    DOCKER_TAG = 'latest'                     // Etiqueta de la imagen
  }

  stages {
    // Etapa 1: Clonar el repositorio desde GitLab
    stage('Checkout') {
      agent any  // Usa cualquier nodo disponible
      steps {
        // Clona la rama "main" del repositorio GitLab
        git branch: 'main', url: 'https://gitlab.com/groupkiber/jenkins-react.git'
      }
    }

    // Etapa 2: Instalación, pruebas, cobertura y build de la app React usando Node.js
    stage('Build & Test') {
      agent {
        // Usamos una imagen Docker que ya tenga Node 18 instalado
        docker {
          image 'node:18'
          args '-u root' // Ejecutamos como root por permisos
        }
      }
      steps {
        sh 'npm ci'              // Instala dependencias de forma limpia
        sh 'npm run test'        // Ejecuta los tests con Vitest
        sh 'npm run coverage'    // Ejecuta los tests con reporte de cobertura
        sh 'npm run build'       // Compila la app con Vite (genera carpeta dist/)
      }
      post {
        always {
          // Guarda los archivos de cobertura como artefactos para ver en Jenkins
          archiveArtifacts artifacts: 'coverage/**', fingerprint: true
        }
      }
    }

    // Etapa 3: Crear una imagen Docker desde el Dockerfile
    stage('Build Docker Image') {
      agent any
      steps {
        // Construye la imagen Docker con el nombre y tag definidos
        sh 'docker build -t $DOCKER_IMAGE:$DOCKER_TAG .'
      }
    }

    // Etapa 4: Subir la imagen Docker a Docker Hub
    stage('Push a Docker Hub') {
      agent any
      steps {
        // Usa las credenciales guardadas en Jenkins con ID: docker-hub-creds
        withCredentials([usernamePassword(
          credentialsId: 'docker-hub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          // Inicia sesión en Docker Hub y sube la imagen
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push $DOCKER_IMAGE:$DOCKER_TAG
          '''
        }
      }
    }
  }
}
```

---

### 💬 ¿Para qué sirve este Jenkinsfile?

Sirve para automatizar por completo el ciclo de vida de tu app frontend:

1. Clona tu código desde GitLab.
2. Usa Node.js para instalar, testear, generar cobertura y compilar.
3. Crea una imagen Docker con NGINX y tu app React lista para producción.
4. Publica esa imagen en Docker Hub para que puedas usarla desde cualquier parte del mundo 🌍.

---

Si quieres, puedo ayudarte a convertir esto en una diapositiva con íconos o como parte de una guía de laboratorio para tus clases. ¡Tú me dices, amor! 💻💙