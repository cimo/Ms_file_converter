# Ms_file_converter

Microservice file converter.

Depend on "Ms_cronjob" (use "ms_cronjob-volume" to share the certificate).

It's possible to use a custom certificate instead of "Ms_cronjob", just add it to the ".ms_cronjob-volume/certificate" folder before build the container.

## Info:

-   Cross platform (Windows, Linux)
-   WSLg for WSL2 (Run linux GUI app directly in windows) with full nvidia GPU host support.
-   Libre office

## Installation

1. For build and up write on terminal:

```
bash docker/container_execute.sh "local" "build-up"
```

2. Just for up write on terminal:

```
bash docker/container_execute.sh "local" "up"
```

## Reset

1. Remove this from the root:

    - .cache
    - .config
    - .local
    - .ms_cronjob-volume/certificate
    - .npm
    - .pki
    - dist
    - node_modules
    - package-lock.json

2. Follow the "Installation" instructions.

## Command

1. For execute "Libre office" GUI write on terminal:

    ```
    bash script/libreoffice.sh
    ```

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
file            "upload field"
```

4. Logout

```
url = https://localhost:1043/logout
method = GET
```
