# ==========================================
# 1. BASE STAGE (Dependencies only)
# ==========================================
FROM node:20-slim AS base
WORKDIR /app
COPY package.json ./
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/
RUN npm install

# ==========================================
# 2. DEV STAGE (Hot-reloading)
# ==========================================
FROM base AS dev
WORKDIR /app/frontend
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG FRONTEND_PORT=5051
ENV FRONTEND_PORT=$FRONTEND_PORT
EXPOSE $FRONTEND_PORT
# We don't copy code here because docker-compose.dev.yml will mount it as a volume!
CMD ["npm", "run", "dev", "--", "--host"]

# ==========================================
# 3. BUILDER STAGE (Compiling TypeScript/Vite)
# ==========================================
FROM base AS builder
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG FRONTEND_PORT=5051
ENV FRONTEND_PORT=$FRONTEND_PORT
COPY shared/ ./shared/
COPY frontend/ ./frontend/
RUN npm run build --workspace=@time-tracker/shared
RUN npm run build --workspace=frontend

# ==========================================
# 4. PROD STAGE (Nginx Web Server)
# ==========================================
FROM nginx:alpine AS prod
# Copy the compiled static files from the builder stage into Nginx's public folder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
# Nginx runs on port 80 by default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]