# syntax=docker/dockerfile:1
# Build context: repository root (npm workspaces need the root lockfile)

FROM node:24-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
RUN --mount=type=cache,target=/root/.npm npm ci
COPY frontend ./frontend
RUN npm run build --workspace frontend

FROM nginx:1.27-alpine AS runtime
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
