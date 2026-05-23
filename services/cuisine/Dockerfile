FROM node:20-alpine

WORKDIR /app

# Copier d'abord les fichiers shared-types dans la même structure que le repo
COPY packages/shared-types ./packages/shared-types
WORKDIR /app/packages/shared-types
RUN npm install && npm run build

# Revenir au dossier du service
WORKDIR /app/services/cuisine

COPY services/cuisine/package*.json ./
RUN npm install

COPY services/cuisine/ ./

EXPOSE 3003

CMD ["npx", "tsx", "src/index.ts"]
