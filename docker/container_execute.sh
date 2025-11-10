#!/bin/bash

if [ -n "${1}" ] && [ -n "${2}" ]
then
    echo "Copying volume contents..."
    
    docker run --rm -v cimo_${1}_ms_cronjob-volume:/home/source/:ro -v $(pwd)/.ms_cronjob-volume/:/home/target/ alpine sh -c "cp -r /home/source/* /home/target/"

    echo "Execute container."

    if [ "${2}" = "build-up" ]
    then
        docker compose -f docker-compose.yaml --env-file ./env/${1}.env build --no-cache
        docker compose -f docker-compose.yaml --env-file ./env/${1}.env up --detach --pull always
    elif [ "${2}" = "up" ]
    then
        docker compose -f docker-compose.yaml --env-file ./env/${1}.env up --detach --pull always
    fi
fi
