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
COPY packages/web-ui ./packages/web-ui
COPY tsconfig.json .

# Install dependencies
RUN pnpm install

# Build
WORKDIR /app/packages/web-ui
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
COPY packages/web-ui ./packages/web-ui
COPY tsconfig.json .

# Install production dependencies only
RUN pnpm install --prod

# Copy built application and public assets
COPY --from=builder /app/packages/web-ui/.next ./packages/web-ui/.next
COPY --from=builder /app/packages/web-ui/public ./packages/web-ui/public

EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:5000}

WORKDIR /app/packages/web-ui
CMD ["pnpm", "start"]
