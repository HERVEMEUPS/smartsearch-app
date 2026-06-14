# Dockerfile pour le backend Node.js

# Étape 1 : Base
FROM node:20-alpine AS base

WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl

# Copier les fichiers de dépendances
COPY package*.json ./

# Étape 2 : Dependencies
FROM base AS dependencies

# Installer toutes les dépendances (dev + prod)
RUN npm ci

# Étape 3 : Development
FROM base AS development

# Copier les node_modules
COPY --from=dependencies /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p uploads logs

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Commande de démarrage
CMD ["npm", "run", "dev"]

# Étape 4 : Production
FROM base AS production

# Copier uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --omit=dev

# Copier le code source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p uploads logs

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Changer les permissions
RUN chown -R nodejs:nodejs /app

# Utiliser l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Commande de démarrage
CMD ["node", "src/server.js"]
