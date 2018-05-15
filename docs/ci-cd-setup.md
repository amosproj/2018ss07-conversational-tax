# Setup of CI and CD for our project

We use https://semaphoreci.com/ as our CI and CD provider. Its unique feature set in context of Docker complement each other perfectly with our requirements.

## CI

To get the CI running we need a litte bit of code. For setup:

```
nvm install 8
npm i -g npm@latest
```

For building and testing the frontend:

```
cd frontend
npm ci
npm run test
npm run lint
```

For building and testing the backend:

```
cd backend
npm ci
npm run test
npm run lint
```

Both, the backend and frontend tests, run in parallel. All branches are tested by https://semaphoreci.com/ automaticly after a new commit. A passing test is prerequisite for merging a branch into Master or Develop. The Master branch and the Develop branch have some cool badges, too:

### Master Branch

Build status for the Master branch should be green all the time: 

[![Build Status](https://semaphoreci.com/api/v1/dominik-probst/conversationaltax-3/branches/master/badge.svg)](https://semaphoreci.com/dominik-probst/conversationaltax-3)

### Develop Branch

Build status for the Develop branch should be green all the time, too:

[![Build Status](https://semaphoreci.com/api/v1/dominik-probst/conversationaltax-3/branches/develop/badge.svg)](https://semaphoreci.com/dominik-probst/conversationaltax-3)

To be totally honest with you: All branches should feature a green build status. **All the time!**

## CD

### Build the Docker containers

This part is done by using https://semaphoreci.com/, too. One container is built for the Master branch of the GitHub project (Pushed to https://hub.docker.com/r/amosconversationaltax/conversational-tax/) and one for the Develop branch (Pushed to https://hub.docker.com/r/amosconversationaltax/conversational-tax-dev/).

The code for the Master branch is:

```
nvm install 8
npm i -g npm@latest
cd backend
npm ci
docker build -t amosconversationaltax/conversational-tax .
docker push amosconversationaltax/conversational-tax
ssh -i /home/runner/.ssh/custom_id_rsa -p 236 -o "StrictHostKeyChecking=no" amos@[anonymous] "sudo /home/docker/amos_scripts/run_docker.sh master"
```

The code for the Develop branch is:

```
nvm install 8
npm i -g npm@latest
cd backend
npm ci
docker build -t amosconversationaltax/conversational-tax-dev .
docker push amosconversationaltax/conversational-tax-dev
ssh -i /home/runner/.ssh/custom_id_rsa -p 236 -o "StrictHostKeyChecking=no" amos@[anonymous] "sudo /home/docker/amos_scripts/run_docker.sh develop"
```

### Building and Deploying the Frontend

Similar to the backend build, we use SemaphoreCI's tools for the frontend CD. The code for both branches is:

```
cd ../frontend
npm ci
npm i -g exp
exp login -u $USERNAME -p $PASSWORD
sed -i -e 's/localhost:3000/$URL:$PORT/g' config/config.tsx
sed -i -e 's/conversational-tax/conversational-tax-$BRANCH/g' app.json
sed -i -e 's/Conversational Tax/Conversational Tax ($BRANCH)/g' app.json
npm run publish
```
(The environment variables USERNAME, PASSWORD have to be set through SemaphoreCI. The URL is replaced with the IP of our CD server and the PORT is replaced with 3000 for the master branch and 3010 for the develop branch. The BRANCH is directly replaced with develop or master.)

### Deploy on CD-Server

We use an Debain Wheezy Rootserver with Docker installed for deployment of both containers. The IP of the Server is anonymous in the previous code snippets to protect integrity of the server.

#### Starting script

The key part of the deployment is the starting script for the containers (/home/docker/amos_scripts/run_docker.sh):

```
#!/bin/bash

# Variables
if [ $1 == "master" ]; then
  CONTAINERNAME="conversational-tax"
  CONTAINERIMAGE="amosconversationaltax/conversational-tax"
  PRIMARYPORT="3000"
else
  CONTAINERNAME="conversational-tax-dev"
  CONTAINERIMAGE="amosconversationaltax/conversational-tax-dev"
  PRIMARYPORT="3010"
fi

# Check whether the container is already running
RUNNING=$(docker inspect --format="{{.State.Running}}" $CONTAINERNAME 2> /dev/null)

if [ "$RUNNING" == "true" ]; then

  # Stop the running container
  echo "###########################################"
  echo "####### Stop the running container: #######"
  echo "###########################################"
  echo " "
  docker stop $CONTAINERNAME
  echo " "
  echo " "

  # Remove the stopped container
  echo "###########################################"
  echo "###### Remove the stopped container: ######"
  echo "###########################################"
  echo " "
  docker rm $CONTAINERNAME
  echo " "
  echo " "

fi

# Pull the newest image from DockerHub
echo "###########################################"
echo "## Pull the newest image from DockerHub: ##"
echo "###########################################"
echo " "
docker pull $CONTAINERIMAGE
echo " "
echo " "

# Start the new container
echo "###########################################"
echo "# Start the new latest docker container:  #"
echo "###########################################"
echo " "
docker run -p $PRIMARYPORT:3000 -v /home/docker/amos_files/dialogflowKey.json:/usr/src/app/dialogflowKey.json -d --name=$CONTAINERNAME --net=$NETWORKNAME --restart=always $CONTAINERIMAGE
echo " "
echo " "
```

The Linux user "amos" does not have any sudo rights (Docker container have to be strated with sudo rights) as he should not be able to do anything than starting the both CD containers. There has to be a workaround (/etc/sudoers):

```
amos    ALL=(ALL) NOPASSWD: /home/docker/amos_scripts/run_docker.sh
```