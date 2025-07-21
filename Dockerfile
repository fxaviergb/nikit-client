########################################
# Etapa 1: Construcción
########################################
FROM node:18-alpine AS builder

WORKDIR /app

# Recibir variables de entorno en build
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_USE_MOCK
ARG NEXT_PUBLIC_ENABLE_TOKEN_REFRESH

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_USE_MOCK=$NEXT_PUBLIC_USE_MOCK
ENV NEXT_PUBLIC_ENABLE_TOKEN_REFRESH=$NEXT_PUBLIC_ENABLE_TOKEN_REFRESH

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir la aplicación (con variables disponibles)
RUN npm run build

########################################
# Etapa 2: Producción
########################################
FROM node:18-alpine AS runner

WORKDIR /app

# Variables necesarias en runtime (opcional)
ENV NODE_ENV=production

# Copiar archivos de ejecución
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json ./

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "start"]
