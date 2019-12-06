FROM node:lts-jessie

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y curl nano

RUN mkdir -p /usr/share/workdir/client

WORKDIR /usr/share/workdir/client

COPY ./src ./src
COPY ./package.json .

RUN npm install

RUN (ls && pwd && (cd src && ls && pwd))

EXPOSE 3000