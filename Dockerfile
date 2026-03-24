FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Copiamos la carpeta de prisma para generar el cliente
COPY panariapos-api/prisma ./panariapos-api/prisma
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copiamos solo lo que Next.js necesita para el build
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.mjs ./
COPY tailwind.config.ts ./
COPY src ./src
COPY public ./public
COPY panariapos-api/prisma ./panariapos-api/prisma

# Generamos prisma antes del build
RUN npx prisma@6 generate --schema=./panariapos-api/prisma/schema.prisma

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]