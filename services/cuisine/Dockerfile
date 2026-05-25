FROM node:22-alpine

WORKDIR /app

COPY packages/shared-types ./packages/shared-types
COPY packages/rabbitmq-client ./packages/rabbitmq-client

# Install dependencies for local linked package so Node can resolve them
WORKDIR /app/packages/rabbitmq-client
RUN npm install --omit=dev

# Revenir au dossier du service
WORKDIR /app/services/cuisine

COPY services/cuisine/package*.json ./
RUN npm install --omit=dev

COPY services/cuisine/ ./

EXPOSE 3003

CMD ["node", "src/index.js"]
