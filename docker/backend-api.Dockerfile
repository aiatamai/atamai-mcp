# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (bcrypt, etc)
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml* .

# Copy packages
COPY packages/backend-api ./packages/backend-api
COPY tsconfig.json .

# Install dependencies
RUN pnpm install

# Build
WORKDIR /app/packages/backend-api
RUN pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy the entire app with node_modules structure from builder
# This includes all prebuilt native modules (bcrypt, etc)
COPY --from=builder /app .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "packages/backend-api/dist/main.js"]
