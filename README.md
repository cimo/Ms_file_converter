# Ms_file_converter

Microservice file converter.

Depend from Ms_cronjob (use the volume "ms_cronjob-volume" for share the certificate).

## Installation

1. For full build write on terminal:

```
docker compose -f docker-compose.yaml --env-file ./env/local.env build --no-cache \
&& docker compose -f docker-compose.yaml --env-file ./env/local.env up --detach --pull "always"
```

2. For light build (just env variable change) remove the container and write on terminal:

```
docker compose -f docker-compose.yaml --env-file ./env/local.env up --detach --pull "always"
```

## Reset

1. Remove this from the root:

    - .ms_cronjob-volume
    - .npm
    - node_modules
    - package-lock.json
    - certificate/tls.crt
    - certificate/tls.key
    - certificate/tls.pem

2. Follow the "Installation" instructions.

## Api (Postman)

1. Info

```
url = https://localhost:1043/info
method = GET
```

2. Login

```
url = https://localhost:1043/login
method = GET
```

3. Convert

```
url = https://localhost:1043/api/toPdf
url = https://localhost:1043/api/toJpg
method = POST

form-data

key             value
---             ---
filename        test
file            "upload field"
```

4. Logout

```
url = https://localhost:1043/logout
method = GET
```
