# ==============================================================================
# AutoFish web frontend — production image.
#
# Two stages: build the Vite app with Node, then serve the static output with
# nginx. Only the build output (dist/) crosses into the final image — no
# node_modules, no source, no build toolchain in what actually ships.
# ==============================================================================

# ---- build ------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Dependencies first so this layer is cached across builds that only change
# application code.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite loads .env / .env.production automatically for `vite build` (mode
# defaults to "production"); VITE_API_BASE_URL and VITE_IMAGE_SERVER_URL in
# the committed .env are baked into the bundle at this step. No secrets live
# in these values — they're just the public API origin.
RUN npm run build

# ---- serve --------------------------------------------------------------
FROM nginx:1.27-alpine AS serve

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
