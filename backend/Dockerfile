# -------------------------
# STAGE 1: Builder
# -------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies needed for node-gyp and Prisma
RUN apk add --no-cache python3 make g++ openssl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY src/config/prisma.ts ./src/config/
COPY prisma ./prisma/

# Install dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# -------------------------
# STAGE 2: Production
# -------------------------
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built artifacts and Prisma client from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Add a non-root user and change ownership
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs
RUN chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["node", "dist/server.js"]
