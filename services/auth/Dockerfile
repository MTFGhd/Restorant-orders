FROM node:20-alpine

WORKDIR /app

# Copier d'abord les fichiers shared-types dans la même structure que le repo
COPY packages/shared-types ./packages/shared-types
WORKDIR /app/packages/shared-types
RUN npm install && npm run build

# Revenir au dossier du service
WORKDIR /app/services/auth

COPY services/auth/package*.json ./
RUN npm install

COPY services/auth/ ./

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
