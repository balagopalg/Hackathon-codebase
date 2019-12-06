FROM node:lts-jessie

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y curl nano

RUN mkdir -p /usr/share/workdir/TP

WORKDIR /usr/share/workdir/TP

COPY ./src ./src
COPY ./package.json .

RUN npm install

RUN (ls && pwd && cd ./src && ls)

EXPOSE 9000