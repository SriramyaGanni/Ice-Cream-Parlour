pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "sriramyaganni/icecreams-website"
        NEXUS_URL = "http://13.126.177.201:8081"
        SONARQUBE_ENV = "SonarQube"
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

        stage('Install Dependencies') {
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

          stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('Sonarqube') {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=icecream-parlour \
                        -Dsonar.projectName="Ice Cream Parlour" \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://13.126.177.201:9000 \
                        -Dsonar.login=$SONAR_TOKEN
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
                    sh '''
                    curl -u $USER:$PASS --upload-file app.zip \
                    $NEXUS_URL/repository/node-app/app.zip
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t $DOCKER_IMAGE:latest ."
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                    echo $PASS | docker login -u $USER --password-stdin
                    docker push $DOCKER_IMAGE:latest
                    '''
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
