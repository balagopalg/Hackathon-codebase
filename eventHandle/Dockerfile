FROM node:lts-jessie

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y curl nano

RUN mkdir -p /usr/share/workdir/eventHandle/src

WORKDIR /usr/share/workdir/eventHandle

#COPY ./src ./src
COPY ./package.json .

RUN npm install

#RUN (ls && pwd && cd ./src && ls)

EXPOSE 9000
