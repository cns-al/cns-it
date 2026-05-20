# Build stage - limit memory to avoid OOM on low-memory VMs
FROM node:20-slim AS build

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Limit npm parallelism and Node.js heap to prevent OOM on 8GB VMs
ENV NPM_CONFIG_NETWORK_CONCURRENCY=4 \
    NPM_CONFIG_MAX_SOCKETS=4 \
    NODE_OPTIONS=--max-old-space-size=2048

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm ci
RUN cd server && npm ci
RUN cd client && npm ci

COPY . .

RUN cd client && npm run build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

RUN groupadd -g 1001 -r nodejs && \
    useradd -u 1001 -r -g nodejs cnsit && \
    apt-get update && apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Copy server (with compiled node_modules) and pre-built client
COPY --from=build /app/server ./server
COPY --from=build /app/client/build ./client/build

RUN chown -R cnsit:nodejs /app

ENV DATA_DIR=/data
RUN mkdir -p /data && chown cnsit:nodejs /data

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 5000

# Run as root to handle volume mount permissions
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server/src/app.js"]
