FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY scripts ./scripts
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p /app/generated /app/uploads \
    && chown -R node:node /app \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

USER node
EXPOSE 4000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
