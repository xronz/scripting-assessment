### Stage 1: Build ###
FROM node:23.1.0 AS builder
# Set the working directory
WORKDIR /usr/src/app
# Copy package.json and yarn.lock
COPY package.json yarn.lock  ./
# Install dependencies
RUN yarn install --frozen-lockfile
# Copy the rest of the application code
COPY . .
# Build the TypeScript application
RUN yarn build

### Stage 2: Production ###
FROM node:23.1.0-slim
# Set environment variable for production
ENV NODE_ENV=production
USER node
# Set the working directory
WORKDIR /usr/src/app
# Copy only the necessary files from the builder stage
COPY --from=builder /usr/src/app/yarn.lock  ./
COPY --from=builder /usr/src/app/package.json ./
# Install only production dependencies
RUN yarn install --production --frozen-lockfile
# Fxied -> Error: Cannot find module './src/client'
COPY --from=builder /usr/src/app/build ./src 
COPY --from=builder /usr/src/app/index.js ./ 
# Expose the application port (change if needed)
EXPOSE 5338

# Start the application
CMD ["node", "index.js"]