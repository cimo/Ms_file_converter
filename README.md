# Ms_file_converter

Microservice file converter PDF.

Depend from Ms_cronjob (use the volume "ms_cronjob-volume" for share the certificate).

## Setup

1. Wrinte on terminal:
```
docker-compose -f docker-compose_local.yml --env-file ./env/local.env up -d --build
```
