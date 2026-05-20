# Build stage - only build server dependencies (client is pre-built)
FROM node:20-slim AS build

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm ci
RUN cd server && npm ci

COPY server/src ./server/src

# Production stage
FROM node:20-slim AS production

WORKDIR /app

RUN groupadd -g 1001 -r nodejs && useradd -u 1001 -r -g nodejs cnsit && apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/server/package*.json ./server/
RUN cd server && npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/server/src ./server/src
# Copy pre-built client from build context (built locally before docker build)
COPY client/build ./client/build

RUN chown -R cnsit:nodejs /app

ENV DATA_DIR=/data
RUN mkdir -p /data && chown cnsit:nodejs /data

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 5000

USER cnsit

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server/src/app.js"]
