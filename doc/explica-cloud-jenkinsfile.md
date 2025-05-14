```yaml
pipeline {
    agent any // Define que el pipeline puede ejecutarse en cualquier agente disponible.

    environment {
        BUCKET_NAME   = 'mi-react-bucket-demo' // Nombre del bucket S3 donde se desplegará la aplicación.
        STACK_NAME    = 'ReactSiteInfra' // Nombre del stack de CloudFormation para la infraestructura.
        AWS_REGION    = 'us-east-1' // Región de AWS donde se ejecutarán los servicios.
        NODE_IMG      = 'node:18' // Imagen de Docker con Node.js 18 para ejecutar los pasos relacionados con Node.js.
    }

    options {
        timestamps() // Agrega marcas de tiempo a los logs para facilitar el seguimiento.
        disableConcurrentBuilds() // Evita que se ejecuten múltiples builds del pipeline al mismo tiempo.
    }

    stages { // Define las etapas del pipeline.
        stage('Checkout') { // Etapa para obtener el código fuente del repositorio.
            steps {
                checkout scm // Descarga el código fuente desde el sistema de control de versiones configurado (SCM).
            }
        }

        stage('Instalar dependencias') { // Etapa para instalar las dependencias del proyecto.
            agent {
                docker { image env.NODE_IMG; args '-u root' } // Usa un contenedor Docker con Node.js 18.
            }
            steps {
                sh 'npm ci' // Instala las dependencias usando npm (modo limpio).
            }
        }

        stage('Lint + Tests') { // Etapa para verificar el código y ejecutar pruebas.
            agent {
                docker { image env.NODE_IMG; args '-u root' } // Usa un contenedor Docker con Node.js 18.
            }
            steps {
                sh 'npm run lint' // Ejecuta el linter para verificar la calidad del código.
                sh 'npm run test -- --run' // Ejecuta las pruebas automatizadas.
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'junit.xml' // Publica los resultados de las pruebas en formato JUnit.
                }
            }
        }

        stage('Build') { // Etapa para construir la aplicación.
            agent {
                docker { image env.NODE_IMG; args '-u root' } // Usa un contenedor Docker con Node.js 18.
            }
            steps {
                sh 'npm run build' // Construye la aplicación para producción.
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true // Archiva los archivos generados en la carpeta 'dist'.
                stash name: 'react-dist', includes: 'dist/**' // Guarda los artefactos generados para usarlos en etapas posteriores.
            }
        }

        stage('Crear/Actualizar infraestructura S3') { // Etapa para crear o actualizar la infraestructura en AWS.
            when { expression { return env.BUCKET_NAME?.trim() } } // Solo se ejecuta si el nombre del bucket está definido.
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'), // Usa las credenciales de AWS.
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                        aws cloudformation deploy \
                          --region $AWS_REGION \
                          --stack-name $STACK_NAME \
                          --template-file infra/s3-react-site.yaml \
                          --parameter-overrides BucketName=$BUCKET_NAME \
                          --capabilities CAPABILITY_NAMED_IAM
                    ''' // Despliega la infraestructura usando AWS CloudFormation.
                }
            }
        }

        stage('Sincronizar artefactos a S3') { // Etapa para subir los archivos generados al bucket S3.
            steps {
                unstash 'react-dist' // Recupera los artefactos guardados en la etapa de build.
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'), // Usa las credenciales de AWS.
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                        echo "📤 Subiendo archivos a S3…"
                        aws s3 sync dist/ s3://$BUCKET_NAME/ --delete --region $AWS_REGION
                    ''' // Sincroniza los archivos de la carpeta 'dist' con el bucket S3.
                }
            }
        }
    }

    post { // Bloque para acciones posteriores a la ejecución del pipeline.
        success {
            echo "✅ Despliegue exitoso en https://${env.BUCKET_NAME}.s3-website-${env.AWS_REGION}.amazonaws.com" // Mensaje de éxito con la URL del sitio.
        }
        failure {
            echo '❌ El pipeline falló.' // Mensaje de error si el pipeline falla.
        }
    }
}
```