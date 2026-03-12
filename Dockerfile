# 1. builder
FROM oven/bun:1-debian AS base
WORKDIR /app

# install deps
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# build
FROM base AS builder
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN bun run build

# 2. server
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

#serve
CMD ["bun", "x", "serve", "-p", "3000", "-s", "/app/dist"]
