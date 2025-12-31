FROM node:20-alpine

WORKDIR /app

# Install server dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Install and build client
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client ./client
RUN cd client && npm run build

# Copy server files
COPY server.js ./

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]
