FROM node:20-alpine

# Set up the application directory
RUN mkdir /app && chown node:node /app
WORKDIR /app

# Copy only files needed for install and build
COPY package*.json /app/

# Install production dependencies
RUN npm ci --omit=dev

# Copy the rest of the application source code
COPY . /app

# Build the project (adjust if using a different build command)
RUN npm run build

# Ensure correct permissions
RUN chown -R node:node /app

# Switch to the non-root user
USER node

# Start the application
CMD ["node", "/app/dist/server.js"]
