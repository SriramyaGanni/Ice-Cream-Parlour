pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "sriramyaganni/icecreams-website"
        NEXUS_URL = "http://13.126.177.201:8081"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/main']],
                    extensions: [],
                    userRemoteConfigs: [[
                        credentialsId: 'git-creds',
                        url: 'https://github.com/SriramyaGanni/Ice-Cream-Parlour.git'
                    ]]
                )
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test || true'
            }
        }

        stage('Package') {
            steps {
                sh 'zip -r app.zip .'
            }
        }

        stage('Upload to Nexus') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                    curl -u $USER:$PASS --upload-file app.zip \
                    $NEXUS_URL/repository/node-app/app.zip
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:latest")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                withDockerRegistry([
                    credentialsId: 'docker-creds',
                    url: 'https://index.docker.io/v1/'
                ]) {
                    script {
                        docker.image("${DOCKER_IMAGE}:latest").push()
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(
                    credentialsId: 'kubeconfig',
                    variable: 'KUBECONFIG'
                )]) {
                    sh '''
                    export KUBECONFIG=$KUBECONFIG
                    kubectl apply -f Deployment.yml
                    kubectl get pods
                    kubectl get svc
                    '''
                }
            }
        }
    }
}
