# --- ETAPA 1: BUILDER ---
FROM node:20-alpine AS builder

# Instalamos las librerías base (OpenSSL 3.0 es la que trae Alpine por defecto)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copiamos solo lo necesario para instalar dependencias primero (mejor uso de caché)
COPY package*.json ./
COPY prisma ./prisma/

# Instalamos dependencias
RUN npm install

# Generamos el cliente de Prisma DENTRO del contenedor Linux
# Esto asegura que use el motor compatible con Alpine (linux-musl-openssl-3.0.x)
RUN npx prisma generate

# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build

# --- ETAPA 2: RUNNER ---
FROM node:20-alpine AS runner

# Es vital tener openssl y libc6-compat también en la etapa de ejecución
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV NODE_ENV=production

# Crear usuario de seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copiamos los archivos compilados y dependencias con los permisos correctos
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# NOTA: No es necesario copiar .prisma por separado si copiamos node_modules completo,
# pero nos aseguramos de que el usuario nestjs sea el dueño de todo.

USER nestjs

EXPOSE 3001

# Si tu archivo principal está en dist/src/main.js, cambia la ruta aquí:
CMD ["node", "dist/main.js"]