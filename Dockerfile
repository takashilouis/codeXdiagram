# Use Node.js as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files for both client and server
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN cd client && npm install
RUN cd server && npm install

# Copy source code
COPY client ./client
COPY server ./server

# Build the React app
RUN cd client && npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
# Make sure to set this when running the container
# ENV GOOGLE_API_KEY=your_google_api_key

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server/server.js"] 