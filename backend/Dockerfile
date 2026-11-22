# ==========================================
# Etapa 1: Construcción y compilación de TypeScript
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ==========================================
# Etapa 2: Dependencias exclusivas de producción
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ==========================================
# Etapa 3: Imagen final de ejecución (liviana y segura)
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiar solo lo necesario para correr
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/shared/persistence/data/productos.json ./dist/shared/persistence/data/productos.json
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/server.js"]