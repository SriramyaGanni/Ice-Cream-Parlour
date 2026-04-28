pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "sriramyaganni/icecreams-website"

        GIT_REPO   = "https://github.com/SriramyaGanni/Ice-Cream-Parlour.git"
        GIT_BRANCH = "*/main"

        SONAR_ENV = "Sonarqube"

        NEXUS_URL  = "http://43.204.96.214:8081"
        NEXUS_REPO = "task-manager-artifacts"

        ARTIFACT = "app.zip"
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
                sh 'npm install'
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
                        -Dsonar.projectName="Ice Cream Parlour" \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://43.204.96.214:9000 \
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
                    sh """
                    curl -u $USER:$PASS \
                    --upload-file ${ARTIFACT} \
                    ${NEXUS_URL}/repository/${NEXUS_REPO}/${ARTIFACT}
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:latest ."
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                    echo $PASS | docker login -u $USER --password-stdin
                    docker push ${DOCKER_IMAGE}:latest
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
                    kubectl apply -f Service.yml
                    kubectl get pods
                    kubectl get svc
                    '''
                }
            }
        }
    }
}
