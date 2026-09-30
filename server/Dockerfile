FROM node:20-alpine AS base
WORKDIR /app

# Install build dependencies if needed
RUN apk add --no-cache libc6-compat

# Copy workspace package manifests
COPY package.json ./
COPY shared/package.json shared/
COPY server/package.json server/

# Install dependencies across monorepo
RUN npm install

# Copy source code
COPY shared shared/
COPY server server/

# Build shared library types
RUN npm run build:shared

WORKDIR /app/server
EXPOSE 4000

ENV NODE_ENV=production
CMD ["node", "src/index.js"]
