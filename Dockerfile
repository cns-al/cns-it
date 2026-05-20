# Build stage
FROM node:20-slim AS build

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

RUN groupadd -g 1001 -r nodejs && useradd -u 1001 -r -g nodejs cnsit

COPY --from=build /app/server/package*.json ./server/
RUN cd server && npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/server/src ./server/src
COPY --from=build /app/client/build ./client/build

RUN chown -R cnsit:nodejs /app

ENV DATA_DIR=/data
RUN mkdir -p /data && chown cnsit:nodejs /data

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server/src/app.js"]
