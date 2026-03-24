FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Copiamos el esquema para que el install pueda generar tipos si es necesario
COPY panariapos-api/prisma ./prisma/ 
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
# --- CAMBIO AQUÍ: Usamos .ts ---
COPY next.config.ts ./  
COPY tailwind.config.ts ./
COPY src ./src
COPY public ./public
# Volvemos a copiar el esquema a la ruta que espera el comando generate
COPY panariapos-api/prisma ./panariapos-api/prisma 

# Generamos prisma antes del build (Forzamos v6 para evitar P1012)
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