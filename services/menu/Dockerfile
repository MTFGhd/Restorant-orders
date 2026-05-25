FROM node:22-alpine

WORKDIR /app

COPY packages/shared-types ./packages/shared-types

WORKDIR /app/services/menu

COPY services/menu/package*.json ./
RUN npm install

COPY services/menu/ ./

EXPOSE 3002

CMD ["node", "src/index.js"]
