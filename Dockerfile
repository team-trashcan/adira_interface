FROM node:20-alpine

RUN mkdir /app && chown node:node /app

WORKDIR /app

COPY config /app/config
COPY dist /app/dist
COPY node_modules /app/node_modules

RUN chown -R node:node /app

USER node

CMD "npm install && npm run build"
CMD ["node", "--require", "/app/dist/server.js"]
