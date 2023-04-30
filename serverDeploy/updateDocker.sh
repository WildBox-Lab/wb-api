#!/bin/bash
TARGET_TAG=$1
if [ -z "${TARGET_TAG}" ]
then
  TARGET_TAG="latest"
fi
echo "Target Deploy Tag is ${TARGET_TAG}"

echo "start pull from ghcr !!!"
docker pull ghcr.io/WildBox-Lab/wb-api:"${TARGET_TAG}" || echo 'need login ghcr reg!'

NEXT_TICK='API_A'
CURRENT_TICK='API_B'
PORT="3009"
CONF_FILE="./api_a.conf"

HAS_API_A=`docker container ls -a -q --filter name=API_A`
if [ -n "${HAS_API_A}" ]
then
  NEXT_TICK='API_B'
  CURRENT_TICK='API_A'
  PORT="3002"
  CONF_FILE="./api_b.conf"
fi

echo "NEXT SIDE MODE is ${NEXT_TICK}!!!"

# depoly next side
docker run -d\
  -p "${PORT}:3000"\
  --add-host=host.docker.internal:host-gateway\
  --name "${NEXT_TICK}"\
  --restart unless-stopped\
  ghcr.io/WildBox-Lab/wb-api:"${TARGET_TAG}" |
  xargs -I % echo "${NEXT_TICK} ID is" % 

# use next conf
sudo cp "${CONF_FILE}" /etc/nginx/conf.d/api.conf
sudo nginx -s reload
echo "SWITCH to ${NEXT_TICK} SUCCESS !!!"

# kill CURRENT
echo "KILL ${CURRENT_TICK}!!!"
docker ps -a -q --filter "name=${CURRENT_TICK}" |
xargs docker rm -f |
xargs -I % echo % > /dev/null

echo "DEPLOY SUCCESS!!!"

# delete image not used in last 96h
docker image prune -a --force --filter "until=96h"
