FROM ubuntu:22.04

ARG _ENV_NAME
ARG _DOMAIN
ARG _TIMEZONE
ARG _SERVER_PORT
ARG _SERVER_LOCATION
ARG _PATH_ROOT
ARG _VERSION_TAG

ENV ENV_NAME=${_ENV_NAME}
ENV DOMAIN=${_DOMAIN}
ENV TZ=${_TIMEZONE}
ENV SERVER_PORT=${_SERVER_PORT}
ENV SERVER_LOCATION=${_SERVER_LOCATION}
ENV PATH_ROOT=${_PATH_ROOT}
ENV VERSION_TAG=${_VERSION_TAG}

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NOWARNINGS=yes
ENV NODE_OPTIONS=--use-openssl-ca
ENV SUDO_FORCE_REMOVE=yes

COPY ./certificate/proxy/ /usr/local/share/ca-certificates/
COPY ./ ${PATH_ROOT}

RUN cd ~ \
    && VERSION_CODENAME=$(grep VERSION_CODENAME= /etc/os-release | cut -d= -f2) \
    && chmod -R 0644 /usr/local/share/ca-certificates/ \
    && apt-get update && apt-get install -y ca-certificates gnupg curl \
    && update-ca-certificates \
    # NodeJs
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y nodejs \
    # No root
    && groupadd -g 1000 node \
    && useradd -d ${PATH_ROOT} -s /bin/bash -u 1000 -g 1000 node \
    && mkdir -p ${PATH_ROOT} /usr/local/lib/node_modules/ /usr/local/bin/ \
    && chown -R node:node ${PATH_ROOT} /usr/local/lib/node_modules/ /usr/local/bin/ \
    && chmod -R 775 ${PATH_ROOT} /usr/local/lib/node_modules/ /usr/local/bin/ \
    # Apt
    && apt-get update && apt-get install -y \
    fonts-noto \
    fonts-noto-cjk \
    default-jre \
    libreoffice --no-install-recommends \
    # Clean
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean -y \
    && apt-get autoclean -y \
    && apt-get autoremove -y

USER node

WORKDIR ${PATH_ROOT}

RUN npm install && npm run build

CMD node ${PATH_ROOT}dist/controller/Server.js

EXPOSE ${SERVER_PORT}
