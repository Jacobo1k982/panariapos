FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Copiamos el schema antes de instalar para que Prisma pueda autogenerarse si hay un postinstall
COPY panariapos-api/prisma ./prisma/ 
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- ESTA ES LA CLAVE ---
# Generamos el cliente de Prisma antes del build de Next.js
# Ajusta la ruta al schema según tu estructura (parece que está en panariapos-api/prisma/schema.prisma)
RUN npx prisma generate --schema=./panariapos-api/prisma/schema.prisma

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=https://panariapos.com/api/v1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Importante: Si usas standalone, Next.js necesita los archivos generados de Prisma en el runner
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copiamos las dependencias generadas de prisma al runner (necesario para el runtime)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]