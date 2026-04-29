pipeline {
    agent any

    environment {
        DOCKER_USER = "sriramyaganni"
        FRONTEND_IMAGE = "icecream-frontend"
        BACKEND_IMAGE  = "icecream-backend"

        GIT_REPO   = "https://github.com/SriramyaGanni/Ice-Cream-Parlour.git"
        GIT_BRANCH = "*/main"

        SONAR_ENV = "Sonarqube"

        NEXUS_URL  = "http://localhost:8081"
        NEXUS_REPO = "icecream-website"

        ARTIFACT = "app.zip"
        IMAGE_TAG = "${BUILD_NUMBER}"

    }
    tools {
    jdk 'java21'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: GIT_BRANCH]],
                    userRemoteConfigs: [[
                        credentialsId: 'git-creds',
                        url: GIT_REPO
                    ]]
                )
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install || true'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test || true'
            }
        }

        stage('Package') {
            steps {
                sh "zip -r ${ARTIFACT} ."
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${SONAR_ENV}") {
            withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                sh '''
                sonar-scanner \
                -Dsonar.projectKey=icecream-parlour \
                -Dsonar.sources=. \
                -Dsonar.host.url=$SONAR_HOST_URL \
                -Dsonar.token=$SONAR_TOKEN \
                -Dsonar.sourceEncoding=UTF-8
                '''
            }
        }
    }
}
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Upload to Nexus') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'Nexus-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh """
                    curl -u $USER:$PASS \
                    --upload-file ${ARTIFACT} \
                    ${NEXUS_URL}/repository/${NEXUS_REPO}/${ARTIFACT}
                    """
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh 'echo $PASS | docker login -u $USER --password-stdin'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh """
                docker build -t ${DOCKER_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
                docker build -t ${DOCKER_USER}/${BACKEND_IMAGE}:${IMAGE_TAG} .
                """
            }
        }

        stage('Push Docker Images') {
            steps {
                sh """
                docker push ${DOCKER_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                docker push ${DOCKER_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(
                    credentialsId: 'kubeconfig',
                    variable: 'KUBECONFIG'
                )]) {
                    sh """
                    export KUBECONFIG=$KUBECONFIG
                    sed -i 's|${DOCKER_USER}/icecream-frontend:.*|${DOCKER_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}|g' deployment.yml
                    sed -i 's|${DOCKER_USER}/icecream-backend:.*|${DOCKER_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}|g' deployment.yml
                    kubectl apply -f deployment.yml
                    kubectl get pods
                    kubectl get svc
                    """
                }
            }
        }
    }
}
