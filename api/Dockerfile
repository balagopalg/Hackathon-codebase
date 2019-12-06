FROM node:lts-jessie

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y curl nano

RUN mkdir -p /usr/share/workdir/api

WORKDIR /usr/share/workdir/api


COPY ./src ./src
COPY ./package.json .

RUN npm install

RUN (ls && pwd)

EXPOSE 8000