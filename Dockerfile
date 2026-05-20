# Build stage - pinned image for reproducible builds
FROM node:20-bookworm-slim AS build

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Fix "Exit handler never called!" npm bug
RUN npm install -g npm@10.9.2

WORKDIR /app

COPY package*.json ./
RUN node -v && npm -v
RUN npm cache clean --force
RUN npm ci --jobs=1 --no-audit --no-fund

COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --jobs=1 --no-audit --no-fund

WORKDIR /app
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm ci --jobs=1 --no-audit --no-fund
RUN test -x ./node_modules/.bin/tsc || (echo "ERROR: tsc not found!" && exit 1)

WORKDIR /app
COPY . .

WORKDIR /app/client
RUN npm run build

# Production stage
FROM node:20-bookworm-slim AS production

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/server ./server
COPY --from=build /app/client/build ./client/build

ENV DATA_DIR=/data
RUN mkdir -p /data

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server/src/app.js"]
