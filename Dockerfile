# Multi-stage Dockerfile for PulsePaper ($0/month deployment ready)
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/schema.sql ./src/db/schema.sql

EXPOSE 3001

CMD ["node", "dist/server/server/index.js"]
