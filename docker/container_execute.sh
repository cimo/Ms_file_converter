#!/bin/bash

echo "Copying volume contents..."

docker run --rm -v tp_local_ms_cronjob-volume:/home/source/:ro -v $(pwd)/.ms_cronjob-volume/:/home/target/ alpine sh -c "cp -r /home/source/* /home/target/"

echo "Execute container."

if [ -n "${1}" ] && [ "${1}" = "fast" ]
then
    docker compose -f docker-compose.yaml --env-file ./env/local.env up --detach --pull always
else
    docker compose -f docker-compose.yaml --env-file ./env/local.env build --no-cache
    docker compose -f docker-compose.yaml --env-file ./env/local.env up --detach --pull always
fi
