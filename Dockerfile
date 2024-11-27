FROM node:20-alpine

RUN mkdir /app && chown node:node /app
WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app

RUN npm run build

RUN npm prune --production

RUN chown -R node:node /app

USER node

CMD ["node", "/app/dist/server.js"]
