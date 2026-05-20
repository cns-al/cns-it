# Build stage - limit memory to avoid OOM on low-memory VMs
FROM node:20-slim AS build

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# jobs=1: install one package at a time to prevent OOM
RUN npm ci --jobs=1 && \
    cd server && npm ci --jobs=1 && \
    cd ../client && npm ci --jobs=1

COPY . .

RUN cd client && npm run build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy server (with compiled node_modules) and pre-built client
COPY --from=build /app/server ./server
COPY --from=build /app/client/build ./client/build

ENV DATA_DIR=/data
RUN mkdir -p /data

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server/src/app.js"]
