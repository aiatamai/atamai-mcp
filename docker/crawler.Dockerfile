# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml* .

# Copy packages
COPY packages/crawler-engine ./packages/crawler-engine
COPY tsconfig.json .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
WORKDIR /app/packages/crawler-engine
RUN pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm and other tools for web scraping
RUN npm install -g pnpm && \
    apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-dejavu

# Copy workspace files
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml* .

# Copy packages
COPY packages/crawler-engine ./packages/crawler-engine
COPY tsconfig.json .

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/packages/crawler-engine/dist ./packages/crawler-engine/dist

ENV NODE_ENV=production

CMD ["node", "packages/crawler-engine/dist/index.js"]
