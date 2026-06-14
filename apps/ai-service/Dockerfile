# Dockerfile pour le service IA Python

# Étape 1 : Base
FROM python:3.11-slim AS base

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de requirements
COPY requirements.txt .

# Étape 2 : Dependencies
FROM base AS dependencies

# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Télécharger le modèle spaCy français
RUN python -m spacy download fr_core_news_sm

# Étape 3 : Development
FROM base AS development

# Copier les dépendances installées
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copier le code source
COPY . .

# Créer les répertoires de cache
RUN mkdir -p cache/embeddings cache/models

# Exposer le port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Commande de démarrage (mode dev avec reload)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Étape 4 : Production
FROM base AS production

# Copier les dépendances installées
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copier le code source
COPY ./app ./app
COPY .env.example .env

# Créer les répertoires de cache
RUN mkdir -p cache/embeddings cache/models

# Créer un utilisateur non-root
RUN useradd -m -u 1001 python && \
    chown -R python:python /app

# Utiliser l'utilisateur non-root
USER python

# Exposer le port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Commande de démarrage (mode production avec workers)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
