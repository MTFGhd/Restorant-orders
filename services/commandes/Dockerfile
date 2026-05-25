FROM node:22-alpine

WORKDIR /app

COPY packages/shared-types ./packages/shared-types
COPY packages/rabbitmq-client ./packages/rabbitmq-client

# Install dependencies for local linked package so Node can resolve them
WORKDIR /app/packages/rabbitmq-client
RUN npm install --omit=dev

WORKDIR /app/services/commandes

COPY services/commandes/package*.json ./
RUN npm install --omit=dev

COPY services/commandes/ ./

EXPOSE 3004

CMD ["node", "src/index.js"]
