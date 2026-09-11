# ---- deps: install all dependencies with a frozen, audited lockfile ----
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

WORKDIR /app

# Copy lockfile and package config first to leverage Docker cache layers
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy Prisma schema early so it can run during install/generation hooks
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

# ---- build: compile the NestJS application ----
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build

# ---- runtime: slim image, runs as a non-root user ----
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs

# The CMD below calls the Prisma CLI and node directly rather than going
# through `pnpm run` - invoking the package manager at container startup
# (with no lockfile in this stage) makes pnpm think the project needs
# reinstalling, which is slow, depends on network access at boot, and fails
# under this non-root user's permissions. Calling the binaries directly
# avoids the package manager entirely at runtime.
#
# `prisma migrate deploy` needs the Prisma CLI, a devDependency, so the full
# node_modules from the build stage is kept rather than pruned to
# production-only deps. Moving migrations to a separate deploy step would
# let this be pruned in the future.
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

# The app listens on $PORT (defaults to 3000, see src/main.ts)
EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main"]
