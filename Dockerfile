# 1️⃣ Stage: Build Angular App
FROM node:20 AS build

WORKDIR /app

# Copy dependency files first for cache optimization
COPY package*.json ./

# Install dependencies
RUN npm install -f

# Copy the full project source
COPY . .

# Build configuration: 'production' (default, points to api.recetadigital.uy)
# or 'preprod' (points to apipre.recetadigital.uy via environment.preprod.ts).
ARG CONFIGURATION=production

# Build the Angular project with SSR prerender using the selected configuration
RUN npm run build -- --configuration=$CONFIGURATION

# 2️⃣ Stage: NGINX Server
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY default.conf /etc/nginx/conf.d/

# Copy built Angular app
COPY --from=build /app/dist/qf-recetalia-app/browser /usr/share/nginx/html

# Expose port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost || exit 1

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
