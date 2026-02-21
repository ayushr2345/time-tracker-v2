# ==========================================
# 1. BASE STAGE (Dependencies only)
# ==========================================
FROM node:20-slim AS base
WORKDIR /app
COPY package.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
RUN npm install

# ==========================================
# 2. DEV STAGE (Hot-reloading)
# ==========================================
FROM base AS dev
WORKDIR /app/backend
ARG BACKEND_PORT=5050
ENV BACKEND_PORT=$BACKEND_PORT
EXPOSE $BACKEND_PORT
# Code is mounted via volume in dev mode
CMD ["npm", "run", "dev"]

# ==========================================
# 3. BUILDER STAGE (Compiling TypeScript)
# ==========================================
FROM base AS builder
COPY shared/ ./shared/
COPY backend/ ./backend/
RUN npm run build --workspace=@time-tracker/shared
RUN npm run build --workspace=backend

# ==========================================
# 4. PROD STAGE (Lean Node Runtime)
# ==========================================
FROM node:20-slim AS prod
WORKDIR /app

# Copy the root package.json so the workspace context exists
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy BOTH the dist code AND the package.json for the shared library
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/shared/dist ./shared/dist

# Copy the backend files
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend
ARG BACKEND_PORT=5050
ENV BACKEND_PORT=$BACKEND_PORT
EXPOSE $BACKEND_PORT

# Start the compiled server
CMD ["node", "dist/server.js"]