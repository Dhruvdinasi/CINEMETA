# Multi-stage Dockerfile for CINEMETA Production Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source files
COPY . .

# Build Vite frontend & Bundle Express TypeScript backend using esbuild
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and production node_modules
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled assets and backend server from builder stage
COPY --from=builder /app/dist ./dist

# Expose container port
EXPOSE 3000

# Command to boot node server
CMD ["npm", "start"]
