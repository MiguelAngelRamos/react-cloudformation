pipeline {
    agent any

    environment {
        BUCKET_NAME   = 'mi-react-bucket-demo'
        STACK_NAME    = 'ReactSiteInfra'
        AWS_REGION    = 'us-east-1'
        NODE_IMG      = 'node:18'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Instalar dependencias') {
            agent {
                docker { image env.NODE_IMG; args '-u root' }
            }
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint + Tests') {
            agent {
                docker { image env.NODE_IMG; args '-u root' }
            }
            steps {
                sh 'npm run lint'
                sh 'npm run test -- --run'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'junit.xml'
                }
            }
        }

        stage('Build') {
            agent {
                docker { image env.NODE_IMG; args '-u root' }
            }
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                stash name: 'react-dist', includes: 'dist/**'
            }
        }

        stage('Crear/Actualizar infraestructura S3') {
            when { expression { return env.BUCKET_NAME?.trim() } }
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
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
                    '''
                }
            }
        }

        stage('Sincronizar artefactos a S3') {
            steps {
                unstash 'react-dist'
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                        echo "📤 Subiendo archivos a S3…"
                        aws s3 sync dist/ s3://$BUCKET_NAME/ --delete --region $AWS_REGION
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Despliegue exitoso en https://${env.BUCKET_NAME}.s3-website-${env.AWS_REGION}.amazonaws.com"
        }
        failure {
            echo '❌ El pipeline falló.'
        }
    }
}
