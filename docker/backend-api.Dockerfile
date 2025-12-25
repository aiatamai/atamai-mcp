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
COPY packages/backend-api ./packages/backend-api
COPY tsconfig.json .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
WORKDIR /app/packages/backend-api
RUN pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml .
COPY package.json .
COPY pnpm-lock.yaml* .

# Copy packages
COPY packages/backend-api ./packages/backend-api
COPY tsconfig.json .

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/packages/backend-api/dist ./packages/backend-api/dist

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "packages/backend-api/dist/main.js"]
