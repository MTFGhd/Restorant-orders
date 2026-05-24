FROM node:22-alpine

WORKDIR /app

# Copier d'abord les fichiers shared-types dans la même structure que le repo
COPY packages/shared-types ./packages/shared-types
WORKDIR /app/packages/shared-types
RUN npm install && npm run build

# Revenir au dossier du service
WORKDIR /app/services/menu

COPY services/menu/package*.json ./
RUN npm install

COPY services/menu/ ./

EXPOSE 3002

CMD ["npx", "tsx", "src/index.ts"]
