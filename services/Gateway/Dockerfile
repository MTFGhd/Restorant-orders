FROM node:22-alpine

WORKDIR /app/services/Gateway

COPY services/Gateway/package*.json ./
RUN npm install

COPY services/Gateway/ ./

EXPOSE 8000

CMD ["node", "src/index.js"]
