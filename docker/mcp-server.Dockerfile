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
COPY packages/mcp-server ./packages/mcp-server
COPY tsconfig.json .

# Install dependencies
RUN pnpm install

# Build
WORKDIR /app/packages/mcp-server
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
COPY packages/mcp-server ./packages/mcp-server
COPY tsconfig.json .

# Install production dependencies only
RUN pnpm install --prod

# Copy built application
COPY --from=builder /app/packages/mcp-server/dist ./packages/mcp-server/dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "packages/mcp-server/dist/index.js"]
