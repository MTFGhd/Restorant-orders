FROM node:22-alpine

WORKDIR /app

COPY packages/shared-types ./packages/shared-types
COPY packages/rabbitmq-client ./packages/rabbitmq-client
WORKDIR /app/packages/shared-types
RUN npm install && npm run build
WORKDIR /app/packages/rabbitmq-client
RUN npm install && npm run build

WORKDIR /app/services/commandes

COPY services/commandes/package*.json ./
RUN npm install

COPY services/commandes/ ./

EXPOSE 3004

CMD ["npx", "tsx", "src/index.ts"]
