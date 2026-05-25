FROM node:22-alpine

WORKDIR /app

COPY packages/shared-types ./packages/shared-types

WORKDIR /app/services/auth

COPY services/auth/package*.json ./
RUN npm install

COPY services/auth/ ./

EXPOSE 3001

CMD ["node", "src/index.js"]
