# Ms_file_converter

Microservice file converter.

Depend from "Ms_cronjob" (use "ms_cronjob-volume" for share the certificate).
It's possible to use a personal certificate instead of "Ms_cronjob", just add the certificate in the ".ms_cronjob-volume" folders.

## Info:

-   Cross platform (Windows, Linux)
-   X11 for WSL2 (Run linux GUI app directly in windows).
-   Libre office

## Installation

1. For full build write on terminal:

```
bash docker/container_execute.sh
```

2. For light build (just env variable change) remove the container and write on terminal:

```
bash docker/container_execute.sh "fast"
```

## Reset

1. Remove this from the root:

    - .cache
    - .config
    - .dbus
    - .npm
    - node_modules
    - package-lock.json

2. Follow the "Installation" instructions.

3. For execute "Libre office" GUI write on terminal:

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
