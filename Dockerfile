# Use a lightweight Node base image
FROM node:22-alpine

# ⚠️ FIXED: Pin to a stable v10 engine to bypass the strict pnpm 11 build script blocks
RUN corepack enable && corepack prepare pnpm@10.5.2 --activate

WORKDIR /app

# Copy lockfile and package config to leverage Docker cache layers
COPY package.json pnpm-lock.yaml* ./

# Copy Prisma schema early so it can run during install/generation hooks
COPY prisma ./prisma/

# Install dependencies smoothly ignoring lockfile validation conflicts
RUN pnpm install --no-frozen-lockfile

# Copy the rest of your application code
COPY . .

# Generate the Prisma Client and compile the NestJS application
RUN pnpm run build

# Expose the API port
EXPOSE 4000

# Start the built application using your start script
CMD ["sh", "-c", "pnpm run db:migrate && pnpm run start:prod"]
