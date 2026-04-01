# Stage 1: Build the Angular app
# Changed from 18 to 22 to satisfy Angular CLI requirements
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the project for production
RUN npm run build -- --configuration=production

# Stage 2: Serve the app using Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy the build output from the 'build' stage
# Check if your dist folder uses /browser or just /tiny-url-client
COPY --from=build /app/dist/tiny-url-client/browser .

# Copy your nginx.conf (Ensure this file is named nginx.conf in your folder)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]