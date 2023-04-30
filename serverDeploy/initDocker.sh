#!/bin/bash

echo ""
echo "This is the initial installation!!! "

TARGET_TAG=$1
API_CONTAINER='API_A'
if [ -z "${TARGET_TAG}" ]
then
  TARGET_TAG="latest"
fi
echo "Target Deploy Tag is ${TARGET_TAG}"
echo "API MODE is ${API_CONTAINER}!!! "

echo "start pull from ghcr !!!"
docker pull ghcr.io/rockvr/mvh_api:"${TARGET_TAG}" || echo 'need login ghcr reg!'

RUN_CONTAINER=`docker ps -a -q --filter name=API | xargs echo`
if [ -n "${RUN_CONTAINER}" ]
then
  docker ps -a -q --filter name=API |
  xargs docker rm -f |
  xargs -I % echo % > /dev/null
fi

docker run -d\
  -p 3001:3001\
  --add-host=host.docker.internal:host-gateway\
  --name "${API_CONTAINER}"\
  --restart unless-stopped\
  ghcr.io/rockvr/mvh_api:"${TARGET_TAG}" |
  xargs -I % echo "${API_CONTAINER} ID is" % 

sudo cp ./api_a.conf /etc/nginx/conf.d/api.conf
sudo nginx -s reload 
echo "DEPLOY ${API_CONTAINER} SUCCESS!!!"
