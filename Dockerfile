FROM node:20-alpine

RUN apk add --no-cache redis

RUN mkdir /app && chown node:node /app
WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app

RUN npm run build

RUN npm prune --production

RUN chown -R node:node /app

USER node

CMD redis-server --daemonize yes && node /app/dist/server.js
