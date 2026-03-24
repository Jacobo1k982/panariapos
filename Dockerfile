FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Copiamos el schema a la carpeta estándar /app/prisma
COPY panariapos-api/prisma ./prisma/ 
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- CORRECCIÓN CLAVE ---
# Usamos el binario local y la ruta donde copiamos el schema en el stage 'deps'
RUN ./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma

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
# Crucial para que el servidor de Next.js encuentre los tipos y el motor de Prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]