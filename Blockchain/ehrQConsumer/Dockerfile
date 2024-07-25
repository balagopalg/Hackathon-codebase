FROM node:20.15.1-alpine3.20

RUN mkdir -p /usr/share/workdir/ehrQConsumer/src

WORKDIR /usr/share/workdir/ehrQConsumer

# COPY ./src ./src
COPY ./package.json .

RUN apk --update add  --virtual build-dependencies --no-cache build-base \
python \
&& npm i \
&& apk del build-dependencies 
