FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# 1. Copiamos el esquema a una carpeta fija para que npm install genere tipos si hay un script postinstall
COPY panariapos-api/prisma ./prisma/
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
# 2. Traemos node_modules (donde está el binario de prisma)
COPY --from=deps /app/node_modules ./node_modules
# 3. Copiamos todo el proyecto
COPY . .

# --- LA CORRECCIÓN DE RUTA ---
# Como hiciste COPY . . , el esquema está en panariapos-api/prisma/schema.prisma
# Usamos npx prisma@6 para asegurar la versión y la ruta real del archivo
RUN npx prisma@6 generate --schema=./panariapos-api/prisma/schema.prisma

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=https://panariapos.com/api/v1
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
# Crucial para el runtime
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]