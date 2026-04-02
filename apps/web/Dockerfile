FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
# We need to copy the entire monorepo root structure since Next.js depends on workspace packages
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
# Copy package manifests globally
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/utils/package.json ./packages/utils/
COPY packages/prompts/package.json ./packages/prompts/

RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/web
# Next.js standalone output configuration is assumed in next.config.mjs
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
