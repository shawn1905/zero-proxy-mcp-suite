FROM node:22-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm --quiet set progress=false && npm install --include=dev --audit=false
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-slim

WORKDIR /app
COPY package*.json ./
RUN npm --quiet set progress=false && npm install --omit=dev --audit=false
COPY --from=builder /app/dist ./dist

ENTRYPOINT ["node", "dist/index.js"]
