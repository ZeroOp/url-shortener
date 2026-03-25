# Use official Node image
FROM node:20-alpine

# Set workdir
WORKDIR /app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Compile TypeScript
RUN npm run build   # this will generate /app/dist

# Set start command
CMD ["node", "dist/index.js"]